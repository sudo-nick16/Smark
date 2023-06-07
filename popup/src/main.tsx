import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { StoreProvider } from "./store/StoreProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StoreProvider>
    <App />
  </StoreProvider>
);
