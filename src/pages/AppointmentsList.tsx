import { APP_ROUTES } from "@/appRoutes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import useErrorHandler from "@/hooks/useError";
import { getAppointmentList } from "@/https/patients-service";
import { IAppointmentResponse } from "@/types";
import { ArrowRight, Calendar, Clock } from "lucide-react"; // Import the Eye icon
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NoAppointmentPage from "./NoAppointmentPage";
import { statusClasses } from "./utils";

const AppointmentCard = ({
  appointment,
}: {
  appointment: IAppointmentResponse;
}) => {
  const navigate = useNavigate();
  return (
    <div
      key={appointment.id}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b last:border-none"
    >
      <Avatar className="hidden h-[50px] w-[50px] sm:flex self-start mt-[-8px]">
        <AvatarImage src={appointment.doctor.profilePictureUrl} alt="Avatar" />
        <AvatarFallback>
          {appointment.doctor.name
            .split(" ")
            .map((name) => name[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-1 flex-1 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="gap-1 flex flex-col">
            <p className="text-md font-medium leading-none">
              {appointment.doctor.name}{" "}
              <span className="text-[12px] text-muted-foreground">
                {appointment.doctor.qualification}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              {appointment.doctor.speciality}
            </p>
            <p className="text-[12px] text-muted-foreground">
              Token No: {appointment.tokenNumber}
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
            {new Date(appointment.appointmentDate).toLocaleDateString()}
            <Clock className="h-4 w-4 mx-2" />
            <p>{appointment.doctorSlots.slot.startTime}</p>
          </div>
          <Button
            onClick={() =>
              navigate(`${APP_ROUTES.APPOINTMENT_DETAILS}/${appointment.id}`)
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
  );
};

const AppointmentsList = () => {
  const [appointmentList, setAppointmentList] = useState<
    IAppointmentResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleError = useErrorHandler();
  const { type = "upcoming" } = useParams();

  console.log(type);

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

  const getTextAndLink = () => {
    if (type === "upcoming") {
      return {
        text: "Past",
        link: `${APP_ROUTES.APPOINTMENT_LIST}/history`,
      };
    } else {
      return {
        text: "Upcoming",
        link: `${APP_ROUTES.APPOINTMENT_LIST}/upcoming`,
      };
    }
  };

  return (
    <Card className="w-full h-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap justify-between ">
          <p>{type === "upcoming" ? "Upcoming" : "Past"} Appointments</p>
          {appointmentList.length !== 0 && (
            <Button
              size="sm"
              className="mt-2 md:mt-0"
              onClick={() => navigate(getTextAndLink().link)}
            >
              {getTextAndLink().text} Appointments
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 h-100 ">
        {loading ? (
          <div className="flex items-center justify-center p-4 bg-gray-100 rounded-md mt-4">
            <Spinner />
            <span className="text-md font-medium text-gray-500">
              Looking for appointments...
            </span>
          </div>
        ) : appointmentList.length === 0 ? (
          <NoAppointmentPage />
        ) : (
          appointmentList.map((appointment: IAppointmentResponse) => (
            <AppointmentCard appointment={appointment} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsList;
