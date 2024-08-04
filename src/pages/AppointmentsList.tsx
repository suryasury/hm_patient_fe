import { APP_ROUTES } from "@/appRoutes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useErrorHandler from "@/hooks/useError";
import { getAppointmentList } from "@/https/patients-service";
import { IAppointmentResponse } from "@/types";
import { Calendar, Clock, Eye } from "lucide-react"; // Import the Eye icon
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
const statusClasses: { [key: string]: string } = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
  APPROVED: "bg-purple-100 text-purple-800",
};

const AppointmentListSkeleton = () => {
  return Array(5)
    .fill(0)
    .map((_i, index) => (
      <div
        key={index}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b last:border-none"
      >
        <div className="hidden h-[50px] w-[50px] sm:flex">
          <Skeleton className="rounded-full h-[50px] w-[50px]" />
        </div>
        <div className="grid gap-1 flex-1">
          <div className="flex items-center justify-between w-full">
            <div>
              <Skeleton className="h-[10px] w-[100px] mb-1" />
              <Skeleton className="h-[8px] w-[80px]" />
            </div>
            <Skeleton className="h-[20px] w-[90px]" />
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Skeleton className="h-[10px] w-[20px] mr-2" />
            <Skeleton className="h-[10px] w-[100px] mr-2" />
            <Skeleton className="h-[10px] w-[20px] mr-2" />
            <Skeleton className="h-[10px] w-[50px] mr-2" />
            <Skeleton className="h-[10px] w-[50px]" />
          </div>
        </div>
      </div>
    ));
};
const AppointmentsList = () => {
  const [appointmentList, setAppointmentList] = useState<
    IAppointmentResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleError = useErrorHandler();
  const { type = "upcoming" } = useParams();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const appointmentRes = await getAppointmentList(type!);
      const transformedAppointments = appointmentRes.data.data.appointmentList;
      setAppointmentList(transformedAppointments);
    } catch (error) {
      handleError(error, "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [type]);

  return (
    <Card className="w-full h-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between ">
          <p>{type === "upcoming" ? "Upcoming" : "Past"} Appointments</p>
          {type === "upcoming" ? (
            <Button
              size="sm"
              onClick={() => navigate(`${APP_ROUTES.APPOINTMENT_LIST}/history`)}
            >
              Show Past Appointments
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() =>
                navigate(`${APP_ROUTES.APPOINTMENT_LIST}/upcoming`)
              }
            >
              Show Upcoming Appointments
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 h-100 ">
        {loading ? (
          <AppointmentListSkeleton />
        ) : (
          appointmentList.map((appointment: IAppointmentResponse) => (
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
                <div className="flex items-center text-sm text-muted-foreground w-full justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
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
                    className="p-0 self-start"
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
  );
};

export default AppointmentsList;
