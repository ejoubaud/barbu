import React, { useRef, useState, FormEvent } from "react";

import "./WaitingRoom.css";
import {
  useStore,
  getMyName,
  getClient,
  getError,
  getRoomId,
  getPlayers,
  getGameStarter
} from "./store";

export type NameSubmitter = (evt: FormEvent<HTMLFormElement>) => void;

const WaitingRoom = () => {
  const myName = useStore(getMyName);
  const client = useStore(getClient);
  const roomId = useStore(getRoomId);
  const players = useStore(getPlayers);
  const startGame = useStore(getGameStarter);
  const [isLoading, setLoading] = useState(false);
  const error = useStore(getError, function eq(oldErr, newErr) {
    if (isLoading && oldErr !== newErr) setLoading(false);
    return oldErr === newErr;
  });

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
      {myName ? (
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
          {startGame && (
            <button
              onClick={evt => {
                startGame();
              }}
            >
              Lancer le jeu
            </button>
          )}
        </>
      ) : (
        <form onSubmit={onNameSubmit}>
          {error && <p className="alert-error">{error}</p>}
          <label htmlFor="name">Choisis ton nom:</label>
          <input id="name" name="name" type="text" />
          <input
            type="submit"
            value={`Rejoindre${isLoading ? "..." : ""}`}
            disabled={isLoading}
          />
        </form>
      )}
    </div>
  );
};

export default WaitingRoom;
