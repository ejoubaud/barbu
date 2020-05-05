// the local store for a given player/client, generic for any game
import createStore from "zustand";

import {
  PlayerId,
  RoomId,
  ServerGameStarter,
  GameEvent,
  PlayerGameState,
  nullPlayerGameState,
  nullGameEvent
} from "./common";
import { Client, nullClient } from "./client";

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

export const [usePlayerStore, playerStore] = createStore<PlayerStoreState>(
  set => ({
    client: nullClient,
    startGame: null,
    roomId: "",
    players: [],
    myName: "",
    error: "",
    gameStarted: false,
    gameState: nullPlayerGameState,
    lastGameEvent: nullGameEvent
  })
);

export const setClient = (roomId: RoomId, client: Client) =>
  playerStore.setState({ client, roomId });
export const getClient = ({ client }: PlayerStoreState) => client;

export const getRoomId = ({ roomId }: PlayerStoreState) => roomId;

export const setGameStarter = (startGame: ServerGameStarter) =>
  playerStore.setState({ startGame });
export const getGameStarter = ({ startGame }: PlayerStoreState) => startGame;

export const getMyName = ({ myName }: PlayerStoreState): PlayerId => myName;

export const setError = (error: string) => playerStore.setState({ error });
export const getError = ({ error }: PlayerStoreState) => error;

export const setPlayers = (myName: PlayerId, players: PlayerId[]) =>
  playerStore.setState({ myName, players });
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
