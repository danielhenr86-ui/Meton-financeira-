import React from "react";
import ReactDOM from "react-dom/client";
import MetonNext from "./MetonNext.jsx";
import InstallPrompt from "./InstallPrompt.jsx";
import ThemeControl from "./ThemeControl.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MetonNext />
    <ThemeControl />
    <InstallPrompt />
  </React.StrictMode>
);
