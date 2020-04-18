import { eq, full, fullFor } from "./deck";

describe("eq", () => {
  it("", () => {
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
