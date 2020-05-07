import React from "react";

import { Card } from "./deck";
import {
  useBarbuStore,
  getMyHand,
  getMyName,
  getCurrentPlayer,
  getCurrentTrick,
  getCurrentContract,
  getPlayers,
  getPlayerTricks,
  getPlayerHandSizes
} from "./barbuStore";
import { usePlayerStore, getClient, getError } from "./playerStore";

import MyBarbuHand from "./MyBarbuHand";
import CurrentTrick from "./CurrentTrick";
import OtherPlayer from "./OtherPlayer";

import "./BarbuContainer.css";

const BarbuContainer = () => {
  const myHand = useBarbuStore(getMyHand);
  const myName = useBarbuStore(getMyName);
  const currentPlayer = useBarbuStore(getCurrentPlayer);
  const currentTrick = useBarbuStore(getCurrentTrick);
  const currentContract = useBarbuStore(getCurrentContract);
  const players = useBarbuStore(getPlayers);
  const playerTricks = useBarbuStore(getPlayerTricks);
  const playerHandSizes = useBarbuStore(getPlayerHandSizes);
  const client = usePlayerStore(getClient);
  const playCard = (card: Card) => () => client.playCards([card]);
  const error = usePlayerStore(getError);

  const count = players.length;
  const myIdx = players.indexOf(myName);
  const otherPlayers = players
    .slice(myIdx + 1, count + 1)
    .concat(players.slice(0, myIdx));
  const midPlayerIdx = otherPlayers.length / 2;
  const leftPlayers = otherPlayers.slice(0, Math.floor(midPlayerIdx)).reverse();
  const middlePlayer = otherPlayers[Math.floor(midPlayerIdx)];
  const rightPlayers = otherPlayers.slice(Math.ceil(midPlayerIdx), count - 1);

  return (
    <div className="BarbuContainer">
      {otherPlayers.length % 2 === 1 && (
        <div className="BarbuContainer__TopPlayer">
          <OtherPlayer
            name={middlePlayer}
            tricks={playerTricks[middlePlayer] || []}
            handSize={playerHandSizes[middlePlayer]}
          />
        </div>
      )}

      <div className="BarbuContainer__TableCenter">
        <div className="BarbuContainer__PlayersColumn">
          {leftPlayers.map(playerId => (
            <OtherPlayer
              key={playerId}
              name={playerId}
              tricks={playerTricks[playerId] || []}
              handSize={playerHandSizes[playerId]}
            />
          ))}
        </div>

        <div className="BarbuContainer__CurrentTrick">
          <CurrentTrick trick={currentTrick} />
        </div>

        <div className="BarbuContainer__PlayersColumn">
          {rightPlayers.map(playerId => (
            <OtherPlayer
              key={playerId}
              name={playerId}
              tricks={playerTricks[playerId] || []}
              handSize={playerHandSizes[playerId]}
            />
          ))}
        </div>
      </div>

      <div className="BarbuContainer__Message">
        {error && `${error} - `}
        C'est{" "}
        {myName === currentPlayer ? "au con qui demande" : `à ${currentPlayer}`}
        {currentContract && ` - ${currentContract}`}
      </div>

      <div className="BarbuContainer__MyHand">
        <MyBarbuHand hand={myHand} onCardPlayed={playCard} />
      </div>
    </div>
  );
};

export default BarbuContainer;
