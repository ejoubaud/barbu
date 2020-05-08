import React from "react";

import { PlayerId } from "./common";
import { Trick } from "./barbu";

import Tricks from "./Tricks";

import "./OtherPlayer.css";

import "./Tricks.css";

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

        <Tricks tricks={tricks} />
      </div>
    </div>
  );
};

export default OtherPlayer;
