import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { ThemeProvider } from "./contexts/ThemeContext";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/delivery-sw.js").catch(() => {
      // In-app toasts remain the fallback when service workers are unavailable.
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider switchable={true}>
    <App />
  </ThemeProvider>
);
