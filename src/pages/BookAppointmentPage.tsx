import { APP_ROUTES } from "@/appRoutes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useErrorHandler from "@/hooks/useError";
import {
  getDoctorsList,
  getDoctorSlots,
  getWeekdayList,
} from "@/https/patients-service";
import { setWeekdays } from "@/state/appointementReducer";
import { Doctor, IAppointmentState, ISlot, ITimeSlot } from "@/types";
import { Stethoscope, UserRoundX } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AvailableSlots,
  FetchingTimeSlots,
  NoTimeSlots,
  TimeSlotDatePicker,
} from "./shared/TimeSlots";
import { getWeekdayId } from "./utils";

const DoctorSkeleton = () => {
  return Array(4)
    .fill(0)
    .map((_, index) => (
      <React.Fragment key={index}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="doctor-profile-pic flex items-center gap-4">
            <Skeleton className="w-24 h-24 md:w-36 md:h-36 rounded-full" />
            <div>
              <Skeleton className="h-6 w-36 mb-2" />
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-4 w-auto" />
            </div>
          </div>
          <Skeleton className="h-10 w-auto self-stretch md:self-end" />
        </div>
        {index < 3 && <hr className="border-t border-gray-200 my-2" />}
      </React.Fragment>
    ));
};

const BookAppointmentPage = () => {
  const [showSlots, setShowSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedSlot, setSelectedSlot] = useState<ISlot>({
    id: "",
    startTime: "",
    hospitalId: "",
  });
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeSlots, setTimeSlots] = useState<ITimeSlot>({
    isSlotAvailable: false,
    slots: {},
  });
  const [fetchingTimeSlots, setFetchingTimeSlots] = useState(false);
  const slotsRef = useRef<HTMLDivElement>(null);
  const weekdays = useSelector(
    (state: { appointment: IAppointmentState }) => state.appointment.weekdays
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleError = useErrorHandler();

  const fetchDoctorsList = async () => {
    try {
      setLoading(true);
      const [doctorsRes, weekdayRes] = await Promise.all([
        getDoctorsList(),
        getWeekdayList(),
      ]);
      setDoctorsList(doctorsRes.data.data.doctorList);
      dispatch(setWeekdays(weekdayRes.data.data));
    } catch (error) {
      handleError(error, "Failed to fetch doctors list");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointmentClick = async (doctor: Doctor, date: Date) => {
    try {
      setFetchingTimeSlots(true);
      const weekdayId = getWeekdayId(weekdays!, date);
      if (weekdayId) {
        const res = await getDoctorSlots(doctor.id, weekdayId);
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
        setSelectedDoctor(doctor);
        setShowSlots(true);
        setSelectedDate(date);
        slotsRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      handleError(error, "Something went wrong");
    } finally {
      setFetchingTimeSlots(false);
    }
  };

  const handleSlotClick = (slot: ISlot) => {
    setSelectedSlot(slot);
    navigate(APP_ROUTES.APPOINTMENT_CONFIRM, {
      state: { slot, date: selectedDate, doctor: selectedDoctor },
    });
  };

  useEffect(() => {
    fetchDoctorsList();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedDoctor)
      handleBookAppointmentClick(selectedDoctor, selectedDate);
  }, [selectedDate]);

  return (
    <div className="p-6 rounded-xl border bg-card text-card-foreground w-full mx-auto">
      <h3 className="text-xl font-semibold mb-4">Book Appointment</h3>
      <div className="flex flex-col gap-4">
        {loading ? (
          <DoctorSkeleton />
        ) : doctorsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8  ">
            <div className="text-4xl text-muted-foreground mb-4">
              <UserRoundX className="h-8 w-8" />
            </div>
            <p className="text-lg font-medium text-muted-foreground mb-4">
              No Doctors Available for the moment, please try later
            </p>
          </div>
        ) : (
          doctorsList.map((doctor, index) => (
            <React.Fragment key={doctor.id}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="doctor-profile-pic flex items-center gap-4">
                    <Avatar className="w-24 h-24 md:w-36 md:h-36">
                      <AvatarImage
                        src={doctor.profilePictureUrl}
                        alt={doctor.name}
                      />
                      <AvatarFallback>
                        <Stethoscope className="w-6 h-6 md:w-10 md:h-10" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg md:text-xl font-medium">
                        {doctor.name}, {doctor.qualification}
                      </p>
                      <p className="text-gray-600">{doctor.speciality}</p>
                      <p className="text-gray-600">
                        Mobile: {doctor.isd_code} {doctor.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="self-stretch md:self-end"
                    onClick={() =>
                      handleBookAppointmentClick(doctor, new Date())
                    }
                  >
                    Book Appointment
                  </Button>
                </div>
                {showSlots && selectedDoctor?.id === doctor.id && (
                  <Card className="mt-4" ref={slotsRef}>
                    <CardHeader>
                      <CardDescription>Select Date</CardDescription>
                      <div className="w-fit">
                        <TimeSlotDatePicker
                          selectedDate={selectedDate}
                          setSelectedDate={setSelectedDate}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {fetchingTimeSlots ? (
                        <FetchingTimeSlots />
                      ) : (
                        selectedDate &&
                        (timeSlots.isSlotAvailable ? (
                          <AvailableSlots
                            timeSlots={timeSlots}
                            selectedSlot={selectedSlot}
                            handleSlotClick={handleSlotClick}
                          />
                        ) : (
                          <NoTimeSlots />
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
              {index < doctorsList.length - 1 && (
                <hr className="border-t border-gray-200 my-2" />
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default BookAppointmentPage;
