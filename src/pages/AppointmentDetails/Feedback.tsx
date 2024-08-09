import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import StarRating from "@/components/ui/star";
import { Textarea } from "@/components/ui/textarea";
import useErrorHandler from "@/hooks/useError";
import { editFeedback, submitFeedback } from "@/https/patients-service";
import { IAppointmentResponse } from "@/types";
import { SquarePen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FeedbackComponentProps {
  appointmentDetails: IAppointmentResponse | null | undefined;
  fetchAppointmentDetails: () => Promise<void>;
}

const Feedback = ({
  appointmentDetails,
  fetchAppointmentDetails,
}: FeedbackComponentProps) => {
  const [feedback, setFeedback] = useState({
    rating: Number(
      appointmentDetails?.appointmentFeedbacks?.overallSatisfaction ?? 0
    ),
    remarks: appointmentDetails?.appointmentFeedbacks?.feedBackRemarks ?? "",
    feedbackId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const isFeedbackGiven =
    appointmentDetails?.isFeedbackProvided &&
    appointmentDetails.appointmentFeedbacks !== null;

  const handleError = useErrorHandler();
  const handleFeedbackSubmit = async () => {
    setSubmitting(true);
    const payload = {
      appointmentId: appointmentDetails?.id!,
      hospitalId: appointmentDetails!.hospitalId,
      overallSatisfaction: feedback.rating,
      feedBackRemarks: feedback.remarks,
    };

    try {
      await submitFeedback(payload);
      toast.success("Feedback submitted successfully!");
      await fetchAppointmentDetails();
      setIsEdit(false);
    } catch (error) {
      handleError(error, "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackEdit = async () => {
    setSubmitting(true);
    const payload = {
      overallSatisfaction: feedback.rating,
      feedBackRemarks: feedback.remarks,
    };

    try {
      await editFeedback(payload, appointmentDetails!.appointmentFeedbacks!.id);
      toast.success("Feedback edited successfully!");
      await fetchAppointmentDetails();

    } catch (error) {
      handleError(error, "Failed to edit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const allowFeedback = () => {
    return !isFeedbackGiven;
  };
  const handleRatingClick = (rating: number) => {
    setFeedback((prev) => ({ ...prev, rating }));
  };

  return (
    <div className="w-full sm:w-[50%] h-fit">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex w-full items-center justify-between">
              <p>Feedback</p>
              {isFeedbackGiven && (
                <SquarePen
                  className="w-5 h-5 cursor-pointer hover:scale-125"
                  onClick={() => setIsEdit(true)}
                />
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <p className="text-md font-semibold">Rating:</p>
              <StarRating
                totalStars={5}
                onClick={handleRatingClick}
                value={feedback.rating}
                disable={!isEdit && isFeedbackGiven}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="remarks">Remarks:</Label>
              <Textarea
                id="remarks"
                value={feedback.remarks}
                onChange={(e) =>
                  setFeedback((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
                disabled={!isEdit && isFeedbackGiven}
                placeholder="Share your experience..."
              />
            </div>
            {(isEdit || allowFeedback()) && (
              <div className="flex justify-end">
                <Button
                  onClick={
                    isFeedbackGiven ? handleFeedbackEdit : handleFeedbackSubmit
                  }
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : isFeedbackGiven
                    ? "Edit Feedback"
                    : "Submit Feedback"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Feedback;
