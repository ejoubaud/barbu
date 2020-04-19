import React, { useRef, FormEvent, MouseEvent } from "react";

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

  const selectUrl = (evt: MouseEvent<HTMLPreElement>) => {
    const selection = window.getSelection();
    if (!selection) return;
    if (urlRef && urlRef.current) selection.selectAllChildren(urlRef.current);
  };

  const copyUrl = () => {
    const { clipboard } = navigator;
    if (!clipboard || !clipboard.writeText) return;
    clipboard.writeText(url);
    const selection = window.getSelection();
    if (!selection || !selection.empty) return;
    selection.empty();
  };

  return (
    <div className="WaitingRoom">
      {playerName ? (
        <div>
          <p>En attente des autres joueurs...</p>
          <p>
            Envoyez cette URL aux autres joueurs pour qu'ils vous rejoignent:
          </p>
          <pre onClick={selectUrl} ref={urlRef}>
            {url}
          </pre>
          <input type="button" onClick={copyUrl} value="Copier l'URL" />
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
