import React from "react";
import "./App.css";
import "deck-of-cards/example/example.css";

import MyHand from "./MyHand";

function App(): JSX.Element {
  return (
    <div className="App">
      <MyHand />
    </div>
  );
}
export default App;
