import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");

const electronApi = window.electron;

if (container) {
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <App electronApi={electronApi} />
    </React.StrictMode>
  );
}
