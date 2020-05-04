// the local store for a given player/client of specific game Barbu
import createStore from "zustand";

import { notNull } from "./common";
import { store as playerStore, getGame } from "./store";
import { PlayerGameState, BarbuEvent } from "./barbu";

type BarbuStoreState = {
  gameState: PlayerGameState;
  lastEvent: BarbuEvent;
};

const initGame = getGame(playerStore.getState());
export const [useBarbuStore, barbuStore] = createStore<BarbuStoreState>(
  set => ({
    gameState: initGame.gameState as PlayerGameState,
    lastEvent: initGame.lastGameEvent as BarbuEvent
  })
);

playerStore.subscribe(
  notNull(({ gameState, lastGameEvent }) => {
    barbuStore.setState({
      gameState: gameState as PlayerGameState,
      lastEvent: lastGameEvent as BarbuEvent
    });
  }),
  getGame
);

export const getMyHand = ({ gameState }: BarbuStoreState) => gameState.myHand;
