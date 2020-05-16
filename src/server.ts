import createStore from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";

import { Card } from "./deck";

import {
  PlayerId,
  RoomId,
  ClientId,
  Cmd,
  Evt,
  notNull,
  nullGameEvent,
  nullGameState,
  nullActionProcessor,
  GameEvent,
  GameState,
  Action,
  ActionProcessor,
  ActionResult
} from "./common";

import createNetworkServer, { NetworkSender } from "./networkServer";

import startBarbu, { isError, isGameOver, gameStateForPlayer } from "./barbu";

const idCharacters = "abcdefghijkmnopqrstuvwxyz123456789";
export const newRoomId: () => RoomId = () =>
  Array.from(Array(8))
    .map(() =>
      idCharacters.charAt(Math.floor(Math.random() * idCharacters.length))
    )
    .join("");

type Server = [RoomId, ServerGameStarter];
type Client = {
  clientId: ClientId;
  send: NetworkSender;
};

type ServerState = {
  players: PlayerId[];
  offline: PlayerId[];
  clients: { [playerId: string]: Client };
  gameStarted: boolean;
  gameEnded: boolean;
  gameState: GameState;
  lastGameEvent: GameEvent;
  playTurn: ActionProcessor;
};

type SavedGame = {
  roomId: RoomId;
  lastEvent: GameEvent;
  gameState: GameState;
  players: PlayerId[];
};

export const savedGame = () => {
  if (!window.localStorage) return;
  const savedJson = window.localStorage.getItem("savedGame");
  if (!savedJson) return;
  return JSON.parse(savedJson) as SavedGame;
};

export type ServerGameStarter = (savedGame?: SavedGame) => void;
export type ServerStarter = (roomId?: RoomId) => Promise<Server>;
const createServer: ServerStarter = async (roomId = newRoomId()) => {
  const [, store] = createStore<ServerState>(set => ({
    players: [],
    offline: [],
    clients: {},
    gameStarted: false,
    gameEnded: false,
    gameState: nullGameState,
    lastGameEvent: nullGameEvent,
    playTurn: nullActionProcessor
  }));

  const saveGame = ([lastEvent, gameState]: ActionResult) => {
    if (!window.localStorage) return;
    const { players } = store.getState();
    window.localStorage.setItem(
      "savedGame",
      JSON.stringify({ roomId, lastEvent, gameState, players } as SavedGame)
    );
  };

  const clearGame = () => {
    if (!window.localStorage) return;
    window.localStorage.clear();
  };

  const play = (name: PlayerId, cards: Card[], reply: NetworkSender) => {
    const { playTurn } = store.getState();

    const action = Action(name, cards);
    const [lastGameEvent, gameState] = playTurn(action);
    saveGame([lastGameEvent, gameState]);

    if (isError(lastGameEvent))
      return reply(errorResponse(Evt.ActionError, lastGameEvent.err));

    const gameEnded = isGameOver(lastGameEvent);
    if (gameEnded) clearGame();
    store.setState({
      gameEnded,
      lastGameEvent,
      gameState
    });
  };

  store.subscribe(
    notNull(function broadcastNames({ players, clients }) {
      console.log("broadcasting players ", players, clients);
      Object.entries(clients).forEach(([playerId, { send }]) => {
        send({
          type: Evt.PlayersUpdated,
          players,
          playerId
        });
      });
    }),
    ({ players, clients }: ServerState) => ({ players, clients }),
    shallow
  );

  store.subscribe(
    notNull(function broadcastEvents({
      lastGameEvent,
      clients,
      gameState,
      gameStarted
    }) {
      console.log("broadcasting event", lastGameEvent, gameState, clients);
      if (!gameStarted) return;
      Object.entries(clients).forEach(([playerId, { send }]) => {
        send({
          type: Evt.GameEvent,
          event: lastGameEvent,
          state: gameStateForPlayer(gameState, playerId),
          gameStarted
        });
      });
    }),
    ({ lastGameEvent, clients, gameState, gameStarted }: ServerState) => ({
      lastGameEvent,
      clients,
      gameState,
      gameStarted
    }),
    shallow
  );

  const validateName = (
    name: PlayerId,
    previousClientId: ClientId
  ): [true] | [false, string] => {
    if (!name.trim()) return [false, "Nom vide"];
    const { players, offline, clients, gameStarted } = store.getState();
    if (gameStarted) {
      if (players.includes(name)) {
        if (clients[name] && previousClientId === clients[name].clientId) {
          // force-reconnect with new clientId if they know the old one,
          // even if we didn't notice they had disconnected
          return [true];
        } else if (!offline.includes(name)) {
          return [false, `${name} est encore connecté(e)`];
        }
      } else if (offline.length > 0) {
        // it might be a player trying to reconnect with the wrong name
        return [
          false,
          "Le jeu a déja commencé. Nom exact requis pour reconnexion."
        ];
      } else {
        // it's probably a player who's late to the game
        return [false, "Le jeu a déja commencé"];
      }
    } else if (clients[name]) {
      return [false, "Nom déja pris."];
    }
    return [true];
  };

  const errorResponse = (type: Evt, message: string) => ({ type, message });

  const addPlayer = (
    name: PlayerId,
    clientId: ClientId,
    send: NetworkSender
  ) => {
    const { players, clients, offline } = store.getState();
    store.setState({
      players: players.includes(name) ? players : players.concat(name),
      clients: { ...clients, [name]: { clientId, send } },
      offline: offline.filter(p => p !== name)
    });
  };

  const flagOffline = (name: PlayerId) => {
    store.setState(
      produce(store.getState(), ({ clients, offline }) => {
        clients[name].send = () => {};
        offline.push(name);
      })
    );
  };

  const deleteClient = (name: PlayerId) => {
    store.setState(
      produce(store.getState(), state => {
        state.players = state.players.filter(p => p !== name);
        delete state.clients[name];
      })
    );
  };

  await createNetworkServer(
    roomId,
    (clientId, send, onRequest, onDisconnect) => {
      let playerId: PlayerId;

      onRequest((message: any) => {
        if (message.cmd === Cmd.SetName) {
          if (playerId) return;
          const { name, previousClientId } = message;
          const [isValid, err] = validateName(message.name, previousClientId);
          if (isValid) {
            playerId = name;
            addPlayer(name, clientId, send);
          } else {
            send(errorResponse(Evt.NameError, err as string));
          }
        } else if (message.cmd === Cmd.Play) {
          play(playerId, message.cards, send);
        }
      });

      onDisconnect(() => {
        if (!playerId) return;
        const { gameStarted } = store.getState();
        if (gameStarted) return flagOffline(playerId);
        deleteClient(playerId);
      });
    },
    // TODO: Handle this
    err => {}
  );

  const startGame: ServerGameStarter = savedGame => {
    const { gameStarted } = store.getState();
    if (gameStarted)
      return console.log("Tried to start an already started game");

    if (savedGame) {
      // loading previous game
      const { players, lastEvent, gameState } = savedGame;
      store.setState({ players, offline: players });
      const [playTurn, lastGameEvent, newState] = startBarbu(players, [
        lastEvent,
        gameState
      ]);
      store.setState({
        gameStarted: true,
        lastGameEvent,
        gameState: newState,
        playTurn
      });
    } else {
      const { players } = store.getState();
      const [playTurn, lastGameEvent, gameState] = startBarbu(players);
      store.setState({ gameStarted: true, lastGameEvent, gameState, playTurn });
    }
  };

  return [roomId, startGame];
};

export default createServer;
