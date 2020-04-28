import Peer from "peerjs";
import createStore from "zustand";

import { PlayerId, RoomId, GameStarter, Cmd, Evt } from "./common";
import startBarbu from "./barbu";

const idCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
const newRoomId: () => RoomId = () =>
  Array.from(Array(8))
    .map(() =>
      idCharacters.charAt(Math.floor(Math.random() * idCharacters.length))
    )
    .join("");

type Server = [RoomId, GameStarter];

type ServerState = {
  players: PlayerId[];
  connections: Peer.DataConnection[];
  gameStarted: boolean;
};

const createServer = (roomId = newRoomId()): Server => {
  const peer = new Peer(`barbu-room-${roomId}`);
  const [, store] = createStore<ServerState>(set => ({
    players: [],
    connections: [],
    gameStarted: false
  }));

  store.subscribe(
    function broadcastNames(players) {
      const state = store.getState();
      state.connections.forEach(connection => {
        connection.send({
          type: Evt.PlayersUpdated,
          players: state.players
        });
      });
    },
    state => state.players
  );

  const sendError = (conn: Peer.DataConnection, error: Evt) => {
    conn.send({ type: error });
  };

  const setName = (conn: Peer.DataConnection, name: PlayerId) => {
    const s = store.getState();
    if (s.gameStarted) return;
    if (s.players.includes(name)) {
      sendError(conn, Evt.NameTakenError);
    }
    store.setState({
      players: s.players.concat(name)
    });
  };

  peer.on("open", id => {
    console.log("Peer server: Peer open", id);
  });

  peer.on("error", err => {
    console.log("Peer server: Error on peer", err);
  });

  peer.on("connection", (conn: Peer.DataConnection) => {
    console.log("Peer server: Connection on peer", peer);

    conn.on("open", () => {
      store.setState({
        connections: store.getState().connections.concat(conn)
      });
    });

    conn.on("data", (message: any) => {
      if (message.cmd === Cmd.SetName) {
        setName(conn, message.name);
      }
    });

    conn.on("error", err => {
      console.log("Peer server: Error on conn", err);
    });
  });

  const startGame: GameStarter = () => {
    const { players, gameStarted } = store.getState();
    if (gameStarted) return;
    store.setState({ gameStarted: true });
    startBarbu(players);
  };

  return [roomId, startGame];
};

export default createServer;
