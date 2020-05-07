import React from "react";

import { PlayerId } from "./common";
import { Trick } from "./barbu";

import VisibleCard from "./VisibleCard";

import "./OtherPlayer.css";

type OtherPlayerProps = {
  name: PlayerId;
  tricks: Trick[];
  handSize: number;
};

const OtherPlayer = ({ name, tricks, handSize }: OtherPlayerProps) => {
  return (
    <div className="OtherPlayer">
      <div>
        <h3 className="OtherPlayer__Name">{name}</h3>
      </div>

      <div className="OtherPlayer__TricksContainer">
        <div className="OtherPlayer__HandContainer">
          <div className="OtherPlayer__HandSize">{handSize}</div>

          <div className="OtherPlayer__HandCard card">
            <div className="back" />
          </div>
        </div>

        {tricks.map((trick, trickIdx) => (
          <div
            className="OtherPlayer__Trick"
            key={trickIdx}
            style={{ zIndex: trickIdx }}
          >
            {trick.map(({ card }, cardIdx) => (
              <div className="OtherPlayer__TrickCardContainer" key={cardIdx}>
                <VisibleCard card={card} depth={cardIdx} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherPlayer;
