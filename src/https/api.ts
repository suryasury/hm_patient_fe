import axios from "axios";

export const api = axios.create({
  baseURL: "https://uat-hm-api.tech42.in/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

