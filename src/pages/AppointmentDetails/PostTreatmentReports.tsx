import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useErrorHandler from "@/hooks/useError";
import { deletePostTreatmentDocument } from "@/https/patients-service";
import { IAppointmentResponse } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import UploadPostTreatmentReport from "../shared/UploadPostTreatmentReport";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Spinner from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { ClipboardPlus, Loader, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FeedbackComponentProps {
  appointmentDetails: IAppointmentResponse;
  fetchAppointmentDetails: () => Promise<void>;
}

const PostTreatmentReports = ({
  appointmentDetails,
  fetchAppointmentDetails,
}: FeedbackComponentProps) => {
  const [documentToDelete, setDocumentToDelete] = useState<string>("");
  const [deleteDocumentAlert, setDeleteDocumentAlert] =
    useState<boolean>(false);

  const handleError = useErrorHandler();
  const [loadingReport, setLoadingReport] = useState<boolean>(true);

  const DeleteDocumentDialog = () => {
    const [isCancelling, setIsCancelling] = useState<boolean>(false);

    const handleCancel = async () => {
      try {
        setIsCancelling(true);
        await deletePostTreatmentDocument(
          documentToDelete,
          appointmentDetails.id,
        );
        toast.success("Document deleted successfully");
        fetchAppointmentDetails();
      } catch (error) {
        handleError(error, "Error deleting document");
      } finally {
        setIsCancelling(false);
        setDeleteDocumentAlert(false);
        setDocumentToDelete("");
      }
    };
    return (
      <AlertDialogContent className="max-w-[360px] md:max-w-[500px] rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            document.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setDocumentToDelete("");
              setDeleteDocumentAlert(false);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleCancel();
            }}
          >
            Continue
            {isCancelling && <Spinner type="light" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    );
  };

  const handleUploadRecords = () => {
    fetchAppointmentDetails();
  };

  return (
    <div className="w-full h-fit">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex w-full items-center justify-between">
              <p>Post Treatment Reports</p>
              <UploadPostTreatmentReport
                hospitalId={appointmentDetails!.hospitalId}
                updateMedicalReport={handleUploadRecords}
                appointmentId={appointmentDetails!.id}
                patientId={appointmentDetails!.patientId}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {appointmentDetails &&
              appointmentDetails.postTreatmentDocuments.length === 0 && (
                <p className="flex items-center justify-center text-blue-500 p-4 bg-blue-100 rounded-md w-full">
                  <ClipboardPlus className="md:w-6 md:h-6 w-8 h-8 sm:self-start mr-2" />
                  <span className="text-md font-medium text-center">
                    No Records Available!
                  </span>
                </p>
              )}
            <div className="flex items-center gap-2 flex-wrap">
              {appointmentDetails &&
                appointmentDetails.postTreatmentDocuments.length !== 0 &&
                appointmentDetails.postTreatmentDocuments.map((file, index) => {
                  return (
                    <>
                      <Dialog key={index}>
                        <DialogTrigger>
                          <Badge
                            variant={"secondary"}
                            className="cursor-pointer"
                          >
                            <div className="flex w-full max-w-[364px] gap-2 items-center capitalize">
                              <p>{`${file.documentTypes.name}.${file.fileExtension}`}</p>
                              <X
                                className="w-3 h-3 hover:scale-110"
                                xlinkTitle="Delete Document"
                                onClick={(e) => {
                                  setDocumentToDelete(file.id);
                                  setDeleteDocumentAlert(true);
                                  e.stopPropagation();
                                }}
                              />
                            </div>
                          </Badge>
                        </DialogTrigger>
                        <DialogContent className="max-w-[364px] md:max-w-[900px] max-h-max min-h-[40vh] rounded-lg shadow-lg flex flex-col overflow-auto">
                          <DialogTitle>
                            <DialogHeader>{file.documentName}</DialogHeader>
                          </DialogTitle>
                          {file.documentName.split(".").pop() === "pdf" ? (
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
                                  onLoad={() => setLoadingReport(false)}
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
                    </>
                  );
                })}
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={deleteDocumentAlert}>
        <DeleteDocumentDialog />
      </AlertDialog>
    </div>
  );
};

export default PostTreatmentReports;
