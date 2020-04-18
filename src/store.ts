import create from "zustand";

import { shuffle, fullFor } from "./deck";

const startGame = (players: number): void => {
  const deck = shuffle(fullFor(players));
};

type StoreState = {
  count: number,
  increase: () => void,
  reset: () => void,
}

const [useStore] = create<StoreState>(set => ({
  count: 0,
  increase: () => set(state => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 })
}));
