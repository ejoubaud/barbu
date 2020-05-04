import produce from "immer";

import {
  PlayerId,
  GameEvent as CommonGameEvent,
  PlayerGameState as CommonPlayerGameState,
  Action,
  ActionResult,
  ActionProcessor,
  GameStarter,
  PlayerStateMapper
} from "./common";

import {
  Card,
  Color,
  Hand,
  shuffleAndDealFor,
  hasColor,
  findCard,
  removeCard
} from "./deck";

type Move = { player: PlayerId; card: Card };
const Move = (player: PlayerId, card: Card): Move => ({ player, card });

type Trick = Move[];
type PlayerHands = { [PlayerId: string]: Hand };

const trickWinner = (trick: Trick): PlayerId => {
  const winnerMove = trick.reduce((winnerMove, move) => {
    const highCard = winnerMove.card;
    const { card } = move;
    if (card.color === highCard.color && card.value > highCard.value) {
      return move;
    } else {
      return winnerMove;
    }
  }, trick[0]);
  return winnerMove.player;
};

type ContractName = string;
type Contract = { name: ContractName; scorer: ContractScorer };
type ContractScorer = (tricks: Trick[]) => (sheet: ScoreSheet) => ScoreSheet;
type Score = number;
type ScoreSheet = { [PlayerId: string]: Score };
const newContract = (name: ContractName, scorer: ContractScorer): Contract => ({
  name,
  scorer
});
const newSheet = (players: PlayerId[] = []): ScoreSheet =>
  players.reduce((sheet, playerId) => ({ ...sheet, [playerId]: 0 }), {});

type CardChecker = (card: Card) => boolean;
const isHeart: CardChecker = ({ color }) => color === Color.Hearts;
const isQueen: CardChecker = ({ value }) => value === 12;
const isBarbu: CardChecker = ({ color, value }) =>
  color === Color.Spades && value === 13;

type TrickScorer = (trick: Trick) => Score;
const eachTrick = (
  scoreTrick: TrickScorer
): ContractScorer => tricks => sheet =>
  tricks.reduce(
    (sheet, trick) => addToSheet(sheet, trickWinner(trick), scoreTrick(trick)),
    sheet
  );
const lastTrick = (
  scoreTrick: TrickScorer
): ContractScorer => tricks => sheet => {
  const lastTrick = tricks[tricks.length - 1];
  return addToSheet(sheet, trickWinner(lastTrick), scoreTrick(lastTrick));
};
const allScorers = (
  scorers: ContractScorer[]
): ContractScorer => tricks => sheet =>
  scorers.reduce((sheet, scoreTrick) => scoreTrick(tricks)(sheet), sheet);
const addToSheet = (
  sheet: ScoreSheet,
  player: PlayerId,
  score: Score
): ScoreSheet => ({ ...sheet, [player]: score + (sheet[player] || 0) });

type CardScorer = (checker: CardChecker, score: Score) => TrickScorer;
const eachCard: CardScorer = (
  checker: CardChecker,
  score: Score
): TrickScorer => trick =>
  trick.reduce((sum, { card }) => sum + (checker(card) ? score : 0), 0);

const TricksContract: Contract = newContract(
  "Plis",
  eachTrick(() => 5)
);
const HeartsContract: Contract = newContract(
  "Coeurs",
  eachTrick(eachCard(isHeart, 5))
);
const QueensContract: Contract = newContract(
  "Dames",
  eachTrick(eachCard(isQueen, 20))
);
const BarbuContract: Contract = newContract(
  "Barbu",
  eachTrick(eachCard(isBarbu, 50))
);
const LastTrickContract: Contract = newContract(
  "Roi de pique",
  lastTrick(() => 50)
);
const SaladeContract: Contract = newContract(
  "Salade",
  allScorers(
    [
      TricksContract,
      HeartsContract,
      QueensContract,
      BarbuContract,
      LastTrickContract
    ].map(c => c.scorer)
  )
);

const contracts = [
  TricksContract,
  HeartsContract,
  QueensContract,
  BarbuContract,
  LastTrickContract,
  SaladeContract
];

enum Err {
  NotTheirTurn = "Pas ton tour",
  IllegalMove = "Interdit",
  IllegalColor = "Couleur interdite",
  NotInHand = "Carte indisponible",
  TrickOver = "Le pli est fini",
  GameOver = "La partie est finie",
  None = "Pas de soucis"
}

export type GameState = {
  players: PlayerId[];
  hands: PlayerHands;
  tricks: Trick[];
  currentTrick: Trick;
  currentPlayer: number;
  currentContract: number;
  contractScoreSheets: ScoreSheet[];
};
const newGameState = (): GameState => ({
  players: [],
  hands: {},
  tricks: [],
  currentTrick: [],
  currentPlayer: 0,
  currentContract: 0,
  contractScoreSheets: []
});

type HiddenHand = [PlayerId, number];
const HiddenHand = (playerId: PlayerId, hand: Hand): HiddenHand => [
  playerId,
  hand.length
];

export type PlayerGameState = CommonPlayerGameState & {
  players: PlayerId[];
  hands: HiddenHand[];
  myHand: Hand;
  tricks: Trick[];
  currentTrick: Trick;
  currentPlayer: PlayerId;
  currentContract: ContractName | null | undefined;
  contractScoreSheets: ScoreSheet[];
};
// needs to be JSONable to send via server
export const gameStateForPlayer: PlayerStateMapper = (commonState, player) => {
  // TODO: Find a more gracious way to handle this when we have more than 1 game
  const state = commonState as GameState;
  return {
    players: state.players,
    hands: state.players.map(p => HiddenHand(p, state.hands[p])),
    myHand: state.hands[player],
    tricks: state.tricks,
    currentTrick: state.currentTrick,
    currentPlayer: state.players[state.currentPlayer],
    currentContract:
      contracts[state.currentContract] && contracts[state.currentContract].name,
    contractScoreSheets: state.contractScoreSheets
  };
};

enum EventType {
  GameStarted = "GameStarted",
  Rejected = "Rejected",
  Played = "Played",
  TrickEnded = "TrickEnded",
  ContractEnded = "ContractEnded",
  GameEnded = "GameEnded"
}
export interface BarbuEvent extends CommonGameEvent {
  type: EventType;
}
type EventProcessor<T extends BarbuEvent> = (
  event: T
) => (state: GameState) => GameState;
type EventCreator = (payload: EventPayload) => Event;
type EventPayload = any;

interface GameStarted extends BarbuEvent {
  players: PlayerId[];
  hands: PlayerHands;
}
const GameStarted = (players: PlayerId[]): GameStarted => ({
  type: EventType.GameStarted,
  players,
  hands: deal(players)
});
const deal = (players: PlayerId[]): PlayerHands => {
  const handsList = shuffleAndDealFor(players.length);
  return players.reduce(
    (hands, playerId, idx) => ({ ...hands, [playerId]: handsList[idx] }),
    {}
  );
};
const processGameStarted: EventProcessor<GameStarted> = ({
  players,
  hands
}: GameStarted) => state => ({
  ...state,
  players,
  hands
});

interface Rejected extends BarbuEvent {
  err: Err;
}
const Rejected = (err: Err): Rejected => ({ type: EventType.Rejected, err });
export const isError = (event: CommonGameEvent): event is Rejected =>
  event.type === EventType.Rejected;
export const errorMessage = ({ err }: Rejected): string => err;

interface Played extends BarbuEvent {
  move: Move;
}
const Played = (move: Move): Played => ({
  type: EventType.Played,
  move
});
const processPlayed: EventProcessor<Played> = ({ move }) =>
  produce(state => {
    state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
    state.currentTrick.push(move);
    const hand = state.hands[move.player];
    state.hands[move.player] = removeCard(hand, move.card);
  });

interface TrickEnded extends BarbuEvent {
  trick: Trick;
}
const TrickEnded = (trick: Trick): TrickEnded => ({
  type: EventType.TrickEnded,
  trick
});
const processTrickEnded: EventProcessor<TrickEnded> = ({ trick }) =>
  produce(s => {
    const winner = trickWinner(trick);
    s.currentPlayer = s.players.indexOf(winner);
    s.tricks.push(trick);
    s.currentTrick = [];
  });
const isTrickEnd = ({ currentTrick, players }: GameState) =>
  currentTrick.length === players.length;

interface ContractEnded extends BarbuEvent {
  tricks: Trick[];
}
const ContractEnded = (tricks: Trick[]): ContractEnded => ({
  type: EventType.ContractEnded,
  tricks
});
const processContractEnded: EventProcessor<ContractEnded> = ({ tricks }) =>
  produce(s => {
    const contract = contracts[s.currentContract];
    const scoreSheet = contract.scorer(tricks)(newSheet());
    s.contractScoreSheets.push(scoreSheet);
    s.currentContract += 1;
    s.hands = deal(s.players);
  });
// TODO: Add EventPredicate<T extends Event> interface?
const isContractEnd = ({ hands }: GameState) =>
  Object.values(hands).every(h => h.length === 0);

interface GameEnded extends BarbuEvent {}
const GameEnded = (): GameEnded => ({ type: EventType.GameEnded });
const isGameEnd = ({ currentContract }: GameState) =>
  currentContract >= contracts.length;
export const isGameOver = (event: CommonGameEvent) =>
  event.type === EventType.GameEnded;

const trickColor = (t: Trick): Color => t[0].card.color;
export const canPlay = (
  { playerId, cards }: Action,
  {
    players,
    currentPlayer,
    currentTrick,
    hands,
    contractScoreSheets
  }: GameState
): [boolean, Err] => {
  if (playerId !== players[currentPlayer]) return [false, Err.NotTheirTurn];
  if (cards.length > 1) return [false, Err.IllegalMove];
  const card = cards[0];
  const playerHand = hands[playerId];
  if (currentTrick.length > 0) {
    const trickCol = trickColor(currentTrick);
    if (trickCol !== card.color && hasColor(playerHand, trickCol)) {
      return [false, Err.IllegalColor];
    }
  }
  if (currentTrick.length >= players.length) return [false, Err.TrickOver];
  if (!findCard(playerHand, card)) return [false, Err.NotInHand];
  if (contractScoreSheets.length >= contracts.length)
    return [false, Err.GameOver];
  return [true, Err.None];
};

export const start: GameStarter = players => {
  const gameStartedEvent: GameStarted = GameStarted(players);
  const initialState: GameState = processGameStarted(gameStartedEvent)(
    newGameState()
  );

  let state: GameState = initialState;

  const play: ActionProcessor = action => {
    const [event, newState] = ((oldState): ActionResult => {
      let state = oldState;
      let [success, error] = canPlay(action, oldState);
      if (!success) return [Rejected(error), oldState];

      const move = Move(action.playerId, action.cards[0]);
      const playedEvent = Played(move);
      state = processPlayed(playedEvent)(oldState);
      if (!isTrickEnd(state)) return [playedEvent, state];

      const trickEndedEvent = TrickEnded(state.currentTrick);
      state = processTrickEnded(trickEndedEvent)(state);
      if (!isContractEnd(state)) return [trickEndedEvent, state];

      const contractEndedEvent = ContractEnded(state.tricks);
      state = processContractEnded(contractEndedEvent)(state);
      if (!isGameEnd(state)) return [contractEndedEvent, state];

      return [GameEnded(), state];
    })(state);
    state = newState as GameState;
    return [event, newState];
  };

  return [play, gameStartedEvent, state];
};

export default start;
