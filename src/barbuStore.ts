// the local store for a given player/client of specific game Barbu
import createStore from "zustand";

import { notNull } from "./common";
import { playerStore, getGame } from "./playerStore";
import { sumSheets, PlayerGameState, BarbuEvent } from "./barbu";

type BarbuStoreState = {
  gameState: PlayerGameState;
  lastEvent: BarbuEvent;
};

const initGame = getGame(playerStore.getState());
export const [useBarbuStore, barbuStore] = createStore<BarbuStoreState>(
  set => ({
    gameState: initGame.gameState as PlayerGameState,
    lastEvent: initGame.lastGameEvent as BarbuEvent
  })
);

playerStore.subscribe(
  notNull(({ gameState, lastGameEvent }) => {
    barbuStore.setState({
      gameState: gameState as PlayerGameState,
      lastEvent: lastGameEvent as BarbuEvent
    });
  }),
  getGame
);

export const getMyHand = ({ gameState }: BarbuStoreState) => gameState.myHand;
export const getMyName = ({ gameState }: BarbuStoreState) => gameState.myName;
export const getCurrentPlayer = ({ gameState }: BarbuStoreState) =>
  gameState.currentPlayer;
export const getCurrentTrick = ({ gameState }: BarbuStoreState) =>
  gameState.currentTrick;
export const getCurrentContract = ({ gameState }: BarbuStoreState) =>
  gameState.currentContract;
export const getPlayers = ({ gameState }: BarbuStoreState) => gameState.players;
export const getPlayerTricks = ({ gameState }: BarbuStoreState) =>
  gameState.playerTricks;
export const getPlayerHandSizes = ({ gameState }: BarbuStoreState) =>
  gameState.playerHandSizes;
export const getTotalScoreSheet = ({ gameState }: BarbuStoreState) =>
  sumSheets(gameState.contractScoreSheets);
