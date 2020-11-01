import React from "react";

import { Trick as TrickType } from "./barbu";

import VisibleCard from "./VisibleCard";

import "./Trick.css";

type TrickProps = {
  trick: TrickType;
  isVisible?: boolean;
};

const Trick = ({ trick, isVisible = false }: TrickProps) => {
  return (
    <div className="Trick">
      {trick.map(({ card }, cardIdx) => (
        <div className="Trick__CardContainer" key={cardIdx}>
          {isVisible ? (
            <VisibleCard card={card} depth={cardIdx} />
          ) : (
            <div className="card">
              <div className="back" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Trick;
