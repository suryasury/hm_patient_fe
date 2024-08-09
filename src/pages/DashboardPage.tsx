import { APP_ROUTES } from "@/appRoutes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import useErrorHandler from "@/hooks/useError";
import { getAppointmentList, getMedications } from "@/https/patients-service";
import { IAppointmentResponse, MedicationRes } from "@/types";
import { format } from "date-fns";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Cloud,
  CloudSun,
  Moon,
  PillBottle,
  Sun,
} from "lucide-react"; // Import icons
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NoAppointmentPage from "./NoAppointmentPage";
import { statusClasses } from "./utils";

const timeOfDayTitles: { [key: string]: { title: string; icon: JSX.Element } } =
  {
    morning: {
      title: "Morning",
      icon: <Sun className="w-4 h-4 text-yellow-500" />,
    },
    afternoon: {
      title: "Afternoon",
      icon: <CloudSun className="w-4 h-4 text-orange-500" />,
    },
    evening: {
      title: "Evening",
      icon: <Cloud className="h-4 w-4 text-gray-600" />,
    },
    night: { title: "Night", icon: <Moon className="w-4 h-4 text-blue-500" /> },
  };

const DashboardPage = () => {
  const [appointmentList, setAppointmentList] = useState<
    IAppointmentResponse[]
  >([]);
  const [pastAppointments, setPastAppointments] = useState<
    IAppointmentResponse[]
  >([]);
  const [medications, setMedications] = useState<MedicationRes>({
    isPrescriptionAvailable: false,
    times: {},
  });

  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingMedications, setLoadingMedications] = useState(false);

  const navigate = useNavigate();
  const handleError = useErrorHandler();

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const [appointmentRes, appointmentHistoryRes] = await Promise.all([
        getAppointmentList("upcoming"),
        getAppointmentList("history"),
      ]);

      if (appointmentHistoryRes.status === 401 || appointmentRes.status === 401)
        return;

      const upcomingAppointments = appointmentRes.data.data.appointmentList;
      const appointmentHistory =
        appointmentHistoryRes.data.data.appointmentList;
      setAppointmentList(upcomingAppointments);
      setPastAppointments(appointmentHistory);
    } catch (error) {
      handleError(error, "Failed to fetch appointments");
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchMedications = async () => {
    try {
      setLoadingMedications(true);
      const medicationRes = await getMedications(
        format(new Date(), "yyyy/MM/dd")
      );

      if (medicationRes.status === 401) return;

      const transformedMedications: MedicationRes = {
        isPrescriptionAvailable:
          medicationRes.data.data.isPriscriptionAvailableForTheDay,

        times: {
          morning: medicationRes.data.data.morningPrescription,
          afternoon: medicationRes.data.data.afterNoonPrescription,
          evening: medicationRes.data.data.eveningPrescription,
          night: medicationRes.data.data.nightPrescription,
        },
      };
      setMedications(transformedMedications);
    } catch (error) {
      handleError(error, "Failed to fetch medications");
    } finally {
      setLoadingMedications(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    fetchMedications();
  }, []);

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 w-full">
      {/* Upcoming Appointments Card */}
      <Card x-chunk="dashboard-01-chunk-5 w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <p>Upcoming Appointments</p>
            {appointmentList.length !== 0 && (
              <Button
                className="ml-auto gap-1 self-end"
                onClick={() =>
                  navigate(`${APP_ROUTES.APPOINTMENT_LIST}/upcoming`)
                }
                disabled={loadingAppointments}
                variant={"link"}
              >
                <div className="flex items-center gap-1">
                  <span>View All</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4  items-center">
          {loadingAppointments ? (
            <div className="flex items-center justify-center p-4 bg-gray-100 rounded-md mt-4">
              <Spinner />
              <span className="text-md font-medium text-gray-500">
                Looking for appointments...
              </span>
            </div>
          ) : appointmentList.length === 0 ? (
            <NoAppointmentPage />
          ) : (
            appointmentList.slice(0, 3).map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b last:border-none"
              >
                <Avatar className="hidden h-[50px] w-[50px] sm:flex self-start mt-[-8px]">
                  <AvatarImage
                    src={appointment.doctor.profilePictureUrl}
                    alt="Avatar"
                  />
                  <AvatarFallback>
                    {appointment.doctor.name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1 flex-1 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="text-md font-medium leading-none">
                        {appointment.doctor.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctor.speciality}
                      </p>
                    </div>
                    <div
                      className={`badge ${
                        statusClasses[appointment.appointmentStatus]
                      } px-2 py-1 rounded-lg text-xs w-[90px] text-center capitalize self-start`}
                    >
                      {appointment.appointmentStatus.toLowerCase()}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground justify-between w-full mt-2">
                    <div className="flex  items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleDateString()}
                      <Clock className="h-4 w-4 mx-2" />
                      <p>{appointment.doctorSlots.slot.startTime}</p>
                    </div>
                    <Button
                      onClick={() =>
                        navigate(
                          `${APP_ROUTES.APPOINTMENT_DETAILS}/${appointment.id}`
                        )
                      }
                      variant={"link"}
                      className="p-0 m-0 h-fit self-start"
                    >
                      <span className="mr-1">View</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Today's Medications Card */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <p>Today's Medications</p>

            {medications.isPrescriptionAvailable && (
              <Button
                variant={"link"}
                className="ml-auto gap-1 self-end"
                onClick={() => navigate(APP_ROUTES.MEDICATION)}
              >
               <div className="flex items-center gap-1">
                  <span>Show Details</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingMedications ? (
            <div className="flex items-center justify-center p-4 bg-gray-100 rounded-md mt-4">
              <Spinner />
              <span className="text-md font-medium text-gray-500">
                Looking for medications...
              </span>
            </div>
          ) : medications.isPrescriptionAvailable ? (
            Object.keys(medications.times).map((timeOfDay) => {
              if (medications.times[timeOfDay].length === 0) {
                return null;
              }

              return (
                <div key={timeOfDay}>
                  <h3 className="font-semibold capitalize mb-2 flex items-center gap-2">
                    {timeOfDayTitles[timeOfDay].icon}
                    {timeOfDayTitles[timeOfDay].title}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {medications.times[timeOfDay].map((medication) => (
                      <div
                        key={medication.prescriptionId}
                        className="p-2 rounded-lg border bg-white shadow-sm flex items-center justify-between"
                      >
                        <p className="text-sm font-medium">
                          {medication.medicationName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="flex items-center justify-center text-blue-500 p-4 bg-blue-100 rounded-md mt-4">
              <PillBottle className="md:w-6 md:h-6 w-8 h-8 sm:self-start mr-2" />
              <span className="text-md font-medium text-center">
                No Medication available for today!
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Appointment History Card */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <p>Past Appointments</p>
            {pastAppointments.length !== 0 && (
              <Button
                variant={"link"}
                className="ml-auto gap-1 self-end"
                onClick={() =>
                  navigate(`${APP_ROUTES.APPOINTMENT_LIST}/history`)
                }
                disabled={loadingAppointments}
              >
                <div className="flex gap-1 items-center">
                  <span>View All</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {loadingAppointments ? (
            <div className="flex items-center justify-center p-4 bg-gray-100 rounded-md mt-4">
              <Spinner />
              <span className="text-md font-medium text-gray-500">
                Looking for appointments...
              </span>
            </div>
          ) : pastAppointments.length === 0 ? (
            <NoAppointmentPage message="No Past Appointments" />
          ) : (
            pastAppointments.slice(0, 3).map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b last:border-none"
              >
                <Avatar className="hidden h-[50px] w-[50px] sm:flex">
                  <AvatarImage
                    src={appointment.doctor.profilePictureUrl}
                    alt="Avatar"
                  />
                  <AvatarFallback>
                    {appointment.doctor.name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1 flex-1 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="text-md font-medium leading-none">
                        {appointment.doctor.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctor.speciality}
                      </p>
                    </div>
                    <div
                      className={`badge ${
                        statusClasses[appointment.appointmentStatus]
                      } px-2 py-1 rounded-lg text-xs w-[90px] text-center capitalize self-start`}
                    >
                      {appointment.appointmentStatus.toLowerCase()}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground w-full justify-between mt-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleDateString()}
                      <Clock className="h-4 w-4 mx-2" />
                      {appointment.doctorSlots.slot.startTime}
                    </div>
                    <Button
                      onClick={() =>
                        navigate(
                          `${APP_ROUTES.APPOINTMENT_DETAILS}/${appointment.id}`
                        )
                      }
                      variant={"link"}
                      className="p-0 m-0 h-fit self-start"
                    >
                      <span className="mr-1">View</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
