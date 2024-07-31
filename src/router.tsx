import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import { createBrowserRouter } from "react-router-dom";
import AppointmentConfirmationPage from "./pages/AppointmentConfirmationPage";
import BookAppointmentPage from "./pages/BookAppointmentPage";
import DashboardPage from "./pages/DashboardPage";
import Profile from "./pages/Profile";
import { APP_ROUTES } from "./appRoutes";

const router = createBrowserRouter([
  {
    path: "/patient",
    element: <MainLayout />,
    children: [
      {
        path: APP_ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
      {
        path: APP_ROUTES.PROFILE,
        element: <Profile />,
      },
      {
        path: APP_ROUTES.APPOINTMENT,
        element: <BookAppointmentPage />,
      },
      {
        path: APP_ROUTES.APPOINTMENT_CONFIRM,
        element: <AppointmentConfirmationPage />,
      },
    ],
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: APP_ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: APP_ROUTES.REGISTER,
        element: <RegisterPage />,
      },
    ],
  },
]);

export default router;
