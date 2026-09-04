import React from "react";
import ReactDOM from "react-dom/client";
import FullVoltzApp from "./full-voltz-app";
import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FullVoltzApp user={null} signInPath="#" signOutPath="#" />
  </React.StrictMode>,
);
