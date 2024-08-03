// useErrorHandler.ts
import { toast } from "sonner";

const useErrorHandler = () => {
  const handleError = (error: any, customMessage?: string) => {
    console.error(customMessage, error);

    if (error.response && error.response.status !== 401) {
      toast.error(customMessage, {
        description:
          "Our servers are facing technical issues. Please try again later.",
      });
    }
  };

  return handleError;
};

export default useErrorHandler;
