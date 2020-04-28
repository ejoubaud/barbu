export type PlayerId = string;
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
  NameTakenError = "NameTakenError"
}
export interface Event {
  type: Evt;
}

export type GameStarter = () => void;
