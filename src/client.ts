import { PlayerId, RoomId, Cmd, Evt } from "./common";
import { Card } from "./deck";
import { setError, setPlayers, setGameEvent } from "./playerStore";
import initNetworkClient from "./networkClient";

export type Client = {
  setName: (name: PlayerId) => void;
  playCards: (cards: Card[]) => void;
};

export const nullClient: Client = {
  setName: () => {},
  playCards: (cards: Card[]) => {}
};

const initClient = async (roomId: RoomId) => {
  const networkClient = await initNetworkClient(roomId);

  const setName = (name: PlayerId) => {
    networkClient.send({ cmd: Cmd.SetName, name });
  };

  const playCards = (cards: Card[]) => {
    networkClient.send({ cmd: Cmd.Play, cards });
  };

  networkClient.listen(event => {
    switch (event.type) {
      case Evt.NameError:
        // TODO: Handle in UI
        setError(event.message);
        break;
      case Evt.PlayersUpdated:
        setPlayers(event.playerId, event.players);
        break;
      case Evt.GameEvent:
        setGameEvent(event.gameStarted, event.event, event.state);
        break;
    }
  });

  return { setName, playCards };
};

export default initClient;
