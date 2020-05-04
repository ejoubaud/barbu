import { PlayerId, RoomId, Cmd, Evt } from "./common";
import { setError, setPlayers, setGameEvent } from "./store";
import initNetworkClient from "./networkClient";

export type Client = {
  setName: (name: PlayerId) => void;
};

export const nullClient: Client = {
  setName: () => {}
};

const initClient = async (roomId: RoomId) => {
  const networkClient = await initNetworkClient(roomId);

  const setName = async (name: PlayerId) => {
    networkClient.send({ cmd: Cmd.SetName, name });
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

  return { setName };
};

export default initClient;
