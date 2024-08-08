import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IAppointmentResponse, IPrescription } from "@/types";

const Prescription = ({
  appointmentDetails,
}: {
  appointmentDetails: IAppointmentResponse | null | undefined;
}) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Prescription</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex gap-2 flex-wrap">
          {appointmentDetails?.patientPrescription.map(
            (prescription: IPrescription) => (
              <div
                key={prescription.id}
                className={`p-4 rounded-lg border shadow-sm flex justify-between  items-start `}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">
                    {prescription.medicationStock.medicationName}
                  </p>
                  <p className="text-xs text-muted-foreground ">
                    Dosage: {prescription.medicationStock.medicationDosage}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {prescription.foodRelation === "BEFORE_MEAL"
                      ? "Take before food"
                      : "Take after food"}
                  </p>
                  <p className="text-xs text-muted-foreground ">
                    Duration: {prescription.durationInDays} days
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Prescription;
