// the local store for a given player/client
import createStore from "zustand";

import { Hand as ImportedHand } from "./deck";
import { PlayerId as ImportedPlayerId, RoomId, GameStarter } from "./common";
import { Client, nullClient } from "./client";

type Err = string;
export type PlayerId = ImportedPlayerId;
export type Hand = ImportedHand;

type PlayerStoreState = {
  client: Client;
  startGame: GameStarter | null;
  roomId: RoomId;
  players: PlayerId[];
  myName: PlayerId;
  nameError: Err;
};

export const [useStore, store] = createStore<PlayerStoreState>(set => ({
  client: nullClient,
  startGame: null,
  roomId: "",
  players: [],
  myName: "",
  nameError: "",
}));

export const setClient = (roomId: RoomId, client: Client) => store.setState({ client, roomId });
export const getClient = ({ client }: PlayerStoreState) => client
export const getRoomId = ({ roomId }: PlayerStoreState) => roomId
export const setGameStarter = (startGame: GameStarter) =>  store.setState({ startGame })
export const isHost = () => ({ startGame }: PlayerStoreState) => !!startGame;

export const getMyName = ({ myName }: PlayerStoreState): PlayerId => myName;

export const setNameError = (nameError: Err) =>
  store.setState({ nameError, myName: "" });
export const setMyName = (myName: PlayerId) => store.setState({ myName });

export const setPlayers = (players: PlayerId[]) => store.setState({ players });
export const getPlayers = ({ players }: PlayerStoreState) => players;

export const getMyHand = (store: PlayerStoreState) => ([])
