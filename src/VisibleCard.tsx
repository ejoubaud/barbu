import React from "react";

import { Card } from "./deck";

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
    className={`card rank${card.value} ${card.color} ${
      isPlayable && "playable-card"
    }`}
    style={{ zIndex: depth }}
    onClick={onClick && onClick(card)}
  >
    <div className="face" />
  </div>
);

export default VisibleCard;
