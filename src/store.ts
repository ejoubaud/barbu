import create from "zustand";
import produce from "immer";

import { shuffleAndDealSortedHands, Hand, Card } from "./deck";

export type Hands = Map<PlayerId, Hand>
export type RoomId = string;
export type RoomIdSetter = (roomId: RoomId) => void;
export type PlayerId = string;
export type PlayerIdSetter = (playerName: PlayerId) => void;
export type PlayerSetter = (player: Player) => void;
export type Player = { name: PlayerId };
export type Players = Map<PlayerId, Player>;
export type Table = Card[];

type StoreState = {
  hands: Hands;
  table: Table;

  isHost: boolean;
  makeHost: () => void;

  roomId: RoomId;
  setRoomId: RoomIdSetter;

  myPlayer: PlayerId;
  setMyPlayer: PlayerIdSetter;
  players: Players;
  playersOrder: PlayerId[];
  addPlayer: PlayerSetter;
  removePlayer: PlayerIdSetter;
};

export const [useStore] = create<StoreState>(set => ({
  hands: new Map(),
  table: [],

  isHost: false,
  makeHost: () => set({ isHost: true }),

  roomId: "",
  setRoomId: roomId => set({ roomId }),

  myPlayer: "",
  setMyPlayer: name => set({ myPlayer: name }),
  players: new Map(),
  playersOrder: [],
  addPlayer: player =>
    set(
      produce(({ players, playersOrder }) => {
        players.set(player.name, player);
        playersOrder.push(player);
      })
    ),
  removePlayer: playerName =>
    set(
      produce(({ players, playersOrder }) => {
        players.delete(playerName);
        playersOrder.splice(playersOrder.indexOf(playerName), 1);
      })
    )
}));

export const getMyHand = ({ hands, myPlayer, players }: StoreState): Hand =>
  // TODO cache this in the future
  shuffleAndDealSortedHands(players.size).reduce((hands, hand, idx) => (
    hands.set(Array.from(players.keys())[idx], hand)
  ), new Map()).get(myPlayer);
export const useRoomId = ({
  roomId,
  setRoomId
}: StoreState): [RoomId, RoomIdSetter] => [roomId, setRoomId];
export const getMakeHost = ({ makeHost }: StoreState) => makeHost;
export const useMyPlayer = ({
  myPlayer,
  setMyPlayer,
  addPlayer
}: StoreState): [PlayerId, PlayerIdSetter, PlayerSetter] => [
  myPlayer,
  setMyPlayer,
  addPlayer
];
