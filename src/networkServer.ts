import Peer from "peerjs";

import { RoomId, ClientId } from "./common";

export type NetworkSender = (arg: any) => void;
export type NetworkListener = (arg: any) => void;
export type NetworkConnectionListener = (
  clientId: ClientId,
  send: (data: any) => void,
  onRequest: (listener: NetworkListener) => void,
  onDisconnect: (listener: NetworkListener) => void
) => void;
type NetworkDestroyer = () => void;

const startServer = (
  roomId: RoomId,
  onConnection: NetworkConnectionListener,
  errorCb: NetworkListener
): Promise<NetworkDestroyer> =>
  new Promise<NetworkDestroyer>((resolve, reject) => {
    const peer = new Peer(`barbu-room-${roomId}`);

    const destroy = () => {
      peer.destroy();
    };

    peer.on("open", id => {
      console.log("Peer server: Peer open", id);
      resolve(destroy);
    });

    peer.on("error", err => {
      console.log("Peer server: Error on peer", err);
      reject(err);
    });

    peer.on("connection", (conn: Peer.DataConnection) => {
      console.log("Peer server: Connection on peer", peer);

      const send: NetworkSender = msg => conn.send(msg);
      const onRequest: NetworkListener = cb => conn.on("data", cb);
      const onDisconnect: NetworkListener = cb => conn.on("error", cb);

      conn.on("open", () => {
        onConnection(conn.metadata["clientId"], send, onRequest, onDisconnect);
      });
    });
  });

export default startServer;
