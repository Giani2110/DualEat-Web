import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
import "./index.scss";
import "./App.css";
import App from "./App.tsx";

import { Provider } from "react-redux";
import { store } from "./hub/index.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
