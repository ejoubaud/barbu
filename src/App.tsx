import React from "react";
import "./App.css";
import "deck-of-cards/example/example.css";

import HostWaitingRoom from "./HostWaitingRoom";
// import MyHand from "./MyHand";

function App(): JSX.Element {
  return (
    <div className="App">
      <HostWaitingRoom />
    </div>
  );
}
export default App;
