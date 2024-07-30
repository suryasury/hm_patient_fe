import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarCheck, CloudSun, Moon, Stethoscope, Sun } from "lucide-react";

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
import { IAppointmentForm, UserState } from "@/types";
import { format } from "date-fns";
import { ArrowLeftCircle, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";

const patientSchema = z.object({
  patientName: z.string().min(5, "Name is required"),
  patientMobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  decease: z.string().min(4, "Ailment is required"),
  remarks: z.string().optional(),
});

const AppointmentConfirmationPage = () => {
  const location = useLocation();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    location?.state?.date
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    location?.state?.slot
  );
  const user = useSelector((state: UserState) => state.user);
  const navigate = useNavigate();
  const defaultValues = {
    patientName: user?.name,
    patientMobile: `${user?.phoneNumber}`,
    decease: "",
    remarks: "",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IAppointmentForm>({
    resolver: zodResolver(patientSchema),
    defaultValues,
  });

  const timeSlots = {
    Morning: ["7:00 AM", "8:00 AM", "11:00 AM"],
    Afternoon: ["12:00 PM", "1:30 PM", "2:30 PM"],
    Night: ["7:00 PM", "8:00 PM", "9:00 PM"],
  };
  const getIconForPeriod = (period: string) => {
    switch (period) {
      case "Morning":
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case "Afternoon":
        return <CloudSun className="w-5 h-5 text-orange-500" />;
      case "Night":
        return <Moon className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };
  const handleConfirmAppointment: SubmitHandler<IAppointmentForm> = (
    data: IAppointmentForm
  ) => {
    // Handle appointment confirmation logic here
    console.log("Appointment confirmed", data);
  };

  useEffect(() => {
    if (!location.state) {
      navigate("/appointment");
    }
  }, [location]);

  return (
    <div className="p-6 flex gap-4 w-[1128px]">
      <div className="w-[50%] h-fit">
        <Card>
          <CardHeader>
            <CardTitle>In-Clinic Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <hr className="border-t border-gray-200 " />
            <div className="flex justify-between items-center mt-4">
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
                    {selectedSlot}
                  </span>
                </p>
              </div>
            </div>
            <div className="ml-[-14px]">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-[#199fd9]">
                    Change Date and time slot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Date and Time Slot</DialogTitle>
                  </DialogHeader>
                  <div>
                    <DatePicker
                      date={selectedDate}
                      setDate={(date) => setSelectedDate(date)}
                      placeholder="Select a date"
                    />
                    <div className="mt-4">
                      <p className="text-md font-medium mb-2">
                        Available Slots
                      </p>
                      <div className="flex flex-col gap-2">
                        {Object.entries(timeSlots).map(([period, slots]) => (
                          <React.Fragment key={period}>
                            <div className="flex gap-4 items-center">
                              {getIconForPeriod(period)}

                              <h5 className="text-md font-semibold w-[100px]">
                                {period}
                              </h5>
                              <div className="flex gap-2 flex-wrap">
                                {slots.map((slot) => (
                                  <div
                                    key={slot}
                                    className={`p-2 rounded cursor-pointer border ${
                                      selectedSlot === slot
                                        ? "bg-gray-200"
                                        : "hover:bg-gray-200"
                                    }`}
                                    onClick={() => setSelectedSlot(slot)}
                                  >
                                    {slot}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <hr className="border-t border-gray-200 my-2" />
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
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
        <Button
          className="mt-4"
          variant="link"
          onClick={() => navigate("/appointment")}
        >
          <div className="flex gap-2 items-center">
            <ArrowLeftCircle />
            <span>Go Back</span>
          </div>
        </Button>
      </div>
      <Card className="w-[50%]">
        <CardHeader>
          <CardTitle>Patient Details</CardTitle>
          <CardDescription>This in-clinic appointment is for:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col ">
            {/* <div className="border-2 rounded-sm p-2">
              <RadioGroup
                onValueChange={(option) => setAppointmentFor(option)}
                defaultValue={appointmentFor}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self" id="self" />
                  <Label htmlFor="self">Mr.Vijaysai</Label>
                </div>
                <hr className="border-t border-gray-300 " />

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="others" id="others" />
                  <Label htmlFor="others">Someone else</Label>
                </div>
              </RadioGroup>
            </div> */}
            <form
              onSubmit={handleSubmit(handleConfirmAppointment)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="patient-name">Name</Label>
                <Input
                  id="patient-name"
                  type="text"
                  {...register("patientName")}
                  className="border-2 rounded-sm p-2"
                />
                {errors.patientName && (
                  <span className="text-red-500">
                    {errors.patientName.message as string}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="patient-mobile">Mobile Number</Label>
                <Input
                  id="patient-mobile"
                  type="text"
                  {...register("patientMobile")}
                  className="border-2 rounded-sm p-2"
                  
                />
               
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="ailment">Ailment</Label>
                <Input
                  id="ailment"
                  type="text"
                  {...register("decease")}
                  className="border-2 rounded-sm p-2"
                />
                {errors.decease && (
                  <span className="text-red-500">
                    {errors.decease.message as string}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  {...register("remarks")}
                  className="border-2 rounded-sm p-2"
                />
              </div>

              <Button type="submit" className="mt-4">
                Confirm Appointment
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentConfirmationPage;
