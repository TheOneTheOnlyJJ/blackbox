import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import { App } from "./App";

const CONTAINER: HTMLElement | null = document.getElementById("root");
if (CONTAINER) {
  const ROOT: Root = createRoot(CONTAINER);
  ROOT.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
