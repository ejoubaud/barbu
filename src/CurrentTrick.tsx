import React from "react";

import { Trick } from "./barbu";

import VisibleCard from "./VisibleCard";

import "./CurrentTrick.css";

type CurrentTrickProps = {
  trick: Trick;
};

const CurrentTrick = ({ trick }: CurrentTrickProps) => {
  return (
    <>
      {trick.map(({ card }, idx) => (
        <div key={idx} className="CurrentTrick__CardContainer">
          <VisibleCard key={idx} card={card} depth={idx} />
        </div>
      ))}
    </>
  );
};

export default CurrentTrick;
