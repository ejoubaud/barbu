import React from "react";

import { Card } from "./deck";

import "./VisibleCard.css";

type VisibleCardProps = {
  card: Card;
  depth: number;
  isPlayable: boolean;
  onClick?: (card: Card) => () => void;
};

const VisibleCard = ({
  card,
  depth,
  isPlayable,
  onClick
}: VisibleCardProps) => (
  <div
    className={`VisibleCard card rank${card.value} ${card.color} ${
      isPlayable && "VisibleCard--playable"
    }`}
    style={{ zIndex: depth }}
    onClick={onClick && onClick(card)}
  >
    <div className="face" />
  </div>
);

export default VisibleCard;
