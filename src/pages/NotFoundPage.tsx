import { APP_ROUTES } from "@/appRoutes";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-100 flex items-center justify-center h-screen  w-full">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-4">Oops! Page Not Found</p>
        <p className="text-gray-500 mb-8">
          It seems the page you're looking for doesn't exist. Please check the
          URL or return to the homepage.
        </p>
        <Button onClick={() => navigate(APP_ROUTES.DASHBOARD)}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
