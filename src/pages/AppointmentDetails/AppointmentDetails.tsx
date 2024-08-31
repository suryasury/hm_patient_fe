import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IAppointmentResponse,
  IAppointmentState,
  ISlot,
  ITimeSlot,
  IUpdateAppointmentDetails,
} from "@/types";
import { format } from "date-fns";
import {
  CalendarCheck,
  CalendarOff,
  Clock,
  Home,
  Loader,
  SquarePen,
  Stethoscope,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useErrorHandler from "@/hooks/useError";
import {
  getAppointmentDetails,
  getDoctorSlots,
  updateAppointment,
} from "@/https/patients-service";

import { APP_ROUTES } from "@/appRoutes";
import Spinner from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";
import {
  AvailableSlots,
  FetchingTimeSlots,
  NoTimeSlots,
  TimeSlotDatePicker,
} from "../shared/TimeSlots";
import { dirtyValues, getWeekdayId, statusClasses } from "../utils";
import Feedback from "./Feedback";
import PatientDetails from "./PatientDetails";
import Prescription from "./Prescription";

const updateAppoitmentSchema = z.object({
  appointmentDetails: z
    .object({
      remarks: z.string().optional(),
      ailmentId: z.string().min(1, "Ailment is required"),
      appointmentDate: z.string().min(1, "Appointment Date is required"),
      doctorSlotId: z.string().min(1, "Please select slot"),
    })
    .optional(),
  removedDocuments: z
    .array(
      z.object({
        id: z.string().min(1),
        bucketPath: z.string().min(1),
      })
    )
    .optional(),
  documents: z
    .array(
      z.object({
        signedUrl: z.string(),
        bucketPath: z.string(),
        fileName: z.string(),
        contentType: z.string(),
        fileExtension: z.string(),
        documentTypeId: z.string(),
      })
    )
    .optional(),
});

const AppointmentDetails = () => {
  const { id } = useParams();
  const [appointmentDetails, setAppointmentDetails] =
    useState<IAppointmentResponse | null>();
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedSlot, setSelectedSlot] = useState<ISlot>();
  const [timeSlots, setTimeSlots] = useState<ITimeSlot>({
    isSlotAvailable: false,
    slots: {},
  });
  const [fetchingTimeSlots, setFetchingTimeSlots] = useState(false);
  const [showChangeTimeDialog, setShowChangeTimeDialog] = useState(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const weekdays = useSelector(
    (state: { appointment: IAppointmentState }) => state.appointment.weekdays
  );

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const [cancelSubmitting, setCancelSubmitting] = useState<boolean>(false);
  const [isReset, setIsReset] = useState<boolean>(false);

  const handleError = useErrorHandler();
  const navigate = useNavigate();

  const form = useForm<IUpdateAppointmentDetails>({
    resolver: zodResolver(updateAppoitmentSchema),
    defaultValues: {
      appointmentDetails: {
        ailmentId: appointmentDetails?.ailmentId,
        remarks: appointmentDetails?.remarks,
        appointmentDate: appointmentDetails?.appointmentDate,
        doctorSlotId: appointmentDetails?.doctorSlotId,
      },
      documents: appointmentDetails?.patientAppointmentDocs,
      removedDocuments: [],
    },
  });

  const handleUpdateAppointement: SubmitHandler<
    IUpdateAppointmentDetails
  > = async () => {
    try {
      setSubmitting(true);
      const payload: IUpdateAppointmentDetails = dirtyValues(
        form.formState.dirtyFields,
        form.getValues()
      );
      console.log(payload, "payload");
      const res = await updateAppointment(payload, appointmentDetails!.id);
      if (res.status === 200) {
        toast.success("Appointment updated successfully");
        setIsEdit(false);
        await fetchAppointmentDetails();
      }
    } catch (error) {
      handleError(error, "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async () => {
    try {
      setCancelSubmitting(true);
      const payload: IUpdateAppointmentDetails = {
        appointmentDetails: {
          appointmentStatus: "CANCELLED",
        },
      };

      const res = await updateAppointment(payload, appointmentDetails!.id);
      if (res.status === 200) {
        toast.success("Appointment cancelled successfully");
        setIsEdit(false);
        navigate(APP_ROUTES.DASHBOARD);
      }
    } catch (error) {
      handleError(error, "Failed to cancel appointment");
    } finally {
      setCancelSubmitting(false);
    }
  };

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const res = await getAppointmentDetails(id!);
      const data: IAppointmentResponse = res.data.data;
      form.reset({
        appointmentDetails: {
          ailmentId: data?.ailmentId || "",
          remarks: data?.remarks || "",
          doctorSlotId: data?.doctorSlotId || "",
          appointmentDate: data?.appointmentDate || "",
        },
        documents: [],
        removedDocuments: [],
      });

      setAppointmentDetails(data);
      setSelectedSlot({
        id: data.doctorSlotId,
        startTime: data.doctorSlots.slot.startTime,
        endTime: data.doctorSlots.slot.endTime,
        hospitalId: data.doctorSlots.slot.hospitalId,
      });
      setSelectedDate(new Date(data.appointmentDate));
    } catch (error) {
      handleError(error, "Failed to fetch appointment details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      setFetchingTimeSlots(true);
      const weekdayId = getWeekdayId(weekdays!, selectedDate);
      if (weekdayId) {
        const res = await getDoctorSlots(
          appointmentDetails!.doctor?.id,
          weekdayId
        );
        const formattedData = (slot: { id: string; slot: ISlot }) => ({
          id: slot.id,
          startTime: slot.slot.startTime,
          endTime: slot.slot.endTime,
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

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isEdit) {
      setIsReset(true);
      setSelectedDate(new Date(appointmentDetails!.appointmentDate));
      setSelectedSlot({
        id: appointmentDetails!.doctorSlotId,
        startTime: appointmentDetails!.doctorSlots.slot.startTime,
        hospitalId: appointmentDetails!.doctorSlots.slot.hospitalId,
      });
      form.reset();
    }
    setIsEdit((prev) => !prev);
    setTimeout(() => setIsReset(false), 0);
  };

  const showEditBtn = () => {
    const prohibitedStatus = ["COMPLETED", "CANCELLED"];
    if (!appointmentDetails) return false;
    if (prohibitedStatus.includes(appointmentDetails.appointmentStatus))
      return false;

    return true;
  };

  useEffect(() => {
    if (appointmentDetails) fetchTimeSlots();
  }, [selectedDate, showChangeTimeDialog, appointmentDetails]);

  useEffect(() => {
    fetchAppointmentDetails();
  }, []);

  if (!loading && !appointmentDetails)
    return (
      <div className="flex flex-col items-center justify-center text-center py-8  ">
        <div className="text-4xl text-muted-foreground mb-4">
          <CalendarOff className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium text-muted-foreground mb-4">
          Appointment details not found
        </p>
        <Button onClick={() => navigate(APP_ROUTES.APPOINTMENT)}>
          <Home className="h-4 w-4 mr-2" />
          Go Home
        </Button>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 w-full mx-auto relative">
      {loading ? (
        <div className="flex  overflow-hidden items-center mt-6 justify-center">
          <Loader className="animate-spin" />
          <p className="text-md font-medium text-gray-500 ml-4">
            Fetching appointment details...
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mt-2">
            <p className="font-semibold w-full self-end">
              Token No : {appointmentDetails?.tokenNumber || "NA"}
            </p>
            {showEditBtn() &&
              (!isEdit ? (
                <Button className="w-fit self-end gap-1" onClick={handleEdit}>
                  <SquarePen className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="w-fit self-end"
                  onClick={handleEdit}
                >
                  Cancel
                </Button>
              ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="w-full sm:w-[50%] h-fit">
              <Card>
                <CardHeader className="relative">
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      In-Clinic Appointment
                    </div>
                  </CardTitle>
                  {appointmentDetails?.appointmentStatus && (
                    <div
                      className={`badge ${
                        statusClasses[appointmentDetails.appointmentStatus]
                      } px-2 py-1 rounded-lg text-xs font-medium w-[90px] text-center capitalize absolute right-5 top-4`}
                    >
                      {appointmentDetails?.appointmentStatus.toLowerCase()}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <hr className="border-t border-gray-200" />
                  <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center mt-4 gap-4 sm:gap-0">
                    <div className="flex gap-2 items-center">
                      <CalendarCheck className="text-[#414146] w-5 h-5 text-sm" />
                      <p>
                        On
                        <span className="ml-2  font-medium">
                          {format(
                            selectedDate ? new Date(selectedDate) : new Date(),
                            "dd/MM/yyyy"
                          )}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2  items-center">
                      <Clock className="text-[#414146] w-5 h-5 text-sm" />
                      <p>
                        At
                        <span className="ml-2 text-md font-medium">
                          {selectedSlot?.startTime} - {selectedSlot?.endTime}
                        </span>
                      </p>
                    </div>
                  </div>

                  {isEdit && (
                    <div className="flex justify-between items-center w-full flex-wrap">
                      <div className="ml-[-14px]">
                        <Dialog
                          open={showChangeTimeDialog}
                          onOpenChange={(isOpen) => {
                            setShowChangeTimeDialog(isOpen);
                            !timeSlots.isSlotAvailable &&
                              setSelectedDate(
                                new Date(appointmentDetails!.appointmentDate)
                              );

                            form.setValue(
                              "appointmentDetails.appointmentDate",
                              appointmentDetails!.appointmentDate,
                              { shouldDirty: true }
                            );
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="link" className="text-primary">
                              Change Date and time slot
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95%] max-h-[90vh] min-h-[40vh] rounded-lg shadow-lg flex flex-col overflow-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Change Date and Time Slot
                              </DialogTitle>
                            </DialogHeader>

                            <div className="flex flex-col gap-2">
                              <CardDescription>Select Date</CardDescription>
                              <div className="w-fit flex justify-between items-center gap-1">
                                <TimeSlotDatePicker
                                  selectedDate={selectedDate}
                                  setSelectedDate={(date) => {
                                    setSelectedDate(date);
                                    form.setValue(
                                      "appointmentDetails.appointmentDate",
                                      format(date as Date, "yyyy-MM-dd"),
                                      { shouldDirty: true }
                                    );
                                  }}
                                />
                              </div>
                              {fetchingTimeSlots ? (
                                <FetchingTimeSlots />
                              ) : (
                                selectedDate &&
                                (timeSlots.isSlotAvailable ? (
                                  <AvailableSlots
                                    timeSlots={timeSlots}
                                    selectedSlot={selectedSlot}
                                    handleSlotClick={(slot) => {
                                      setSelectedSlot(slot);
                                      setShowChangeTimeDialog(false);
                                      form.setValue(
                                        "appointmentDetails.doctorSlotId",
                                        slot.id,
                                        { shouldDirty: true }
                                      );
                                    }}
                                    short={true}
                                  />
                                ) : (
                                  <NoTimeSlots />
                                ))
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 mt-4">
                    <div className="flex justify-between items-center">
                      <div className="doctor-profile-pic flex items-center gap-4">
                        <Avatar className="w-[80px] h-[80px]">
                          <AvatarImage
                            src={appointmentDetails?.doctor?.profilePictureUrl}
                            alt={appointmentDetails?.doctor?.name}
                          />
                          <AvatarFallback>
                            <Stethoscope className="w-10 h-10" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className=" font-medium">
                            {appointmentDetails?.doctor?.name}{" "}
                            <span className="text-[12px] text-muted-foreground">
                              {appointmentDetails?.doctor.qualification}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            {appointmentDetails?.doctor?.speciality}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isEdit && (
                      <AlertDialog
                        open={showCancelDialog}
                        onOpenChange={setShowCancelDialog}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant={"link"}
                            className=" m-0 p-0 text-red-600"
                          >
                            {cancelSubmitting ? (
                              <>
                                <Spinner />
                                <span>Cancelling...</span>
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                <span>Cancel Appointment</span>
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[360px] md:max-w-fit rounded-lg">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently cancel your appointment.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelAppointment}
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Prescription Section */}
              {appointmentDetails?.patientPrescription.length !== 0 && (
                <Prescription appointmentDetails={appointmentDetails} />
              )}
            </div>
            {appointmentDetails && (
              <PatientDetails
                appointmentDetails={appointmentDetails}
                isEdit={isEdit}
                handleEdit={handleEdit}
                submitting={submitting}
                onSubmit={handleUpdateAppointement}
                form={form}
                hospitalId={
                  appointmentDetails ? appointmentDetails.hospitalId : ""
                }
                isReset={isReset}
              />
            )}
            {appointmentDetails?.appointmentStatus === "COMPLETED" && (
              <Feedback
                appointmentDetails={appointmentDetails}
                fetchAppointmentDetails={fetchAppointmentDetails}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentDetails;
