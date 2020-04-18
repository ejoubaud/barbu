import create from "zustand";

import { shuffle, full } from "./deck";

startGame = players => {
  const deck = shuffle(fullFor(players));
};

const [useStore] = create(set => ({
  count: 0,
  increase: () => set(state => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 })
}));
