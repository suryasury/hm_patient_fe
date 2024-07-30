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
