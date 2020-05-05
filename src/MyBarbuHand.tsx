import React from "react";

import { Hand, Card } from "./deck";
import VisibleCard from "./VisibleCard";
import "./MyBarbuHand.css";

type MyBarbuHandProps = {
  hand: Hand;
  onCardPlayed: (card: Card) => () => void;
};

const MyBarbuHand = ({ hand, onCardPlayed }: MyBarbuHandProps) => {
  return (
    <div className="MyBarbuHand">
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
