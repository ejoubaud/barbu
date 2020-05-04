// the local store for a given player/client
import createStore from "zustand";

import { Hand as ImportedHand } from "./deck";
import {
  PlayerId as ImportedPlayerId,
  RoomId,
  ServerGameStarter,
  GameEvent,
  PlayerGameState,
  nullPlayerGameState,
  nullGameEvent
} from "./common";
import { Client, nullClient } from "./client";

export type PlayerId = ImportedPlayerId;
export type Hand = ImportedHand;

export type PlayerStoreState = {
  client: Client;
  startGame: ServerGameStarter | null;
  roomId: RoomId;
  players: PlayerId[];
  myName: PlayerId;
  error: string;
  gameStarted: boolean;
  gameState: PlayerGameState;
  lastGameEvent: GameEvent;
};

export const [useStore, store] = createStore<PlayerStoreState>(set => ({
  client: nullClient,
  startGame: null,
  roomId: "",
  players: [],
  myName: "",
  error: "",
  gameStarted: false,
  gameState: nullPlayerGameState,
  lastGameEvent: nullGameEvent
}));

export const setClient = (roomId: RoomId, client: Client) =>
  store.setState({ client, roomId });
export const getClient = ({ client }: PlayerStoreState) => client;
export const getRoomId = ({ roomId }: PlayerStoreState) => roomId;
export const setGameStarter = (startGame: ServerGameStarter) =>
  store.setState({ startGame });
export const getGameStarter = ({ startGame }: PlayerStoreState) => startGame;

export const getMyName = ({ myName }: PlayerStoreState): PlayerId => myName;

export const setError = (error: string) => store.setState({ error });
export const getError = ({ error }: PlayerStoreState) => error;

export const setPlayers = (myName: PlayerId, players: PlayerId[]) =>
  store.setState({ myName, players });
export const getPlayers = ({ players }: PlayerStoreState) => players;

export const setGameEvent = (
  gameStarted: boolean,
  lastGameEvent: GameEvent,
  gameState: PlayerGameState
) => store.setState({ gameStarted, lastGameEvent, gameState });

export const getGame = ({ gameState, lastGameEvent }: PlayerStoreState) => ({
  gameState,
  lastGameEvent
});
export const getGameStarted = ({ gameStarted }: PlayerStoreState) =>
  gameStarted;
