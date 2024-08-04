import { store } from "@/state/store";
import { clearUser } from "@/state/userReducer";
import axios from "axios";

export const api = axios.create({
  baseURL: "https://uat-hm-api.tech42.in/api/v1/",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(clearUser());
    }
    return Promise.reject(error);
  }
);
