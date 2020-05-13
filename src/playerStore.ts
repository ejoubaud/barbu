// the local store for a given player/client, generic for any game
import createStore from "zustand";

import {
  nullPlayerGameState,
  nullGameEvent,
  PlayerId,
  RoomId,
  ServerGameStarter,
  GameEvent,
  PlayerGameState,
  SavedGame
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
  connected: boolean;
  gameState: PlayerGameState;
  lastGameEvent: GameEvent;
  savedGame?: SavedGame;
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
    connected: false,
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
export const setSavedGame = (savedGame: SavedGame) =>
  playerStore.setState({ savedGame });
export const getSavedGame = ({ savedGame }: PlayerStoreState) => savedGame;
export const removeSavedGame = () =>
  playerStore.setState({ savedGame: undefined });

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
