export interface UserState {
  user: User | null;
  accessToken: string | null;
}

// export interface User {
//   id: string;
//   createdAt: string;
//   updatedAt: string;
//   name: string;
//   email: string;
//   password: string;
//   isEmailVerified: boolean;
//   isMobileNumberVerified: boolean;
//   phoneNumber: string;
//   isd_code: string;
//   dateOfBirth: string;
//   gender: "MALE" | "FEMALE" | "OTHER";
//   profilePictureUrl: string | null;
// }

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
  profilePictureUrl: string | undefined ;
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
  id: number;
  name: string;
  profilePictureUrl: string;
  speciality: string;
  isd_code: string;
  phoneNumber: string;
  address: string;
}

export interface appointmentForm {}

export interface IloginForm {
  userName: string;
  password: string;
}
