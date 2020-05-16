import { PlayerId, RoomId, ClientId, Cmd, Evt } from "./common";
import { Card } from "./deck";
import {
  setConnected,
  setError,
  setPlayers,
  setGameEvent
} from "./playerStore";
import initNetworkClient from "./networkClient";

export type SavedSeat = {
  savedName: string;
  clientId: ClientId;
};

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

  const clearMySeat = () => {
    if (!window.sessionStorage) return;
    window.sessionStorage.clear();
  };

  const saveMySeat = (myName: PlayerId) => {
    if (!window.sessionStorage) return;
    const savedSeat = JSON.stringify({
      savedName: myName,
      clientId: networkClient.clientId
    });
    window.sessionStorage.setItem(`myName-${roomId}`, savedSeat);
  };

  const savedSeat = (): SavedSeat | null => {
    if (!window.sessionStorage) return null;
    const json = window.sessionStorage.getItem(`myName-${roomId}`);
    if (!json) return null;
    return JSON.parse(json);
  };

  const setName = (name: PlayerId, previousClientId?: ClientId) => {
    networkClient.send({ cmd: Cmd.SetName, name, previousClientId });
    saveMySeat(name);
  };

  const playCards = (cards: Card[]) => {
    networkClient.send({ cmd: Cmd.Play, cards });
  };

  networkClient.listen(event => {
    switch (event.type) {
      case Evt.NameError:
        setError(event.message);
        clearMySeat();
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

  return { setName, savedSeat, playCards };
};

export default initClient;
