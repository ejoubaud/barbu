import React, { useEffect } from "react";
import "./App.css";
import "deck-of-cards/example/example.css";

import WaitingRoom from "./WaitingRoom";
import BarbuContainer from "./BarbuContainer";

import createServer, { savedGame } from "./server";
import initClient from "./client";
import { RoomId } from "./common";
import {
  setClient,
  setError,
  setGameStarter,
  setSavedGame,
  removeSavedGame
} from "./playerStore";
import { usePlayerStore, getGameStarted } from "./playerStore";

const startClient = async (roomId: RoomId) => {
  try {
    const client = await initClient(roomId);
    setClient(roomId, client);
  } catch (err) {
    console.log("Client init error:", err);
    setError(
      "Erreur de connexion. Vérifier l'URL et rafraichir pour réessayer"
    );
  }
};

const joinRoom = async () => {
  const guestUrl = window.location.pathname.match("/join/(.*)$");
  if (guestUrl) {
    const roomId = guestUrl[1];
    startClient(roomId);
  } else {
    const oldGame = savedGame();
    if (oldGame) {
      setSavedGame(oldGame);
      setGameStarter(async savedGame => {
        removeSavedGame();
        const [roomId, startGame] = await createServer(
          savedGame && savedGame.roomId
        );
        if (savedGame) startGame(savedGame);
        startClient(roomId);
      });
    } else {
      const [roomId, startGame] = await createServer();
      setGameStarter(startGame);
      startClient(roomId);
    }
  }
};

function App(): JSX.Element {
  useEffect(() => {
    joinRoom();
  }, []);
  const isGameStarted = usePlayerStore(getGameStarted);
  return (
    <div className="App">
      {isGameStarted ? <BarbuContainer /> : <WaitingRoom />}
    </div>
  );
}
export default App;
