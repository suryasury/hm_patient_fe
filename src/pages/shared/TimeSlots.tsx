// Common components
import DatePicker from "@/components/ui/date-picker";
import Spinner from "@/components/ui/spinner";
import { ISlot, ITimeSlot } from "@/types";
import { CalendarX, CloudSun, Moon, Sun } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";

interface DatePickerComponentProps {
  selectedDate: Date | undefined;
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>;
}

export const TimeSlotDatePicker: React.FC<DatePickerComponentProps> = ({
  selectedDate,
  setSelectedDate,
}) => (
  <DatePicker
    date={selectedDate}
    setDate={(date) => setSelectedDate(date)}
    placeholder="Select a date"
    disabled={{ before: new Date() }}
  />
);

interface AvailableSlotsProps {
  timeSlots: ITimeSlot;
  selectedSlot: ISlot | undefined;
  handleSlotClick: (slot: ISlot) => void;
  short?: boolean;
}

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

export const AvailableSlots: React.FC<AvailableSlotsProps> = ({
  timeSlots,
  selectedSlot,
  handleSlotClick,
  short = false,
}) => (
  <div className="mt-4">
    <p className="text-md font-medium mb-2">Available Slots</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {Object.entries(timeSlots.slots).map(([period, slots]) =>
        slots.length > 0 ? (
          <React.Fragment key={period}>
            <div className="col-span-full flex items-center gap-4">
              {getIconForPeriod(period)}
              <h5 className="text-md font-semibold">{period}</h5>
            </div>
            <div
              className={`col-span-full grid  ${
                short ? "grid-cols-2" : "md:grid-cols-6"
              } gap-2`}
            >
              {slots.map((slot: ISlot) => (
                <div
                  key={slot.id}
                  className={`p-1.5  text-sm  rounded cursor-pointer border w-auto text-center ${
                    selectedSlot?.id === slot.id ? "bg-muted" : "hover:bg-muted"
                  }`}
                  onClick={() => handleSlotClick(slot)}
                >
                  {`${slot.startTime} - ${slot.endTime}`}
                </div>
              ))}
            </div>
            <div className="col-span-full">
              <hr className="border-t border-gray-200 my-2" />
            </div>
          </React.Fragment>
        ) : null
      )}
    </div>
  </div>
);

export const FetchingTimeSlots = () => (
  <div className="flex items-center justify-center p-4 bg-gray-100 rounded-md">
    <Spinner />
    <span className="text-md font-medium text-gray-500">
      Looking for slots...
    </span>
  </div>
);

export const NoTimeSlots = () => (
  <p className="flex items-center justify-center text-red-500 p-4 bg-red-100 rounded-md">
    <CalendarX className="w-6 h-6 mr-2" />
    <span className="text-md font-medium">No slots available</span>
  </p>
);
