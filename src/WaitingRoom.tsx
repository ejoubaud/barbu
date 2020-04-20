import React, { useRef, FormEvent } from "react";

import { PlayerId } from "./store";
import "./WaitingRoom.css";

export type NameSubmitter = (evt: FormEvent<HTMLFormElement>) => void;
type WaitingRoomProps = {
  roomId: string;
  playerName: PlayerId;
  onNameSubmit: NameSubmitter;
};

const WaitingRoom = ({
  roomId,
  playerName,
  onNameSubmit
}: WaitingRoomProps) => {
  const url = `${window.location.host}/join/${roomId}`;
  const urlRef = useRef<HTMLPreElement>(null);

  const selectUrl = () => {
    const selection = window.getSelection();
    if (!selection) return;
    if (urlRef && urlRef.current) selection.selectAllChildren(urlRef.current);
  };

  const unselectUrl = () => {
    const selection = window.getSelection();
    if (!selection || !selection.empty) return;
    selection.empty();
  }

  const copyUrl = () => {
    const { clipboard } = navigator;
    if (!clipboard || !clipboard.writeText) return;
    clipboard.writeText(url);
  };

  return (
    <div className="WaitingRoom">
      {playerName ? (
        <div>
          <p>En attente des autres joueurs...</p>
          <p>
            Envoyez cette URL aux autres joueurs pour qu'ils vous rejoignent:
          </p>
          <code onClick={selectUrl} ref={urlRef}>
            {url}
          </code>
          <button className="WaitingRoom__CopyUrlBtn btn-ghost" onClick={copyUrl} onMouseDown={selectUrl} onMouseUp={unselectUrl} onMouseOut={unselectUrl}>
            <i className="icon-bag" />
            Copier l'URL
          </button>
        </div>
      ) : (
        <form onSubmit={onNameSubmit}>
          <label htmlFor="name">Choisis ton nom:</label>
          <input id="name" name="name" type="text" />
          <input type="submit" value="Rejoindre" />
        </form>
      )}
    </div>
  );
};

export default WaitingRoom;
