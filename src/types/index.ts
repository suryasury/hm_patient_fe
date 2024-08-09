// redux state type

import { Dispatch, SetStateAction } from "react";

export interface UserState {
  user: User | null;
}

export interface IWeekday {
  id: string;
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
}
export interface IAppointmentState {
  weekdays: IWeekday[] | null;
}

// app types
export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  isMobileNumberVerified: boolean;
  phoneNumber: string;
  isd_code: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHERS";
  profilePictureUrl: string | undefined;
  bloodGroup: string;
  address: {
    houseNumber: string;
    colony: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  signedUrl: string;
}
export interface Doctor {
  id: string;
  name: string;
  profilePictureUrl: string;
  speciality: string;
  isd_code: string;
  phoneNumber: string;
  address: string;
}

export interface IAppointmentForm {
  doctorId: string;
  doctorSlotId: string;
  hospitalId: string;
  remarks: string;
  ailmentId: string;
  appointmentDate: string;
  documents?:IMedicalReport[];
}

export interface IloginForm {
  userName: string;
  password: string;
}
export interface ISlot {
  id: string;
  startTime: string;
  hospitalId: string;
}
export interface ISlots {
  Morning?: ISlot[];
  Afternoon?: ISlot[];
  Evening?: ISlot[];
}
export interface ITimeSlot {
  isSlotAvailable: boolean;
  slots: ISlots;
}

export interface IAppointmentResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  doctorSlotId: string;
  doctorId: string;
  patientId: string;
  hospitalId: string;
  remarks: string;
  doctorRemarks: string | null;
  ailmentId: string;
  appointmentStatus:
    | "SCHEDULED"
    | "PENDING"
    | "COMPLETED"
    | "CANCELED"
    | "APPROVED";
  appointmentDate: string;
  doctor: Doctor;
  doctorSlots: {
    id: string;
    doctorId: string;
    createdAt: string;
    updatedAt: string;
    slotId: string;
    weekDaysId: string;
    slotLimit: number;
    isEnabled: boolean;
    isActive: boolean;
    isDeleted: boolean;
    slot: {
      id: string;
      startTime: string;
      endTime: string;
      createdAt: string;
      updatedAt: string;
      hospitalId: string;
    };
  };
  patientAppointmentDocs?: IMedicalReport[];
  isFeedbackProvided: boolean;
  appointmentFeedbacks: Record<string, string>;
  patientPrescription: IPrescription[];
}

export interface IMedicationStock {
  id: string;
  medicationName: string;
  medicationDosage: string;
  description: string;
}

export interface IPrescription {
  id: string;
  createdAt: string;
  updatedAt: string;
  appointmentId: string;
  patientId: string;
  hospitalId: string;
  durationInDays: number;
  medicationStockId: string;
  foodRelation: string;
  medicationStock: IMedicationStock;
}

export interface IMedicationResponse {
  prescriptionId: string;
  appointmentId: string;
  hospitalId: string;
  patientId: string;
  medicationName: string;
  medicationDosage: string;
  foodRelation: string;
  prescriptionDate: string;
  prescriptionDayId: string;
  prescriptionTimeOfDayId: string;
  isPrescriptionTakenForTheDay: boolean;
  prescriptionTimeOfDay: string;
  isPrescriptionTaken: boolean;
}

export interface ITodaysMedicationsResponse {
  isPriscriptionAvailableForTheDay: boolean;
  morningPrescription: IMedicationResponse[];
  afterNoonPrescription: IMedicationResponse[];
  eveningPrescription: IMedicationResponse[];
  nightPrescription: IMedicationResponse[];
}

export interface MedicationsProps {
  medicationDate: Date | undefined;
  setMedicationDate: Dispatch<SetStateAction<Date | undefined>>;
  loadingMedications: boolean;
  medications: { [key: string]: IMedicationResponse[] };
}

export interface IUpdatePrescriptionTakenPayload {
  prescriptionDayId: string;
  prescriptionTimeOfDayId: string;
  isPrescriptionTaken: boolean;
}
export interface ISignupForm {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  isd_code: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  houseNumber?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface MedicationRes {
  isPrescriptionAvailable: boolean;
  times: { [key: string]: IMedicationResponse[] };
}

export interface IReportUpload {
  [reportType: string]: File;
}

export interface IUpdateAppointmentDetails {
  appointmentDetails?: {
    remarks?: string;
    ailmentId?: string;
    appointmentDate?: string;
    doctorSlotId?: string;
    appointmentStatus?: string;
  };
  removedDocuments?: {
    id: string;
    bucketPath: string;
  }[];
  documents?:IMedicalReport[];
 
}

export interface IUpdateUserProfile {
  name?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHERS";
  bloodGroup?: string;
  houseNumber?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phoneNumber?: string;
}

export interface IMedicalReportType {
  id: string;
  name: string;
}

export interface IMedicalReport {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  documentName: string;
  bucketPath: string;
  fileName: string;
  fileExtension: string;
  documentTypeId?: string;
  contentType: string;
  patientId: string;
  appointmentId: string;
  isDeleted: boolean;
  documentTypes: IMedicalReportType;
  signedUrl: string;
  documentTypeName?: string;
}
