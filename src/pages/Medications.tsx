import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import DatePicker from "@/components/ui/date-picker";
import Spinner from "@/components/ui/spinner";
import useErrorHandler from "@/hooks/useError";
import {
  getMedications,
  updatePrescriptionTaken,
} from "@/https/patients-service";
import { IMedicationResponse } from "@/types";
import { format } from "date-fns";
import {
  Check,
  Cloud,
  CloudSun,
  Loader,
  Moon,
  PillBottle,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface MedicationRes {
  isPrescriptionAvailable: boolean;
  times: { [key: string]: IMedicationResponse[] };
}

const timeOfDayTitles: { [key: string]: { title: string; icon: JSX.Element } } =
  {
    morning: {
      title: "Morning",
      icon: <Sun className="w-4 h-4 text-yellow-500" />,
    },
    afternoon: {
      title: "Afternoon",
      icon: <CloudSun className="w-4 h-4 text-orange-500" />,
    },
    evening: {
      title: "Evening",
      icon: <Cloud className="h-4 w-4 text-gray-600" />,
    },
    night: { title: "Night", icon: <Moon className="w-4 h-4 text-blue-500" /> },
  };

const Medications = () => {
  const [medications, setMedications] = useState<MedicationRes>({
    isPrescriptionAvailable: false,
    times: {},
  });
  const [medicationDate, setMedicationDate] = useState<Date | undefined>(
    new Date()
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean | string>(false);
  const handleError = useErrorHandler();

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const medicationRes = await getMedications(
        format(medicationDate!, "yyyy/MM/dd")
      );
      const transformedMedications: MedicationRes = {
        isPrescriptionAvailable:
          medicationRes.data.data.isPriscriptionAvailableForTheDay,
        times: {
          morning: medicationRes.data.data.morningPrescription,
          afternoon: medicationRes.data.data.afterNoonPrescription,
          evening: medicationRes.data.data.eveningPrescription,
          night: medicationRes.data.data.nightPrescription,
        },
      };
      setMedications(transformedMedications);
    } catch (error) {
      handleError(error, "Failed to fetch medications");
    } finally {
      setLoading(false);
    }
  };

  const updateMedication = async (medication: IMedicationResponse) => {
    try {
      setSubmitting(medication.prescriptionTimeOfDayId);
      const payload = {
        prescriptionDayId: medication.prescriptionDayId,
        prescriptionTimeOfDayId: medication.prescriptionTimeOfDayId,
        isPrescriptionTaken: true,
      };
      const res = await updatePrescriptionTaken(payload);
      if (res.status === 200) {
        toast.success("Medication status updated successfully");
        await fetchMedications();
      }
    } catch (error) {
      handleError(error, "Failed to update medication status");
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    fetchMedications();
  }, [medicationDate]);

  return (
    <div className="p-6 rounded-xl border bg-card text-card-foreground w-full mx-auto">
      <h3 className="text-xl font-semibold mb-4">Medication</h3>
      <div className="flex flex-col gap-2">
        <CardDescription>Select Date</CardDescription>
        <div className="w-fit">
          <DatePicker
            date={medicationDate}
            setDate={(date) => setMedicationDate(date)}
            placeholder="Select a date"
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-4 bg-gray-100 rounded-md mt-4">
            <Spinner />
            <span className="text-md font-medium text-gray-500">
              Looking for medications...
            </span>
          </div>
        ) : medications.isPrescriptionAvailable ? (
          Object.keys(medications.times).map((timeOfDay) => {
            if (medications.times[timeOfDay].length === 0) {
              return null;
            }

            return (
              <div key={timeOfDay}>
                <h3 className="font-semibold capitalize mb-2 flex items-center gap-2">
                  {timeOfDayTitles[timeOfDay].icon}
                  {timeOfDayTitles[timeOfDay].title}
                </h3>
                <div className="flex justify-center md:justify-normal flex-wrap gap-4">
                  {medications.times[timeOfDay].map((medication) => (
                    <div
                      key={medication.prescriptionId}
                      className={`p-4 rounded-lg border shadow-sm flex justify-between w-full max-w-[250px] items-start ${
                        medication.isPrescriptionTaken
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">
                          {medication.medicationName}
                        </p>
                        <p className="text-xs text-muted-foreground ">
                          Dosage: {medication.medicationDosage}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {medication.foodRelation === "BEFORE_MEAL"
                            ? "Take before food"
                            : "Take after food"}
                        </p>
                      </div>
                      {medication.isPrescriptionTaken ? (
                        <div className="text-sm text-green items-center flex gap-2">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Taken</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 ml-4 items-start">
                          <Button
                            className="text-xs p-2 flex items-center gap-1"
                            size={"sm"}
                            onClick={() => updateMedication(medication)}
                            disabled={
                              submitting === medication.prescriptionTimeOfDayId
                            }
                          >
                            {submitting ===
                            medication.prescriptionTimeOfDayId ? (
                              <div className="flex gap-1">
                                <Loader className="w-4 h-4 animate-spin" />
                                <span>Updating...</span>
                              </div>
                            ) : (
                              "Taken"
                            )}
                          </Button>
                          {/* <Button
                          variant="link"
                          className="text-xs text-destructive h-fit p-0 flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Skipped</span>
                        </Button> */}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <p className="flex items-center justify-center text-red-500 p-4 bg-red-100 rounded-md mt-4">
            <PillBottle className="w-6 h-6 mr-2" />
            <span className="text-md font-medium">No Medication available</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Medications;
