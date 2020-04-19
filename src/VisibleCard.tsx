import React from "react";

import { Card } from "./deck";

type VisibleCardProps = {
  card: Card;
  depth: number;
};

const VisibleCard = ({ card, depth }: VisibleCardProps) => (
  <div
    className={`card rank${card.value} ${card.color}`}
    style={{ zIndex: depth }}
  >
    <div className="face" />
  </div>
);

export default VisibleCard;
