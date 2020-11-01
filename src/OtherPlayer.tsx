import React from "react";

import { PlayerId } from "./common";
import { Trick } from "./barbu";

import Tricks from "./Tricks";

import "./OtherPlayer.css";

type OtherPlayerProps = {
  name: PlayerId;
  tricks: Trick[];
  handSize: number;
  score?: number;
  showLastTrick: boolean;
};

const OtherPlayer = ({
  name,
  tricks,
  handSize,
  score,
  showLastTrick
}: OtherPlayerProps) => {
  return (
    <div className="OtherPlayer">
      <div>
        <h3 className="OtherPlayer__Name">
          {name}
          {typeof score !== "undefined" && `: ${score}`}
        </h3>
      </div>

      <div className="OtherPlayer__TricksContainer">
        <div className="OtherPlayer__HandContainer">
          <div className="OtherPlayer__HandSize">{handSize}</div>

          <div className="OtherPlayer__HandCard card">
            <div className="back" />
          </div>
        </div>

        <Tricks tricks={tricks} showLast={showLastTrick} />
      </div>
    </div>
  );
};

export default OtherPlayer;
