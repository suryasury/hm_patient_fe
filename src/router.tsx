import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import { createBrowserRouter } from "react-router-dom";
import { APP_ROUTES } from "./appRoutes";
import ErrorBoundary from "./layouts/ErrorBoundary";
import AppointmentConfirmationPage from "./pages/AppointmentConfirmationPage";
import AppointmentDetails from "./pages/AppointmentDetails";
import AppointmentsList from "./pages/AppointmentsList";
import BookAppointmentPage from "./pages/BookAppointmentPage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import Profile from "./pages/Profile";
import Medications from "./pages/Medications";

const router = createBrowserRouter([
  {
    path: "/patient",
    element: (
      <ErrorBoundary>
        <MainLayout />
      </ErrorBoundary>
    ),
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
      {
        path: APP_ROUTES.APPOINTMENT_LIST,
        element: <AppointmentsList />,
      },
      {
        path: APP_ROUTES.APPOINTMENT_DETAILS,
        element: <AppointmentDetails />,
      },
      {
        path: APP_ROUTES.MEDICATION,
        element: <Medications />,
      },
      /* 404 page */
      {
        path: "*",
        element: <NotFoundPage />,
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
      /* 404 page */
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  /* 404 page */
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
