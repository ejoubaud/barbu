import { card, eq, full, fullFor, deal, Color } from "./deck";

describe("card", () => {
  expect(card(Color.Spades, 12)).toEqual({ color: "spades", value: 12 });
});

describe("eq", () => {
  it("compares the value and color of 2 cards", () => {
    let result = eq(
      { color: "spades", value: 8 },
      { value: 8, color: "spades" }
    );
    expect(result).toBe(true);
    result = eq({ color: "spades", value: 7 }, { value: 8, color: "spades" });
    expect(result).toBe(false);
    result = eq({ color: "spades", value: 8 }, { value: 8, color: "hearts" });
    expect(result).toBe(false);
  });
});

describe("full", () => {
  expect(full.length).toEqual(52);
});

describe("fullFor", () => {
  expect(fullFor(3).length).toEqual(51);
  expect(fullFor(4).length).toEqual(52);
  expect(fullFor(5).length).toEqual(50);
  expect(fullFor(6).length).toEqual(48);
});

describe("deal", () => {
  const deck = [
    card(Color.Clubs, 1),
    card(Color.Hearts, 2),
    card(Color.Spades, 3),
    card(Color.Diamonds, 3),
  ];

  it("cuts it into n hands", () => {
    expect(deal(deck, 1)).toEqual([[deck[0], deck[1], deck[2], deck[3]]]);
    expect(deal(deck, 2)).toEqual([
      [deck[0], deck[2]],
      [deck[1], deck[3]],
    ]);
    expect(deal(deck, 3)).toEqual([[deck[1]], [deck[2]], [deck[0], deck[3]]]);
    expect(deal(deck, 4)).toEqual([[deck[0]], [deck[1]], [deck[2]], [deck[3]]]);
    expect(deal(deck, 5)).toEqual([
      [],
      [deck[0]],
      [deck[1]],
      [deck[2]],
      [deck[3]],
    ]);
  });
});
