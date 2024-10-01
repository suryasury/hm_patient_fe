import { Badge } from "@/components/ui/badge";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  IAppointmentResponse,
  IMedicalReport,
  IUpdateAppointmentDetails,
  UserState,
} from "@/types";
import { Loader, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { useSelector } from "react-redux";
import Ailment from "../shared/Ailment";
import UploadReport from "../shared/UploadReport";
interface PatientDetailsComponentProps {
  appointmentDetails: IAppointmentResponse | null | undefined;
  isEdit: boolean;
  submitting: boolean;
  handleEdit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSubmit: SubmitHandler<IUpdateAppointmentDetails>;
  form: UseFormReturn<IUpdateAppointmentDetails, any, undefined>;
  hospitalId: string;
  isReset: boolean;
}

const PatientDetails = ({
  appointmentDetails,
  isEdit,
  submitting,
  onSubmit,
  form,
  hospitalId,
  isReset,
}: PatientDetailsComponentProps) => {
  const [medicalReports, setMedicalReports] = useState<IMedicalReport[]>(
    appointmentDetails?.patientAppointmentDocs || [],
  );

  const [loadingReport, setLoadingReport] = useState<boolean>(true);
  const user = useSelector((state: { user: UserState }) => state.user.user);

  // const handleError = useErrorHandler();

  const handleUploadRecords = (file: IMedicalReport) => {
    setMedicalReports((prev) => [...prev, file]);
    const files = form.getValues("documents") ?? [];
    const updatedFiles = [...files, file];
    form.setValue("documents", updatedFiles, { shouldDirty: true });
  };

  const isAvailableInAppointmentDocs = (file: IMedicalReport) => {
    const cloudDocs: IMedicalReport[] =
      appointmentDetails?.patientAppointmentDocs ?? [];
    return cloudDocs.some((doc) => doc.id === file.id);
  };

  console.log(isReset);
  const handleDeleteFile = (
    e: React.MouseEvent,
    file: any,
    field: any,
    index: number,
  ) => {
    if (isAvailableInAppointmentDocs(file)) {
      field.onChange([
        ...(field.value ?? []),
        {
          id: file.id,
          bucketPath: file.bucketPath,
        },
      ]);
    } else {
      form.setValue("removedDocuments", [
        ...(form.getValues("removedDocuments") ?? []),
        {
          id: file.id,
          bucketPath: file.bucketPath,
        },
      ]),
        { shouldDirty: true };
    }
    setMedicalReports((prev) => prev.filter((_, i) => i !== index));
    e.stopPropagation();
  };

  useEffect(() => {
    if (isReset) {
      console.log("hello");
      setMedicalReports(appointmentDetails?.patientAppointmentDocs || []);
    }
  }, [isReset]);

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex w-full items-center justify-between">
              <p>Patient Details</p>
            </div>
          </CardTitle>
          <CardDescription>This in-clinic appointment is for:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <Label>Patient Name</Label>
                <Input
                  className="!mt-2 capitalize"
                  value={user?.name}
                  disabled
                />
                <Label>Mobile Number</Label>
                <Input className="!mt-2" value={user?.phoneNumber} disabled />

                <FormField
                  control={form.control}
                  name="appointmentDetails.ailmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ailment</FormLabel>
                      <FormControl>
                        <Ailment
                          hospitalId={hospitalId}
                          onChange={field.onChange}
                          selectedValue={String(field.value)}
                          disabled={!isEdit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentDetails.remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks (optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={!isEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {appointmentDetails?.appointmentStatus === "COMPLETED" && (
                  <FormField
                    control={form.control}
                    name="appointmentDetails.remarks"
                    render={() => (
                      <FormItem>
                        <FormLabel>Doctor Remarks</FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={!isEdit}
                            value={appointmentDetails.doctorRemarks ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="removedDocuments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Reports (optional)</FormLabel>
                      <FormControl>
                        <div className="flex flex-col flex-wrap gap-1">
                          <div className="flex gap-1 items-center flex-wrap">
                            {medicalReports.map((file, index) => {
                              if (!file) return null;
                              const fileName = file?.fileName;
                              const fileType =
                                (file?.documentTypes?.name ??
                                  file?.documentTypeName) ||
                                `Report - ${index + 1}`;
                              return (
                                <Dialog key={index}>
                                  <DialogTrigger>
                                    <Badge
                                      variant={"secondary"}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex w-full max-w-[364px] gap-2 items-center capitalize">
                                        <p>{`${fileType}.${file.fileExtension}`}</p>
                                        {isEdit && (
                                          <X
                                            className="w-3 h-3 hover:scale-110"
                                            onClick={(e) =>
                                              handleDeleteFile(
                                                e,
                                                file,
                                                field,
                                                index,
                                              )
                                            }
                                          />
                                        )}
                                      </div>
                                    </Badge>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-[364px] md:max-w-[900px] max-h-max min-h-[40vh] rounded-lg shadow-lg flex flex-col overflow-auto">
                                    <DialogTitle>
                                      <DialogHeader>{fileName}</DialogHeader>
                                    </DialogTitle>
                                    {fileName.split(".").pop() === "pdf" ? (
                                      <div className="flex justify-center items-center w-full h-90">
                                        <div className="flex justify-center items-center w-full  flex-col gap-2 h-90">
                                          {loadingReport && (
                                            <div className="flex gap-2">
                                              <Loader className="animate-spin" />
                                              <p className="text-md font-medium text-gray-500">
                                                Loading Document...
                                              </p>
                                            </div>
                                          )}
                                          <object
                                            data={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                                              file.signedUrl,
                                            )}`}
                                            className="w-full h-full border-none"
                                            style={{ minHeight: "600px" }}
                                            onLoad={() =>
                                              setLoadingReport(false)
                                            }
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <img
                                        src={file.signedUrl}
                                        alt="record"
                                        width={"100%"}
                                        className="max-h-[500px] object-contain"
                                      />
                                    )}
                                  </DialogContent>
                                </Dialog>
                              );
                            })}
                          </div>
                          {isEdit && (
                            <UploadReport
                              hospitalId={hospitalId}
                              updateMedicalReport={handleUploadRecords}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isEdit && (
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={(e) => {
                        handleEdit(e);
                        form.reset();
                        setMedicalReports(
                          appointmentDetails?.patientAppointmentDocs || []
                        );
                      }}
                    >
                      Cancel
                    </Button> */}
                    <Button
                      className="flex-1"
                      disabled={!form.formState.isDirty}
                      type="submit"
                    >
                      {submitting ? (
                        <>
                          <Spinner type="light" />
                          Updating...
                        </>
                      ) : (
                        "Update Appointment"
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDetails;
