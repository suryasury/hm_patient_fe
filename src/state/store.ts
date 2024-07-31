import { configureStore, Reducer } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import userReducer from "./reducers";
import { UserState } from "@/types";

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, userReducer as Reducer<UserState>);

const store = configureStore({
  reducer: persistedReducer,
  // Add any middleware or enhancers here
});

const persistor = persistStore(store);

export { store, persistor };