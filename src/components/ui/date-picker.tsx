import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Dispatch, SetStateAction, SyntheticEvent } from "react";

const DatePicker = ({
  date,
  setDate,
  placeholder = "Pick a date",
  disabled,
}: {
  date: Date | undefined;
  placeholder?: string | null | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  disabled?: boolean | Date;
}) => {
  const handleReset = (e: SyntheticEvent) => {
    e.stopPropagation();
    setDate(undefined);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-between text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>{placeholder}</span>}
            </div>
            {date ? (
              <X onClick={handleReset} className="h-4 w-4 hover:scale-125" />
            ) : null}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
