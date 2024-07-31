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
import { getDoctorsList } from "@/https/patients-service";
import { Doctor } from "@/types";
import { CloudSun, Moon, Stethoscope, Sun, User2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
        <div className="flex justify-between items-center">
          <div className="doctor-profile-pic flex items-center gap-4">
            <Skeleton className="w-36 h-36 rounded-full" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-4 w-40 mb-1" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="h-10 w-32 self-end" />
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
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const fetchDoctorsList = async () => {
    try {
      setLoading(true);
      const data = await getDoctorsList();
      setDoctorsList(data.data.data.doctorList);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const handleBookAppointmentClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowSlots(true);
  };

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
    navigate(`/appointment/confirm`, {
      state: { slot, date: selectedDate, doctor: selectedDoctor },
    });
  };

  const timeSlots = {
    Morning: ["7:00 AM", "8:00 AM", "11:00 AM","7:00 AM", "8:00 AM", "11:00 AM","7:00 AM", "8:00 AM", "11:00 AM","7:00 AM", "8:00 AM", "11:00 AM"],
    Afternoon: ["12:00 PM", "1:30 PM", "2:30 PM"],
    Evening: ["7:00 PM", "8:00 PM", "9:00 PM"],
  };

  useEffect(() => {
    fetchDoctorsList();
  }, []);

  return (
    <div className="p-6 rounded-xl border bg-card text-card-foreground w-full max-w-[1128px] mx-auto">
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
                    <p className="text-lg md:text-xl font-medium">{doctor.name}</p>
                    <p className="text-gray-600">{doctor.speciality}</p>
                    <p className="text-gray-600">
                      Mobile: {doctor.isd_code} {doctor.phoneNumber}
                    </p>
                    <p className="text-gray-600">Address: {doctor.address}</p>
                  </div>
                </div>
                <Button
                  className="self-stretch md:self-end"
                  onClick={() => handleBookAppointmentClick(doctor)}
                >
                  Book Appointment
                </Button>
              </div>
              {showSlots && selectedDoctor?.id === doctor.id && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardDescription>Select Date</CardDescription>
                    <DatePicker
                      date={selectedDate}
                      setDate={(date) => setSelectedDate(date)}
                      placeholder="Select a date"
                    />
                  </CardHeader>
                  <CardContent>
                    {selectedDate && (
                      <div className="mt-4">
                        <p className="text-md font-medium mb-2">Available Slots</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(timeSlots).map(([period, slots]) => (
                            <React.Fragment key={period}>
                              <div className="col-span-full flex items-center gap-4">
                                {getIconForPeriod(period)}
                                <h5 className="text-md font-semibold">{period}</h5>
                              </div>
                              <div className="col-span-full grid grid-cols-3 md:grid-cols-7 gap-2">
                                {slots.map((slot) => (
                                  <div
                                    key={slot}
                                    className={`p-2 rounded cursor-pointer border w-auto text-center ${
                                      selectedSlot === slot
                                        ? "bg-gray-200"
                                        : "hover:bg-gray-200"
                                    }`}
                                    onClick={() => handleSlotClick(slot)}
                                  >
                                    {slot}
                                  </div>
                                ))}
                              </div>
                              <div className="col-span-full">
                                <hr className="border-t border-gray-200 my-2" />
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
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
