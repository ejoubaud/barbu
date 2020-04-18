import _shuffle from "lodash/fp/shuffle";

export const values = [...Array(14).keys()].slice(1);

export const colors = ["spades", "hearts", "clubs", "diamonds"];

export const full = values.reduce(
  (deck, value) => deck.concat(colors.map(color => ({ color, value }))),
  []
);

export const eq = (card1, card2) =>
  card1.value === card2.value && card1.color === card2.color;

const cardsToRemove = [
  { color: "clubs", value: 8 },
  { color: "diamonds", value: 8 },
  { color: "spades", value: 8 },
  { color: "hearts", value: 8 },
  { color: "clubs", value: 9 },
  { color: "diamonds", value: 9 }
];

export const fullFor = players => {
  const removeCount = full.length % players;
  const removeCards = cardsToRemove.slice(0, removeCount);
  return full.filter(c => !removeCards.some(r => eq(c, r)));
};

export const shuffle = _shuffle;
