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
import { CalendarCheck, Clock, Loader, Stethoscope } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useErrorHandler from "@/hooks/useError";
import {
  getAppointmentDetails,
  getDoctorSlots,
  updateAppointment,
} from "@/https/patients-service";

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
      remarks: z.string().min(1, "Ailment is required"),
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

  const handleError = useErrorHandler();

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
    if (!isEdit) {
      e.preventDefault();
    }
    setIsEdit((prev) => !prev);
  };

  useEffect(() => {
    if (appointmentDetails) fetchTimeSlots();
  }, [selectedDate, showChangeTimeDialog, appointmentDetails]);

  useEffect(() => {
    fetchAppointmentDetails();
  }, []);
  console.log(form.getValues(), form.formState.dirtyFields);

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      {loading ? (
        <div className="flex  overflow-hidden items-center mt-6 justify-center">
          <Loader className="animate-spin" />
          <p className="text-md font-medium text-gray-500 ml-4">
            Fetching appointment details...
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="w-full sm:w-[50%] h-fit">
            <Card>
              <CardHeader className="relative">
                <CardTitle>In-Clinic Appointment</CardTitle>
                {appointmentDetails?.appointmentStatus && (
                  <div
                    className={`badge ${
                      statusClasses[appointmentDetails.appointmentStatus]
                    } px-2 py-1 rounded-lg text-xs w-[90px] text-center capitalize absolute right-5 top-4`}
                  >
                    {appointmentDetails?.appointmentStatus.toLowerCase()}
                  </div>
                )}
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
                          appointmentDetails?.appointmentDate
                            ? new Date(appointmentDetails?.appointmentDate)
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
                        {selectedSlot?.startTime}
                      </span>
                    </p>
                  </div>
                </div>

                {isEdit && (
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
                            <TimeSlotDatePicker
                              selectedDate={selectedDate}
                              setSelectedDate={(date) => {
                                setSelectedDate(date);
                                form.setValue(
                                  "appointmentDetails.appointmentDate",
                                  date?.toString()
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
                )}

                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="doctor-profile-pic flex items-center gap-4">
                      <Avatar className="w-[100px] h-[100px]">
                        <AvatarImage
                          src={appointmentDetails?.doctor?.profilePictureUrl}
                          alt={appointmentDetails?.doctor?.name}
                        />
                        <AvatarFallback>
                          <Stethoscope className="w-10 h-10" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xl font-medium">
                          {appointmentDetails?.doctor?.name}
                        </p>
                        <p className="text-gray-600">
                          {appointmentDetails?.doctor?.speciality}
                        </p>
                        <p className="text-gray-600">
                          Mobile: {appointmentDetails?.doctor?.isd_code}{" "}
                          {appointmentDetails?.doctor?.phoneNumber}
                        </p>
                      </div>
                    </div>
                  </div>
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
            />
          )}
          {appointmentDetails?.appointmentStatus === "COMPLETED" && (
            <Feedback appointmentDetails={appointmentDetails} />
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;
