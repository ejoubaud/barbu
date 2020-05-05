import React from "react";

import { Hand, Card } from "./deck";
import { PlayerId } from "./common";
import VisibleCard from "./VisibleCard";
import "./MyBarbuHand.css";

type MyBarbuHandProps = {
  hand: Hand;
  currentPlayer: PlayerId;
  myName: PlayerId;
  onCardPlayed: (card: Card) => () => void;
};

const MyBarbuHand = ({
  hand,
  currentPlayer,
  myName,
  onCardPlayed
}: MyBarbuHandProps) => {
  return (
    <div className="MyBarbuHand">
      <div className="MyBarbuHand__Message">
        C'est à {myName === currentPlayer ? "vous" : currentPlayer}
      </div>
      {hand.map((card, idx) => (
        <div key={idx} className="MyBarbuHand__CardContainer">
          <VisibleCard
            card={card}
            depth={idx}
            onClick={onCardPlayed}
            isPlayable
          />
        </div>
      ))}
    </div>
  );
};

export default MyBarbuHand;
