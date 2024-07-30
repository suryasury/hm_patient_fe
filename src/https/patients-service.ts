import { api } from "./api";
import { API_END_POINTS } from "./constants";

export const getDoctorsList = async () => {
  try {
    return api.get(API_END_POINTS.DOCTORS_LIST);
  } catch (error) {
    throw error;
  }
};
export const getWeekdayList = async () => {
  try {
    return api.get(API_END_POINTS.WEEKDAY_LIST);
  } catch (error) {
    throw error;
  }
};
