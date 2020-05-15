import React, { useEffect, useState, useRef, FormEvent } from "react";

import "./WaitingRoom.css";
import {
  usePlayerStore,
  getMyName,
  getClient,
  getError,
  getRoomId,
  getPlayers,
  getConnected,
  setClient,
  setError
} from "./playerStore";

import { RoomId } from "./common";
import createServer, { savedGame, ServerGameStarter } from "./server";
import initClient from "./client";

const startClient = async (roomId: RoomId) => {
  try {
    const client = await initClient(roomId);
    setClient(roomId, client);
    const savedName = client.savedName();
    if (savedName) client.setName(savedName);
  } catch (err) {
    console.log("Client init error:", err);
    setError(
      "Erreur de connexion. Vérifier l'URL et rafraichir pour réessayer"
    );
  }
};

const extractRoomIdFromUrl = (): RoomId | null => {
  const match = window.location.pathname.match("/join/(.*)$");
  return match && match[1];
};

const urlRoomId = extractRoomIdFromUrl();
const isHost = !urlRoomId;
const oldGame = savedGame();

const WaitingRoom = () => {
  const [startGame, setGameStarter] = useState<ServerGameStarter | null>(null);
  const [isResumingOldGame, setResumingOldGame] = useState(false);
  const [isStartingNewGame, setStartingNewName] = useState(false);

  const startNewGame = async () => {
    setStartingNewName(true);
    const [roomId, startGame] = await createServer();
    startClient(roomId);
    setGameStarter(() => startGame);
  };

  const resumeOldGame = async () => {
    if (!oldGame) throw new Error("Trying to resume a null game");
    setResumingOldGame(true);
    const [roomId, startGame] = await createServer(oldGame.roomId);
    startClient(roomId);
    startGame(oldGame);
  };

  const [isLoading, setLoading] = useState(false);
  const error = usePlayerStore(getError, function eq(oldErr, newErr) {
    if (isLoading && oldErr !== newErr) setLoading(false);
    return oldErr === newErr;
  });

  useEffect(() => {
    if (urlRoomId) startClient(urlRoomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlRoomId]);

  const myName = usePlayerStore(getMyName);
  const client = usePlayerStore(getClient);
  const roomId = usePlayerStore(getRoomId);
  const players = usePlayerStore(getPlayers);
  const isConnected = usePlayerStore(getConnected);

  const url = `${window.location.host}/join/${roomId}`;
  const urlRef = useRef<HTMLPreElement>(null);

  const onNameSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const target = evt.target as typeof evt.target & {
      name: { value: string };
    };
    client.setName(target.name.value);
    setLoading(true);
  };

  const selectUrl = () => {
    const selection = window.getSelection();
    if (!selection) return;
    if (urlRef && urlRef.current) selection.selectAllChildren(urlRef.current);
  };

  const unselectUrl = () => {
    const selection = window.getSelection();
    if (!selection || !selection.empty) return;
    selection.empty();
  };

  const copyUrl = () => {
    const { clipboard } = navigator;
    if (!clipboard || !clipboard.writeText) return;
    clipboard.writeText(url);
  };

  return (
    <div className="WaitingRoom">
      {error && <p className="alert-error">{error}</p>}
      {isHost && oldGame && !isConnected && !isStartingNewGame ? (
        <>
          <div className="WaitingRoom__Button">
            <input
              type="button"
              value={`Reprendre partie${isResumingOldGame ? "..." : ""}`}
              onClick={resumeOldGame}
              disabled={isResumingOldGame}
            />
          </div>
          <div>
            <input
              type="button"
              value="Nouvelle partie"
              onClick={startNewGame}
              disabled={isResumingOldGame}
            />
          </div>
        </>
      ) : myName ? (
        <>
          <div>
            <p>En attente des autres joueurs...</p>
            <p>
              Envoyez cette URL aux autres joueurs pour qu'ils vous rejoignent:
            </p>
          </div>
          <div className="WaitingRoom__UrlBox">
            <code onClick={selectUrl} ref={urlRef}>
              {url}
            </code>
            <button
              className="WaitingRoom__CopyUrlBtn btn-ghost"
              onClick={copyUrl}
              onMouseDown={selectUrl}
              onMouseUp={unselectUrl}
              onMouseOut={unselectUrl}
            >
              <i className="icon-bag" />
              Copier l'URL
            </button>
          </div>
          <div>
            <p>Liste des joueurs en attente:</p>
            <ul className="WaitingRoom__PlayerList">
              {players.map(playerId => (
                <li key={playerId} className="WaitingRoom__Player">
                  {playerId}
                </li>
              ))}
            </ul>
          </div>
          {startGame ? (
            <button onClick={() => startGame()}>Lancer le jeu</button>
          ) : (
            <p>La partie commencera au signal de l'hôte.</p>
          )}
        </>
      ) : (
        <form onSubmit={onNameSubmit}>
          <label htmlFor="name">Choisis ton nom:</label>
          <input
            className="WaitingRoom__NameInput"
            id="name"
            name="name"
            type="text"
          />
          <input
            type="submit"
            value={
              isConnected
                ? `Rejoindre${isLoading ? "..." : ""}`
                : "Connexion..."
            }
            disabled={isLoading || !isConnected}
          />
        </form>
      )}
    </div>
  );
};

export default WaitingRoom;
