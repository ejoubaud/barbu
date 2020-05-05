import React from "react";

import { Card } from "./deck";
import {
  useBarbuStore,
  getMyHand,
  getMyName,
  getCurrentPlayer,
  getCurrentTrick
} from "./barbuStore";
import { usePlayerStore, getClient, getError } from "./playerStore";

import MyBarbuHand from "./MyBarbuHand";
import CurrentTrick from "./CurrentTrick";

import "./BarbuContainer.css";

const BarbuContainer = () => {
  const myHand = useBarbuStore(getMyHand);
  const myName = useBarbuStore(getMyName);
  const currentPlayer = useBarbuStore(getCurrentPlayer);
  const currentTrick = useBarbuStore(getCurrentTrick);
  const client = usePlayerStore(getClient);
  const playCard = (card: Card) => () => client.playCards([card]);
  const error = usePlayerStore(getError);

  return (
    <div className="BarbuContainer">
      <div className="BarbuContainer__CurrentTrick">
        <CurrentTrick trick={currentTrick} />
      </div>
      <div className="BarbuContainer__Message">
        {error && `${error} - `}
        C'est{" "}
        {myName === currentPlayer ? "au con qui demande" : `à ${currentPlayer}`}
      </div>
      <div className="BarbuContainer__MyHand">
        <MyBarbuHand hand={myHand} onCardPlayed={playCard} />
      </div>
    </div>
  );
};

export default BarbuContainer;
