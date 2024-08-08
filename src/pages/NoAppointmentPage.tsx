import { APP_ROUTES } from "@/appRoutes";
import { Button } from "@/components/ui/button";
import { CalendarOff, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NoAppointmentPage = ({ message }: { message?: string }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center text-center py-8  ">
      {message ? (
        <p className="text-lg font-medium text-muted-foreground mb-4">
          {" "}
          {message}
        </p>
      ) : (
        <>
          <div className="text-4xl text-muted-foreground mb-4">
            <CalendarOff className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium text-muted-foreground mb-4">
            No appointments
          </p>
          <Button onClick={() => navigate(APP_ROUTES.APPOINTMENT)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </>
      )}
    </div>
  );
};

export default NoAppointmentPage;
