import { IloginForm, ISignupForm } from "@/types";
import { api } from "./api";
import { API_END_POINTS } from "./constants";

export const login = async (payload: IloginForm) => {
  try {
    return api.post(API_END_POINTS.LOGIN, payload);
  } catch (error) {
    throw error;
  }
};

export const getUserDetails = async () => {
  try {
    return api.get(API_END_POINTS.USER_DETAILS);
  } catch (error) {
    throw error;
  }
};

export const register = async (payload: ISignupForm) => {
  try {
    return api.post(API_END_POINTS.REGISTER, payload);
  } catch (error) {
    throw error;
  }
}


export const sendResetPasswordEmail = async (email: string) => {
  return api.post(API_END_POINTS.RESET_PASSWORD_EMAIL, { email });
};

export const restPassword = async (password: string, token: string) => {
  return api.patch(
    API_END_POINTS.RESET_PASSWORD,
    { password },
    {
      headers: {
        token: token,
      },
    }
  );
};