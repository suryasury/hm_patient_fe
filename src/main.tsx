import router from "@/router.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import "./index.css";
import { persistor, store } from "./state/store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={"loading..."} persistor={persistor}>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </PersistGate>
  </Provider>
);
