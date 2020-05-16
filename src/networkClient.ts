// layer of abstraction for peerjs client, so we can easily replace it with
// e.g. a real-time db or socket.io connection
// eslint-disable-next-line
import Peer from "peerjs";
import { RoomId, ClientId } from "./common";

const idCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
const newClientId = (): ClientId =>
  Array.from(Array(8))
    .map(() =>
      idCharacters.charAt(Math.floor(Math.random() * idCharacters.length))
    )
    .join("");

export type NetworkListener = (data: any) => void;
export type NetworkClient = {
  clientId: ClientId;
  send: (data: any) => Promise<void>;
  listen: (listener: NetworkListener) => void;
};

const initClient = async (
  roomId: RoomId,
  errorCb: NetworkListener
): Promise<NetworkClient> => {
  const clientId = newClientId();
  let listeners: NetworkListener[] = [];
  let stopped = false;

  const failed = (step: string, peer: Peer) => (err?: any) => {
    // TODO: handle retries/reconnect here
    console.log("A failure happened", step, err);
    stopped = true;
    peer.destroy();
    errorCb(err);
  };

  const openConn = () =>
    new Promise<Peer.DataConnection>((resolve, reject) => {
      const peer = new Peer(`barbu-player-${clientId}`);

      peer.on("error", err => {
        reject(err);
        failed("Peer error", peer)(err);
      });

      peer.on("open", id => {
        console.log("Peer client: Peer open", id);
        const newConn = peer.connect(`barbu-room-${roomId}`, {
          metadata: { clientId }
        });

        newConn.on("error", err => {
          // just in case it hasn't resolved yet
          reject(err);
          failed("Conn error", peer)(err);
        });

        newConn.on("close", failed("Client Conn closed", peer));

        newConn.on("open", () => {
          console.log("Peer client: Conn open");
          stopped = false;
          resolve(newConn);
        });
      });
    });

  // making it async so it can handle reconnect in the future
  const send = async (data: any) => {
    if (stopped) {
      errorCb(new Error("Tried to send on a stopped client"));
    } else {
      conn.send(data);
    }
  };

  const listen = (listener: NetworkListener) => {
    listeners.push(listener);
  };

  let conn = await openConn();

  conn.on("data", (event: any) => {
    listeners.forEach(listener => {
      listener(event);
    });
  });

  return { clientId, send, listen };
};

export default initClient;
