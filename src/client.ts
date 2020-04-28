import { PlayerId, RoomId, Cmd, Evt } from "./common";
import { setNameError, setMyName, setPlayers } from "./store";
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
    setMyName(name);
    networkClient.send({ cmd: Cmd.SetName, name });
  };

  networkClient.listen(event => {
    switch (event.type) {
      case Evt.NameTakenError:
        setNameError("Nom deja pris, choisis-en un autre");
        break;
      case Evt.PlayersUpdated:
        setPlayers(event.players);
        break;
    }
  });

  return { setName };
};

export default initClient;
