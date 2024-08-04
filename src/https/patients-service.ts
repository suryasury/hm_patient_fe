import { IAppointmentForm, IUpdatePrescriptionTakenPayload } from "@/types";
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

export const getDoctorSlots = async (doctorId: string, weekdayId: string) => {
  try {
    return api.get(`${API_END_POINTS.DOCTOR_SLOTS}/${doctorId}/${weekdayId}`);
  } catch (error) {
    throw error;
  }
};

export const createAppointment = async (payload: IAppointmentForm) => {
  try {
    return api.post(API_END_POINTS.CREATE_APPOINTMENT, payload);
  } catch (error) {
    throw error;
  }
};

export const getAppointmentList = async (type: string) => {
  try {
    const URL =
      type === "upcoming"
        ? API_END_POINTS.APPOINTMENT_LIST
        : API_END_POINTS.APPOINTMENT_HISTORY;
    return api.get(URL);
  } catch (error) {
    throw error;
  }
};

export const getAppointmentHistory = async () => {
  try {
    return api.get(API_END_POINTS.APPOINTMENT_HISTORY);
  } catch (error) {
    throw error;
  }
};

export const getMedications = async (date?: string) => {
  try {
    return api.get(API_END_POINTS.MEDICATIONS + `?date=${date}`);
  } catch (error) {
    throw error;
  }
};

export const updatePrescriptionTaken = async (
  payload: IUpdatePrescriptionTakenPayload
) => {
  try {
    return api.patch(API_END_POINTS.UPDATE_MEDICATION_TAKEN, payload);
  } catch (error) {
    throw error;
  }
};

export const uploadDocuments = async (data: FormData) => {
  try {
    return api.post(API_END_POINTS.UPLOAD_DOCUMENTS, data);
  } catch (error) {
    throw error;
  }
};

export const getAppointmentDetails = async (appointmentId: string) => {
  try {
    return api.get(`${API_END_POINTS.APPOINTMENT_DETAILS}/${appointmentId}`);
  } catch (error) {
    throw error;
  }
};

export const uploadProfilePicture = async (data: FormData) => {
  try {
    return api.post(API_END_POINTS.UPLOAD_PROFiLE_PICTURE, data);
  } catch (error) {
    throw error;
  }
}