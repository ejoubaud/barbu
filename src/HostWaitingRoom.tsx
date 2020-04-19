import React, { useEffect } from "react";

import { useStore, useRoomId, RoomId, getMakeHost, useMyPlayer } from "./store";

import WaitingRoom, { NameSubmitter } from "./WaitingRoom";

const idCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
const newRoomId: RoomId = Array.from(Array(6))
  .map(() =>
    idCharacters.charAt(Math.floor(Math.random() * idCharacters.length))
  )
  .join("");

const HostWaitingRoom = () => {
  const [roomId, setRoomId] = useStore(useRoomId);
  const [playerName, setPlayerName] = useStore(useMyPlayer);
  const makeHost = useStore(getMakeHost);

  const handleNameSubmit: NameSubmitter = evt => {
    evt.preventDefault();
    const target = evt.target as typeof evt.target & {
      name: { value: string };
    };
    // TODO: validate name doesn't exist and isn't empty
    setPlayerName(target.name.value);
  };

  useEffect(() => {
    if (!roomId) {
      setRoomId(newRoomId);
      makeHost();
    }
  }, [setRoomId, roomId, makeHost]);

  return (
    <WaitingRoom
      roomId={roomId}
      onNameSubmit={handleNameSubmit}
      playerName={playerName}
    />
  );
};

export default HostWaitingRoom;
