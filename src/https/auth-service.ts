import { IloginForm } from "@/types";
import { api } from "./api";
import { API_END_POINTS } from "./constants";

export const login = async (payload: IloginForm) => {
  try {
    return api.post(API_END_POINTS.LOGIN, payload);
  } catch (error) {
    throw error;
  }
};

export const getUserDetails = async (token: string) => {
  try {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return api.get(API_END_POINTS.USER_DETAILS);
  } catch (error) {
    throw error;
  }
};
