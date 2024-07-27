import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LoggerProvider } from "./components/LoggerContext";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <LoggerProvider>
        <App />
      </LoggerProvider>
    </StrictMode>
  );
}
