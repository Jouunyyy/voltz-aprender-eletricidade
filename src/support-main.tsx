import React from "react";
import ReactDOM from "react-dom/client";
import VoltzSupport from "./voltz-support";
import "./voltz-support.css";

ReactDOM.createRoot(document.getElementById("support-root")!).render(
  <React.StrictMode><VoltzSupport /></React.StrictMode>,
);
