import { Card } from "./deck";
import { StateListener } from "zustand";

// overall concerns
export type PlayerId = string;

// client/server concerns
export type RoomId = string;
export type ClientId = string;
export enum Cmd {
  SetName = "setName",
  Play = "play"
}
export interface Command {
  cmd: Cmd;
}

export enum Evt {
  PlayersUpdated = "PlayersUpdated",
  GameEvent = "GameEvent",
  NameError = "NameError",
  ActionError = "ActionError"
}
export interface ServerEvent {
  type: Evt;
}

export const notNull = <U>(listener: (state: U) => void): StateListener<U> => (
  state,
  error
) => {
  if (state) {
    listener(state);
  } else {
    console.log("Server dispatch error: ", error);
  }
};

// game concerns
// (needed in server, to be extended in each game)
export type GameState = {};
export type PlayerGameState = {};
export interface GameEvent {
  type: string;
}

export type Action = { playerId: PlayerId; cards: Card[] };
export const Action = (playerId: PlayerId, cards: Card[]): Action => ({
  playerId,
  cards
});
export type ActionResult = [GameEvent, GameState];
export type ActionProcessor = (action: Action) => ActionResult;

export type GameStarter = (
  players: PlayerId[],
  initialActionResult?: ActionResult
) => StartResult;
export type StartResult = [ActionProcessor, GameEvent, GameState];

export type PlayerStateMapper = (
  state: GameState,
  player: PlayerId
) => PlayerGameState;

export const nullEventType = "Null";
export const nullGameEvent = { type: nullEventType };
export const nullGameState = {};
export const nullPlayerGameState = {};
export const nullActionProcessor: ActionProcessor = _ => [
  nullGameEvent,
  nullGameState
];
