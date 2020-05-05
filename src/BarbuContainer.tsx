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

import "./BarbuContainer.css";

const BarbuContainer = () => {
  const myHand = useBarbuStore(getMyHand);
  const myName = useBarbuStore(getMyName);
  const currentPlayer = useBarbuStore(getCurrentPlayer);
  const client = usePlayerStore(getClient);
  const playCard = (card: Card) => () => client.playCards([card]);

  return (
    <div className="BarbuContainer">
      <div className="BarbuContainer__Message">
        C'est à {myName === currentPlayer ? "vous" : currentPlayer}
      </div>
      <div className="BarbuContainer__MyHand">
        <MyBarbuHand hand={myHand} onCardPlayed={playCard} />
      </div>
    </div>
  );
};

export default BarbuContainer;
