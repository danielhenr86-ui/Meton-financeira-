import React from "react";
import ReactDOM from "react-dom/client";
import MetonStable from "./MetonStable.jsx";
import InstallPrompt from "./InstallPrompt.jsx";
import ThemeControl from "./ThemeControl.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MetonStable />
    <ThemeControl />
    <InstallPrompt />
  </React.StrictMode>
);
