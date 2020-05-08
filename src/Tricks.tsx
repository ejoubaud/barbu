import React from "react";

import { Trick } from "./barbu";

import VisibleCard from "./VisibleCard";

type TricksProps = {
  tricks: Trick[];
};

const Tricks = ({ tricks }: TricksProps) => {
  return (
    <>
      {tricks.map((trick, trickIdx) => (
        <div
          className="Tricks__Trick"
          key={trickIdx}
          style={{ zIndex: trickIdx }}
        >
          {trick.map(({ card }, cardIdx) => (
            <div className="Tricks__TrickCardContainer" key={cardIdx}>
              <VisibleCard card={card} depth={cardIdx} />
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default Tricks;
