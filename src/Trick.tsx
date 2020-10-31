import React from "react";

import { Trick as TrickType } from "./barbu";

import "./Trick.css";

type TrickProps = {
  trick: TrickType;
};

const Trick = ({ trick }: TrickProps) => {
  return (
    <div className="Trick">
      {trick.map(({ card }, cardIdx) => (
        <div className="Trick__CardContainer" key={cardIdx}>
          <div className="card">
            <div className="back" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Trick;
