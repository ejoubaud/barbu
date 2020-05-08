import Peer from "peerjs";
import createStore from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";

import { Card } from "./deck";
import {
  PlayerId,
  RoomId,
  ClientId,
  Cmd,
  Evt,
  ServerGameStarter,
  notNull,
  nullGameEvent,
  nullGameState,
  nullActionProcessor,
  GameEvent,
  GameState,
  Action,
  ActionProcessor
} from "./common";
import startBarbu, { isError, isGameOver, gameStateForPlayer } from "./barbu";

const idCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
const newRoomId: () => RoomId = () =>
  Array.from(Array(8))
    .map(() =>
      idCharacters.charAt(Math.floor(Math.random() * idCharacters.length))
    )
    .join("");

type Server = [RoomId, ServerGameStarter];

type ServerState = {
  players: PlayerId[];
  clients: { [clientId: string]: Client };
  gameStarted: boolean;
  gameEnded: boolean;
  gameState: GameState;
  lastGameEvent: GameEvent;
  playTurn: ActionProcessor;
};

const nullSend = () => {};
type Client = {
  clientId?: ClientId;
  playerId?: PlayerId;
  send: (arg: any) => void;
};

const createServer = (roomId = newRoomId()): Server => {
  const [, store] = createStore<ServerState>(set => ({
    players: [],
    clients: {},
    gameStarted: false,
    gameEnded: false,
    gameState: nullGameState,
    lastGameEvent: nullGameEvent,
    playTurn: nullActionProcessor
  }));

  const send = (clientId: ClientId, msg: any) => {
    const client = store.getState().clients[clientId];
    if (!client) {
      console.log("Tried to send to unknown client", clientId, msg);
      return;
    }
    client.send(msg);
  };

  const setName = (clientId: ClientId, name: PlayerId) => {
    const s = store.getState();
    console.log("Server: setName", clientId, name, s);
    const doSetName = () => {
      store.setState({
        players: s.players.includes(name) ? s.players : s.players.concat(name),
        clients: produce(s.clients, clients => {
          clients[clientId].playerId = name;
        })
      });
    };
    if (!name.trim()) {
      sendError(clientId, Evt.NameError, "Nom vide");
      return;
    }
    if (s.gameStarted) {
      const isReconnect = Object.values(s.clients).some(
        ({ playerId, clientId }) => playerId === name && !clientId
      );
      if (isReconnect) {
        doSetName();
        return;
      } else {
        sendError(
          clientId,
          Evt.NameError,
          "Le jeu a déja commencé, trop tard pour rejoindre"
        );
        return;
      }
    }
    if (s.players.includes(name)) {
      sendError(clientId, Evt.NameError, "Ce nom est pris.");
      return;
    }
    doSetName();
  };

  const setClient = (client: Client) => {
    if (!client.clientId) return;
    const state = store.getState();
    const id = client.clientId;
    store.setState({
      clients: produce(state.clients, clients => {
        const oldClient = clients[id];
        clients[id] = client;
        if (oldClient && oldClient.playerId) {
          clients[id].playerId = oldClient.playerId;
        }
      })
    });
  };

  const unsetClient = (id: ClientId) => {
    const { clients, players, gameStarted } = store.getState();
    const oldClient = clients[id];
    if (!oldClient || !oldClient.clientId) return;
    if (gameStarted) {
      // setup for possible reconnect
      store.setState({
        clients: produce(clients, clients => {
          delete clients[id].clientId;
          clients[id].send = nullSend;
        })
      });
    } else {
      // delete player and client
      store.setState(
        produce({ players, clients }, newState => {
          if (oldClient.playerId)
            newState.players = players.filter(p => p !== oldClient.playerId);
          delete newState.clients[id];
        })
      );
    }
  };

  const play = (clientId: ClientId, cards: Card[]) => {
    const { playTurn, clients } = store.getState();
    const playerId = clients[clientId].playerId;
    if (!playerId) {
      sendError(
        clientId,
        Evt.ActionError,
        "Vous n'êtes pas un joueur de cette partie"
      );
      return;
    }
    const action = Action(playerId, cards);
    const [lastGameEvent, gameState] = playTurn(action);
    if (isError(lastGameEvent)) {
      // reply with error
      sendError(clientId, Evt.ActionError, lastGameEvent.err);
    } else if (isGameOver(lastGameEvent)) {
      store.setState({
        gameEnded: true,
        gameStarted: false,
        lastGameEvent,
        gameState
      });
    } else {
      // broadcast new event/state
      store.setState({ lastGameEvent, gameState });
    }
  };

  const sendError = (clientId: ClientId, error: Evt, message: string) => {
    send(clientId, { type: error, message });
  };

  const startGame: ServerGameStarter = () => {
    const { players, gameStarted } = store.getState();
    if (gameStarted) {
      console.log("Tried to start an already started game");
      return;
    }
    const [playTurn, lastGameEvent, gameState] = startBarbu(players);
    store.setState({ gameStarted: true, lastGameEvent, gameState, playTurn });
  };

  store.subscribe(
    notNull(function broadcastNames({ players, clients }) {
      console.log("broadcasting players ", players, clients);
      Object.values(clients).forEach(client => {
        if (!client.playerId) return; // TODO: Handle spectator state
        client.send({
          type: Evt.PlayersUpdated,
          players,
          playerId: client.playerId
        });
      });
    }),
    ({ players, clients }: ServerState) => ({ players, clients }),
    shallow
  );

  store.subscribe(
    notNull(function broadcastEvents({
      lastGameEvent,
      clients,
      gameState,
      gameStarted
    }) {
      if (!gameStarted) return;
      console.log("broadcasting event", lastGameEvent, gameState, clients);
      Object.values(clients).forEach(client => {
        if (!client.playerId) return; // TODO: Handle spectator state
        client.send({
          type: Evt.GameEvent,
          event: lastGameEvent,
          state: gameStateForPlayer(gameState, client.playerId),
          gameStarted
        });
      });
    }),
    ({ lastGameEvent, clients, gameState, gameStarted }: ServerState) => ({
      lastGameEvent,
      clients,
      gameState,
      gameStarted
    }),
    shallow
  );

  const peer = new Peer(`barbu-room-${roomId}`);

  peer.on("open", id => {
    console.log("Peer server: Peer open", id);
  });

  peer.on("error", err => {
    console.log("Peer server: Error on peer", err);
  });

  peer.on("connection", (conn: Peer.DataConnection) => {
    console.log("Peer server: Connection on peer", peer);

    conn.on("open", () => {
      const newClient = {
        clientId: conn.peer,
        send: (arg: any) => {
          conn.send(arg);
        }
      };
      setClient(newClient);
    });

    conn.on("data", (message: any) => {
      if (message.cmd === Cmd.SetName) {
        setName(conn.peer, message.name);
      } else if (message.cmd === Cmd.Play) {
        play(conn.peer, message.cards);
      }
    });

    conn.on("error", err => {
      console.log("Peer server: Error on conn", err);
      unsetClient(conn.peer);
    });
  });

  return [roomId, startGame];
};

export default createServer;
