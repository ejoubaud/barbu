import React from "react";

import { Card } from "./deck";
import {
  useBarbuStore,
  getMyHand,
  getMyName,
  getCurrentPlayer
} from "./barbuStore";
import { usePlayerStore, getClient } from "./playerStore";

import MyBarbuHand from "./MyBarbuHand";

const BarbuContainer = () => {
  const myHand = useBarbuStore(getMyHand);
  const myName = useBarbuStore(getMyName);
  const currentPlayer = useBarbuStore(getCurrentPlayer);
  const client = usePlayerStore(getClient);
  const playCard = (card: Card) => () => client.playCards([card]);

  return (
    <>
      <MyBarbuHand
        hand={myHand}
        myName={myName}
        currentPlayer={currentPlayer}
        onCardPlayed={playCard}
      />
    </>
  );
};

export default BarbuContainer;
