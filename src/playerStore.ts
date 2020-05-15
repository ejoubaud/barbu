// the local store for a given player/client, generic for any game
import createStore from "zustand";

import {
  nullPlayerGameState,
  nullGameEvent,
  PlayerId,
  RoomId,
  GameEvent,
  PlayerGameState
} from "./common";
import { Client, nullClient } from "./client";

export type PlayerStoreState = {
  client: Client;
  roomId: RoomId;
  players: PlayerId[];
  myName: PlayerId;
  error: string;
  gameStarted: boolean;
  connected: boolean;
  gameState: PlayerGameState;
  lastGameEvent: GameEvent;
};

export const [usePlayerStore, playerStore] = createStore<PlayerStoreState>(
  set => ({
    client: nullClient,
    roomId: "",
    players: [],
    myName: "",
    error: "",
    gameStarted: false,
    connected: false,
    gameState: nullPlayerGameState,
    lastGameEvent: nullGameEvent
  })
);

export const setClient = (roomId: RoomId, client: Client) =>
  playerStore.setState({ client, roomId });
export const getClient = ({ client }: PlayerStoreState) => client;

export const getRoomId = ({ roomId }: PlayerStoreState) => roomId;

export const getMyName = ({ myName }: PlayerStoreState): PlayerId => myName;

export const setError = (error: string) => playerStore.setState({ error });
export const getError = ({ error }: PlayerStoreState) => error;

export const setPlayers = (myName: PlayerId, players: PlayerId[]) =>
  playerStore.setState({ myName, players, error: "" });
export const getPlayers = ({ players }: PlayerStoreState) => players;

export const setGameEvent = (
  gameStarted: boolean,
  lastGameEvent: GameEvent,
  gameState: PlayerGameState
) => playerStore.setState({ gameStarted, lastGameEvent, gameState, error: "" });

export const getGame = ({ gameState, lastGameEvent }: PlayerStoreState) => ({
  gameState,
  lastGameEvent
});
export const getGameStarted = ({ gameStarted }: PlayerStoreState) =>
  gameStarted;

export const getConnected = ({ connected }: PlayerStoreState) => connected;
export const setConnected = (connected: boolean) =>
  playerStore.setState({ connected });
