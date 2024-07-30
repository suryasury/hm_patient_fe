import { store } from "@/state/store";
import axios from "axios";

export const api = axios.create({
  baseURL: "https://uat-hm-api.tech42.in/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const accessToken = store.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
