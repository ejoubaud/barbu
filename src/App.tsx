import React from "react";
import "./App.css";
import "deck-of-cards/example/example.css";

import WaitingRoom from "./WaitingRoom";
// import MyHand from "./MyHand";

function App(): JSX.Element {
  return (
    <div className="App">
      <WaitingRoom />
    </div>
  );
}
export default App;
