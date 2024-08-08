import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DatePicker from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  IAppointmentForm,
  IAppointmentState,
  ISlot,
  ITimeSlot,
  UserState,
} from "@/types";
import { format } from "date-fns";
import {
  CalendarCheck,
  CalendarX,
  Clock,
  CloudSun,
  Loader,
  Moon,
  Stethoscope,
  Sun,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { APP_ROUTES } from "@/appRoutes";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import useErrorHandler from "@/hooks/useError";
import { createAppointment, getDoctorSlots } from "@/https/patients-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";
import Ailment from "./shared/Ailment";
import UploadReport from "./shared/UploadReport";
import { getWeekdayId } from "./utils";

const patientSchema = z.object({
  patientName: z.string().min(5, "Name is required"),
  patientMobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  ailmentId: z.string().min(1, "Ailment is required"),
  remarks: z.string().optional(),
});

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

const AppointmentConfirmationPage = () => {
  const location = useLocation();

  if (!location.state) {
    return <Navigate to={APP_ROUTES.APPOINTMENT} />;
  }

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    location?.state?.date
  );
  const [selectedSlot, setSelectedSlot] = useState<ISlot>(
    location?.state?.slot
  );
  const [timeSlots, setTimeSlots] = useState<ITimeSlot>({
    isSlotAvailable: false,
    slots: {},
  });
  const [fetchingTimeSlots, setFetchingTimeSlots] = useState(false);
  const [showChangeTimeDialog, setShowChangeTimeDialog] = useState(false);
  const [submitting, setSubmitting] = useState<boolean | string>(false);

  const user = useSelector((state: { user: UserState }) => state.user.user);
  const weekdays = useSelector(
    (state: { appointment: IAppointmentState }) => state.appointment.weekdays
  );
  const [medicalReports, setMedicalReports] = useState<
    Record<string, string>[]
  >([]);
  const [loadingReport, setLoadingReport] = useState<boolean>(true);

  const handleError = useErrorHandler();

  const navigate = useNavigate();
  const defaultValues = {
    patientName: user?.name,
    patientMobile: `${user?.phoneNumber}`,
    ailmentId: "",
    remarks: "",
  };

  const form = useForm<IAppointmentForm>({
    resolver: zodResolver(patientSchema),
    defaultValues,
  });

  const handleConfirmAppointment: SubmitHandler<IAppointmentForm> = async (
    data: IAppointmentForm
  ) => {
    try {
      const { remarks, ailmentId } = data;

      const payload: IAppointmentForm = {
        doctorId: location.state?.doctor?.id,
        doctorSlotId: location.state?.slot?.id,
        hospitalId: location.state?.slot?.hospitalId,
        remarks,
        ailmentId,
        appointmentDate: selectedDate!.toISOString(),
        documents: medicalReports,
      };
      setSubmitting("form");
      const res = await createAppointment(payload);
      if (res.status === 200) {
        toast.success("Booked Successfully", {
          description: "Your Appointment has been booked successfully!",
        });
        navigate(APP_ROUTES.DASHBOARD);
      }
    } catch (error) {
      handleError(error, "Failed to book appointment");
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
      handleError(error, "Failed to fetch time slots");
    } finally {
      setFetchingTimeSlots(false);
    }
  };

  useEffect(() => {
    if (showChangeTimeDialog) fetchTimeSlots();
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
                        selectedDate ? new Date(selectedDate) : new Date(),
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
                    !timeSlots.isSlotAvailable &&
                      setSelectedDate(location?.state?.date);
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
                          disabled={{ before: new Date() }}
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
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleConfirmAppointment)}
                    className="space-y-4"
                  >
                    <Label>Patient Name</Label>
                    <Input
                      className="!mt-2 capitalize"
                      value={user?.name}
                      disabled
                    />
                    <Label>Mobile Number</Label>
                    <Input
                      className="!mt-2"
                      value={user?.phoneNumber}
                      disabled
                    />

                    <FormField
                      control={form.control}
                      name="ailmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ailment</FormLabel>
                          <FormControl>
                            <Ailment
                              hospitalId={location.state?.slot?.hospitalId}
                              onChange={field.onChange}
                              selectedValue={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="remarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remarks (optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="documents"
                      render={() => (
                        <FormItem>
                          <FormLabel>Medical Reports (optional)</FormLabel>
                          <FormControl>
                            <div className="flex flex-col flex-wrap gap-1">
                              <div className="flex gap-1 items-center flex-wrap">
                                {medicalReports.map((file, index) => {
                                  if (!file) return null;
                                  const fileName = file?.fileName;
                                  return (
                                    <Dialog key={index}>
                                      <DialogTrigger>
                                        <Badge
                                          variant={"secondary"}
                                          className="cursor-pointer"
                                        >
                                          <div className="flex w-full gap-2 items-center capitalize">
                                            <p>{`Report - ${index + 1}.${
                                              file.fileExtension
                                            }`}</p>
                                            <X
                                              className="w-3 h-3 hover:scale-110"
                                              onClick={(e) => {
                                                setMedicalReports((prev) =>
                                                  prev.filter(
                                                    (_, i) => i !== index
                                                  )
                                                );
                                                e.stopPropagation();
                                              }}
                                            />
                                          </div>
                                        </Badge>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-[900px] max-h-[600px] min-h-[40vh] rounded-lg shadow-lg flex flex-col overflow-auto">
                                        <DialogTitle>
                                          <DialogHeader>
                                            {fileName}
                                          </DialogHeader>
                                        </DialogTitle>
                                        {fileName.split(".").pop() === "pdf" ? (
                                          <div className="flex justify-center items-center w-full h-90">
                                            <div className="flex justify-center items-center w-full  flex-col gap-2 h-90">
                                              {loadingReport && (
                                                <div className="flex gap-2">
                                                  <Loader className="animate-spin" />
                                                  <p className="text-md font-medium text-gray-500">
                                                    Loading Document...
                                                  </p>
                                                </div>
                                              )}
                                              <object
                                                data={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                                                  file.signedUrl
                                                )}`}
                                                className="w-full h-full border-none"
                                                style={{ minHeight: "600px" }}
                                                onLoad={() =>
                                                  setLoadingReport(false)
                                                }
                                              />
                                            </div>
                                          </div>
                                        ) : (
                                          <img
                                            src={file.signedUrl}
                                            alt="record"
                                            width={"100%"}
                                            className="max-h-[500px] object-contain"
                                          />
                                        )}
                                      </DialogContent>
                                    </Dialog>
                                  );
                                })}
                              </div>
                              <UploadReport
                                hospitalId={location.state?.slot?.hospitalId}
                                setMedicalReports={setMedicalReports}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full mt-4"
                      disabled={submitting !== false}
                    >
                      {submitting ? (
                        <>
                          <Spinner type="light" />
                          {submitting === "form"
                            ? "Confirming..."
                            : "Uploading documents..."}
                        </>
                      ) : (
                        "Confirm Appointment"
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmationPage;
