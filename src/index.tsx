import React from "react";
import ReactDOM from "react-dom";
import "simple-line-icons/css/simple-line-icons.css";

import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import createServer from "./server";
import initClient from "./client";
import { RoomId, ServerGameStarter } from "./common";
import { setClient, setError, setGameStarter } from "./playerStore";

import { enableMapSet } from "immer";
enableMapSet();

let roomId: RoomId;
const guestUrl = window.location.pathname.match("/join/(.*)$");
if (guestUrl) {
  roomId = guestUrl[1];
} else {
  let startGame: ServerGameStarter;
  [roomId, startGame] = createServer();
  setGameStarter(startGame);
}
initClient(roomId).then(
  client => setClient(roomId, client),
  err => {
    console.log("Client init error:", err);
    setError(
      "Erreur de connexion. Vérifier l'URL et rafraichir pour réessayer"
    );
  }
);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
