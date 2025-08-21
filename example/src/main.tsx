import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";
import MagicProviderWrapper from "./provider/MagicProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MagicProviderWrapper>
      <App />
      <Toaster position="top-right" />
    </MagicProviderWrapper>
  </StrictMode>
);
