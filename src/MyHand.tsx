import React from "react";

import { useStore, getMyHand } from "./store";
import VisibleCard from "./VisibleCard";
import "./MyHand.css";

const MyHand = () => {
  const myHand = useStore(getMyHand);
  return (
    <div className="hand-container">
      {myHand.map((card, idx) => (
        <div className="card-container">
          <VisibleCard card={card} depth={idx} />
        </div>
      ))}
    </div>
  );
};

export default MyHand;
