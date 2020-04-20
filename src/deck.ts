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

export const dealFor = (players: number): Hand[] =>
  deal(fullFor(players), players);

export const shuffleAndDealFor = (players: number): Hand[] =>
  deal(_shuffle(fullFor(players)), players);

export const sortHand = (cards: Hand): Hand =>
  cards.sort((card1, card2) => {
    if (card1.color < card2.color) {
      return -1;
    } else if (card1.color > card2.color) {
      return 1;
    } else if (card1.value < card2.value) {
      return -1;
    } else if (card1.value > card2.value) {
      return 1;
    } else {
      return 0;
    }
  });

export const shuffleAndDealSortedHands = (players: number): Hand[] =>
  shuffleAndDealFor(players).map(sortHand);