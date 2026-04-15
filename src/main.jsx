import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { enableAnalytics } from "./firebase";

enableAnalytics().catch(() => {
  // Keep app functional even if analytics is unavailable.
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
