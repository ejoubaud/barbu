// layer of abstraction for peerjs client, so we can easily replace it with
// e.g. a real-time db or socket.io connection
import Peer from "peerjs";
import { RoomId, ClientId } from "./common"

const idCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
const newClientId = (): ClientId =>
  Array.from(Array(8))
    .map(() =>
      idCharacters.charAt(Math.floor(Math.random() * idCharacters.length))
    ).join("");

export type NetworkListener = (data: any) => void
export type NetworkClient = {
  send: (data: any) => Promise<void>;
  listen: (listener: NetworkListener) => void;
}

const initClient = async (roomId: RoomId): Promise<NetworkClient> => {
  const clientId = newClientId();
  let listeners: NetworkListener[] = [];

  const failed = (step: string) => ((err?: any) => {
    // TODO: handle retries/reconnect here
    console.log("A failure happened", step, err);
  });

  const openConn = () => (
    new Promise<Peer.DataConnection>((resolve, reject) => {
      const peer = new Peer(`barbu-player-${clientId}`);

      peer.on("error", failed("Peer error"))

      peer.on("open", (id) => {
        console.log("Peer client: Peer open", id)
        const newConn = peer.connect(`barbu-room-${roomId}`);

        newConn.on("error", (err) => {
          reject(err);
          failed("Conn error")(err);
        })

        newConn.on("close", failed("Client Conn closed"))

        newConn.on("open", () => {
          console.log("Peer client: Conn open")
          resolve(newConn);
        })
      })
    })
  );

  // making it async so it can handle reconnect in the future
  const send = async (data: any) => {
    conn.send(data);
  };

  const listen = (listener: NetworkListener) => {
    listeners.push(listener);
  };

  let conn = await openConn();

  conn.on("data", (event: any) => {
    listeners.forEach(listener => {
      listener(event);
    })
  });

  return { send, listen };
};

export default initClient;
