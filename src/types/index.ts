// redux state type

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
  gender: "MALE" | "FEMALE" | "OTHER";
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
  decease: string;
  appointmentDate: string;
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
