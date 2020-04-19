import create from "zustand";

import { shuffleAndDealSortedHands, Hand, Card } from "./deck";

const players = 4;

export type Player = number;
export type Table = Card[];

type StoreState = {
  hands: Hand[];
  myPlayer: Player;
  table: Table;
};

export const [useStore] = create<StoreState>(set => ({
  hands: shuffleAndDealSortedHands(players),
  myPlayer: 0,
  table: []
}));

export const getMyHand = (state: StoreState) => state.hands[state.myPlayer];
