import { APP_ROUTES } from "@/appRoutes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import DatePicker from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "@/components/ui/spinner";
import {
  getDoctorsList,
  getDoctorSlots,
  getWeekdayList,
} from "@/https/patients-service";
import { setWeekdays } from "@/state/appointementReducer";
import { Doctor, IAppointmentState, ISlot, ITimeSlot } from "@/types";
import { CalendarX, CloudSun, Moon, Stethoscope, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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

  const weekdays = useSelector(
    (state: { appointment: IAppointmentState }) => state.appointment.weekdays
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      console.log(error);
      toast.error("Failed to fetch doctors list", {
        description:
          "Our servers are facing technical issues. Please try again later.",
      });
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
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
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
      <h3 className="text-2xl font-semibold mb-4">Book Appointment</h3>
      <div className="flex flex-col gap-4">
        {loading ? (
          <DoctorSkeleton />
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
                        {doctor.name}
                      </p>
                      <p className="text-gray-600">{doctor.speciality}</p>
                      <p className="text-gray-600">
                        Mobile: {doctor.isd_code} {doctor.phoneNumber}
                      </p>
                      <p className="text-gray-600">Address: {doctor.address}</p>
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
                  <Card className="mt-4">
                    <CardHeader>
                      <CardDescription>Select Date</CardDescription>
                      <div className="w-fit">
                        <DatePicker
                          date={selectedDate}
                          setDate={(date) => setSelectedDate(date)}
                          placeholder="Select a date"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {fetchingTimeSlots ? (
                        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-md">
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
                                      <div className="col-span-full grid grid-cols-3 md:grid-cols-7 gap-2">
                                        {slots.map((slot: ISlot) => (
                                          <div
                                            key={slot.id}
                                            className={`p-1 md:p-2 text-sm md:text-base rounded cursor-pointer border w-auto text-center ${
                                              selectedSlot.id === slot.id
                                                ? "bg-muted"
                                                : "hover:bg-muted"
                                            }`}
                                            onClick={() =>
                                              handleSlotClick(slot)
                                            }
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
                          <p className="flex items-center justify-center text-red-500 p-4 bg-red-100 rounded-md">
                            <CalendarX className="w-6 h-6 mr-2" />
                            <span className="text-md font-medium">
                              No slots available
                            </span>
                          </p>
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
