import React from "react";
import "./App.css";
import "deck-of-cards/example/example.css";

import WaitingRoom from "./WaitingRoom";
import BarbuContainer from "./BarbuContainer";

import { usePlayerStore, getGameStarted } from "./playerStore";

function App(): JSX.Element {
  const isGameStarted = usePlayerStore(getGameStarted);
  return (
    <div className="App">
      {isGameStarted ? <BarbuContainer /> : <WaitingRoom />}
    </div>
  );
}
export default App;
