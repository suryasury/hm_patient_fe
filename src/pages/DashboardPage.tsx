import { APP_ROUTES } from "@/appRoutes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAppointmentHistory,
  getAppointmentList,
  getMedications,
} from "@/https/patients-service";
import { IAppointmentResponse, IMedicationResponse } from "@/types";
import { format } from "date-fns";
import {
  ArrowUpRight,
  Calendar,
  CalendarOff,
  Clock,
  Cloud,
  CloudSun,
  Eye,
  Moon,
  PlusCircle,
  Sun,
} from "lucide-react"; // Import icons
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AppointmentCardSkeleton = () => {
  return Array(3)
    .fill(0)
    .map((_item, index) => (
      <div
        key={index}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b last:border-none"
      >
        <Skeleton className="hidden h-[50px] w-[50px] sm:flex rounded-full" />
        <div className="grid gap-1 flex-1">
          <div className="flex items-center justify-between w-full">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-6 w-[90px] rounded-lg" />
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Skeleton className="h-4 w-4 mr-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 mx-2" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16 ml-2" />
          </div>
        </div>
      </div>
    ));
};

const statusClasses: { [key: string]: string } = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
  APPROVED: "bg-purple-100 text-purple-800",
};
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
  const [medications, setMedications] = useState<{
    [key: string]: IMedicationResponse[];
  }>({});

  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [medicationDate, setMedicationDate] = useState<Date | undefined>(
    new Date()
  );
  const [showMedicationDetails, setShowMedicationsDetails] =
    useState<boolean>(false);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const [appointmentRes, appointmentHistoryRes] = await Promise.all([
        getAppointmentList(),
        getAppointmentHistory(),
      ]);

      const upcomingAppointments = appointmentRes.data.data.appointmentList;
      const appointmentHistory =
        appointmentHistoryRes.data.data.appointmentList;
      setAppointmentList(upcomingAppointments);
      setPastAppointments(appointmentHistory);
    } catch (error) {
      console.error("Error fetching appointments", error);
      toast.error("Error fetching appointments", {
        description:
          "Our servers are facing technical issues. Please try again later.",
      });
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchMedications = async () => {
    try {
      setLoadingMedications(true);
      const medicationRes = await getMedications(
        format(medicationDate!, "yyyy/MM/dd")
      );
      const transformedMedications = {
        morning: medicationRes.data.data.morningPrescription,
        afternoon: medicationRes.data.data.afterNoonPrescription,
        evening: medicationRes.data.data.eveningPrescription,
        night: medicationRes.data.data.nightPrescription,
      };
      setMedications(transformedMedications);
    } catch (error) {
      console.error("Error fetching medications", error);
      toast.error("Error fetching medications", {
        description:
          "Our servers are facing technical issues. Please try again later.",
      });
    } finally {
      setLoadingMedications(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    fetchMedications();
  }, [medicationDate]);

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 w-full">
      {/* Upcoming Appointments Card */}
      <Card x-chunk="dashboard-01-chunk-5 w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <p>Upcoming Appointments</p>
            {appointmentList.length !== 0 && (
              <Button
                size="sm"
                className="ml-auto gap-1 self-end"
                onClick={() =>
                  navigate(APP_ROUTES.APPOINTMENT_LIST, {
                    state: appointmentList,
                  })
                }
                disabled={loadingAppointments}
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
            <AppointmentCardSkeleton />
          ) : appointmentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8  ">
              <div className="text-4xl text-muted-foreground mb-4">
                <CalendarOff className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium text-muted-foreground mb-4">
                No upcoming appointments
              </p>
              <Button onClick={() => navigate(APP_ROUTES.APPOINTMENT)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          ) : (
            appointmentList.slice(0, 3).map((appointment) => (
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
                <div className="grid gap-1 flex-1">
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
                      } px-2 py-1 rounded-lg text-xs w-[90px] text-center capitalize`}
                    >
                      {appointment.appointmentStatus.toLowerCase()}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                    <Clock className="h-4 w-4 mx-2" />
                    {appointment.doctorSlots.slot.startTime}
                    <Button
                      onClick={() =>
                        navigate(APP_ROUTES.APPOINTMENT_DETAILS, {
                          state: appointment,
                        })
                      }
                      variant={"link"}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="ml-1">View</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Appointment History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <p>Past Appointments</p>
            <Button
              size="sm"
              className="ml-auto gap-1"
              onClick={() =>
                navigate(APP_ROUTES.APPOINTMENT_LIST, {
                  state: pastAppointments,
                })
              }
              disabled={loadingAppointments}
            >
              <div className="flex gap-1 items-center">
                <span>View All</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {loadingAppointments ? (
            <AppointmentCardSkeleton />
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
                <div className="grid gap-1 flex-1">
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
                      } px-2 py-1 rounded-lg text-xs w-[90px] text-center capitalize`}
                    >
                      {appointment.appointmentStatus.toLowerCase()}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                    <Clock className="h-4 w-4 mx-2" />
                    {appointment.doctorSlots.slot.startTime}
                    <Button
                      onClick={() =>
                        navigate(APP_ROUTES.APPOINTMENT_DETAILS, {
                          state: appointment,
                        })
                      }
                      variant={"link"}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="ml-1">View</span>
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

            <Button
              size="sm"
              className="ml-auto gap-1"
              onClick={() => navigate(APP_ROUTES.MEDICATION)}
            >
              <div className="flex gap-1 items-center">
                <span>Show Details</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingMedications ? (
            <AppointmentCardSkeleton />
          ) : (
            Object.keys(medications).map((timeOfDay) => (
              <div key={timeOfDay}>
                <h3 className="font-semibold capitalize mb-2 flex items-center gap-2">
                  {timeOfDayTitles[timeOfDay].icon}
                  {timeOfDayTitles[timeOfDay].title}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {medications[timeOfDay].map((medication) => (
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
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
