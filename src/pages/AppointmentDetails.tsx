import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarCheck,
  CalendarX,
  CloudSun,
  Moon,
  Stethoscope,
  Sun,
} from "lucide-react";

import DatePicker from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  IAppointmentForm,
  IAppointmentResponse,
  IAppointmentState,
  ISlot,
  ITimeSlot,
  UserState,
} from "@/types";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { APP_ROUTES } from "@/appRoutes";
import Spinner from "@/components/ui/spinner";
import { createAppointment, getDoctorSlots } from "@/https/patients-service";
import { SubmitHandler } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { getWeekdayId } from "./utils";

const getIconForPeriod = (period: string) => {
  switch (period) {
    case "Morning":
      return <Sun className="w-5 h-5 text-yellow-500" />;
    case "Afternoon":
      return <CloudSun className="w-5 h-5 text-orange-500" />;
    case "Evening":
      return <Moon className="w-5 h-5 text-blue-500" />;
    default:
      return null;
  }
};

const AppointmentDetails = () => {
  const location = useLocation();
  const appointment = location.state as IAppointmentResponse;

  const [selectedSlot, setSelectedSlot] = useState<ISlot>({
    ...appointment.doctorSlots.slot,
    id: appointment.doctorSlotId,
  });
  const [timeSlots, setTimeSlots] = useState<ITimeSlot>({
    isSlotAvailable: false,
    slots: {},
  });
  const [fetchingTimeSlots, setFetchingTimeSlots] = useState(false);
  const [showChangeTimeDialog, setShowChangeTimeDialog] = useState(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(appointment.appointmentDate)
  );
  const user = useSelector((state: { user: UserState }) => state.user.user);
  const weekdays = useSelector(
    (state: { appointment: IAppointmentState }) => state.appointment.weekdays
  );

  const navigate = useNavigate();
  const defaultValues = {
    patientName: user?.name,
    patientMobile: `${user?.phoneNumber}`,
    decease: "",
    remarks: "",
  };

  const handleConfirmAppointment: SubmitHandler<IAppointmentForm> = async (
    data: IAppointmentForm
  ) => {
    try {
      setSubmitting(true);
      const { remarks, decease } = data;

      const payload: IAppointmentForm = {
        doctorId: appointment.doctor.id,
        doctorSlotId: appointment.doctorSlotId,
        hospitalId: appointment.hospitalId,
        remarks,
        decease,
        appointmentDate: selectedDate!.toISOString(),
      };
      const res = await createAppointment(payload);
      if (res.status === 200) {
        toast.success("Updated Successfully", {
          description: "Your Appointment has been updated successfully!",
        });
        navigate(APP_ROUTES.DASHBOARD);
      }
    } catch (error) {
      console.log(error);

      toast.error("Failed!", {
        description:
          "Our systems are facing technical difficulties, please try later!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      setFetchingTimeSlots(true);
      const weekdayId = getWeekdayId(weekdays!, selectedDate);
      if (weekdayId) {
        const res = await getDoctorSlots(location.state?.doctor?.id, weekdayId);
        const formattedData = (slot: { id: string; slot: ISlot }) => ({
          id: slot.id,
          startTime: slot.slot.startTime,
          hospitalId: slot.slot.hospitalId,
        });
        const data = res.data.data.slotDetails;
        const timeSlotData = {
          isSlotAvailable: res.data.data.isSlotAvailableForTheDay,
          slots: {
            Morning: data.morningSlots.map(formattedData),
            Afternoon: data.afternoonSlots.map(formattedData),
            Evening: data.eveningSlots.map(formattedData),
          },
        };
        setTimeSlots(timeSlotData);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch time slots", {
        description:
          "Our servers are facing technical issues. Please try again later.",
      });
    } finally {
      setFetchingTimeSlots(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, [selectedDate, showChangeTimeDialog]);

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="w-full sm:w-[50%] h-fit">
          <Card>
            <CardHeader>
              <CardTitle>In-Clinic Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <hr className="border-t border-gray-200" />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4 sm:gap-0">
                <div className="flex gap-2 items-center">
                  <CalendarCheck className="text-[#414146] w-5 h-5 text-sm" />
                  <p>
                    On
                    <span className="ml-2 text-md font-semibold">
                      {format(
                        appointment.appointmentDate
                          ? new Date(appointment.appointmentDate)
                          : new Date(),
                        "dd/MM/yyyy"
                      )}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Clock className="text-[#414146] w-5 h-5 text-sm" />
                  <p>
                    At
                    <span className="ml-2 text-md font-semibold">
                      {selectedSlot.startTime}
                    </span>
                  </p>
                </div>
              </div>

              <div className="ml-[-14px]">
                <Dialog
                  open={showChangeTimeDialog}
                  onOpenChange={(isOpen) => {
                    setShowChangeTimeDialog(isOpen);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="link" className="text-[#199fd9]">
                      Change Date and time slot
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95%] max-h-[90vh] min-h-[40vh] rounded-lg shadow-lg flex flex-col overflow-auto">
                    <DialogHeader>
                      <DialogTitle>Change Date and Time Slot</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                      <CardDescription>Select Date</CardDescription>
                      <div className="w-fit">
                        <DatePicker
                          date={selectedDate}
                          setDate={(date) => setSelectedDate(date)}
                          placeholder="Select a date"
                        />
                      </div>
                      {fetchingTimeSlots ? (
                        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-md mt-4">
                          <Spinner />
                          <span className="text-md font-medium text-gray-500">
                            Looking for slots...
                          </span>
                        </div>
                      ) : (
                        selectedDate &&
                        (timeSlots.isSlotAvailable ? (
                          <div className="mt-4">
                            <p className="text-md font-medium mb-2">
                              Available Slots
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {Object.entries(timeSlots.slots).map(
                                ([period, slots]) =>
                                  slots.length !== 0 && (
                                    <React.Fragment key={period}>
                                      <div className="col-span-full flex items-center gap-4">
                                        {getIconForPeriod(period)}
                                        <h5 className="text-md font-semibold">
                                          {period}
                                        </h5>
                                      </div>
                                      <div className="col-span-full grid grid-cols-3 gap-2">
                                        {slots.map((slot: ISlot) => (
                                          <div
                                            key={slot.id}
                                            className={`p-2 text-sm md:text-base rounded cursor-pointer border w-auto text-center ${
                                              selectedSlot.id === slot.id
                                                ? "bg-muted"
                                                : "hover:bg-muted"
                                            }`}
                                            onClick={() => {
                                              setSelectedSlot(slot);
                                              setShowChangeTimeDialog(false);
                                            }}
                                          >
                                            {slot.startTime}
                                          </div>
                                        ))}
                                      </div>
                                      <div className="col-span-full">
                                        <hr className="border-t border-gray-200 my-2" />
                                      </div>
                                    </React.Fragment>
                                  )
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="flex items-center justify-center text-red-500 p-4 bg-red-100 rounded-md mt-4">
                            <CalendarX className="w-6 h-6 mr-2" />
                            <span className="text-md font-medium">
                              No slots available
                            </span>
                          </p>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <div className="flex justify-between items-center">
                  <div className="doctor-profile-pic flex items-center gap-4">
                    <Avatar className="w-[100px] h-[100px]">
                      <AvatarImage
                        src={location.state?.doctor.profilePictureUrl}
                        alt={location.state?.doctor.name}
                      />
                      <AvatarFallback>
                        <Stethoscope className="w-10 h-10" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xl font-medium">
                        {location.state?.doctor.name}
                      </p>
                      <p className="text-gray-600">
                        {location.state?.doctor.speciality}
                      </p>
                      <p className="text-gray-600">
                        Mobile: {location.state?.doctor.isd_code}{" "}
                        {location.state?.doctor.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full sm:w-[50%]">
          <Card>
            <CardHeader>
              <CardTitle>Patient Details</CardTitle>
              <CardDescription>
                This in-clinic appointment is for:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <form className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="patient-name">Name</Label>
                    <Input
                      id="patient-name"
                      type="text"
                      value={user?.name}
                      disabled
                      className="border-2 rounded-sm p-2"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="patient-mobile">Mobile Number</Label>
                    <Input
                      id="patient-mobile"
                      type="text"
                      value={user?.phoneNumber}
                      disabled
                      className="border-2 rounded-sm p-2"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ailment">Ailment</Label>
                    <Input
                      id="ailment"
                      type="text"
                      value={appointment.decease}
                      className="border-2 rounded-sm p-2"
                      disabled
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={appointment.remarks}
                      className="border-2 rounded-sm p-2"
                      disabled
                    />
                  </div>

                  <Button type="submit" className="mt-4" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Spinner type="light" />
                        Please wait...
                      </>
                    ) : (
                      "Update Appointment"
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
