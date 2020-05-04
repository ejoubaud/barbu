import React from "react";

import { Hand } from "./deck";
import VisibleCard from "./VisibleCard";
import "./MyHand.css";

type MySimpleHandProps = {
  hand: Hand;
};

const MySimpleHand = ({ hand }: MySimpleHandProps) => {
  return (
    <div className="hand-container">
      {hand.map((card, idx) => (
        <div key={idx} className="card-container">
          <VisibleCard card={card} depth={idx} />
        </div>
      ))}
    </div>
  );
};

export default MySimpleHand;
