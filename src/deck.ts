import _shuffle from "lodash/fp/shuffle";

export enum Color {
  Spades = "spades",
  Hearts = "hearts",
  Clubs = "clubs",
  Diamonds = "diamonds"
}

export type Value = number;

export const values: Value[] = Array.from(Array(14).keys()).slice(1);

export type Card = { color: Color; value: number };

export const card = (color: Color, value: Value): Card => ({ color, value });

export type Deck = Card[];
export type Table = Card[];

export const full: Deck = values.reduce(
  (deck: Deck, value: Value) =>
    deck.concat(Object.values(Color).map(color => card(color, value))),
  []
);

export const eq = (card1: Card, card2: Card): boolean =>
  card1.value === card2.value && card1.color === card2.color;

const cardsToRemove: Card[] = [
  { color: Color.Clubs, value: 8 },
  { color: Color.Diamonds, value: 8 },
  { color: Color.Spades, value: 8 },
  { color: Color.Hearts, value: 8 },
  { color: Color.Clubs, value: 9 },
  { color: Color.Diamonds, value: 9 }
];

export const fullFor = (players: number): Deck => {
  const removeCount = full.length % players;
  const removeCards = cardsToRemove.slice(0, removeCount);
  return full.filter(c => !removeCards.some(r => eq(c, r)));
};

export const shuffle: (deck: Deck) => Deck = _shuffle;

export type Hand = Card[];

export const deal = (deck: Deck, players: number): Hand[] => {
  const emptyHands = Array(players).fill([]);
  return deck.reduce(
    ([firstHand, ...otherHands], card) => [...otherHands, [...firstHand, card]],
    emptyHands
  );
};

export const hasColor = (cards: Card[], colorToCheck: Color) =>
  cards.some(({ color }) => colorToCheck === color);

export const findCard = (cards: Card[], card: Card) =>
  cards.findIndex(c => eq(c, card));

export const removeCard = (cards: Card[], card: Card) => {
  const index = findCard(cards, card);
  return cards.slice(0, index).concat(cards.slice(index + 1, -1));
};
