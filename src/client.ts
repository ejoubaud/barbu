import { PlayerId, RoomId, Cmd, Evt } from "./common";
import { Card } from "./deck";
import {
  setConnected,
  setError,
  setPlayers,
  setGameEvent
} from "./playerStore";
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
  const networkClient = await initNetworkClient(roomId, function onError() {
    setError("Erreur de connexion. Rafraichir et retenter.");
    setConnected(false);
  });

  setConnected(true);

  const clearMyName = () => {
    if (!window.sessionStorage) return;
    window.sessionStorage.removeItem(`myName-${roomId}`);
  };

  const saveMyName = (myName: PlayerId) => {
    if (!window.sessionStorage) return;
    window.sessionStorage.setItem(`myName-${roomId}`, myName);
  };

  const savedName = (): PlayerId | null => {
    if (!window.sessionStorage) return null;
    return window.sessionStorage.getItem(`myName-${roomId}`);
  };

  const setName = (name: PlayerId) => {
    networkClient.send({ cmd: Cmd.SetName, name });
    saveMyName(name);
  };

  const playCards = (cards: Card[]) => {
    networkClient.send({ cmd: Cmd.Play, cards });
  };

  networkClient.listen(event => {
    switch (event.type) {
      case Evt.NameError:
        setError(event.message);
        clearMyName();
        break;
      case Evt.PlayersUpdated:
        setPlayers(event.playerId, event.players);
        break;
      case Evt.GameEvent:
        setGameEvent(event.gameStarted, event.event, event.state);
        break;
      case Evt.ActionError:
        setError(event.message);
        break;
    }
  });

  return { setName, savedName, playCards };
};

export default initClient;
