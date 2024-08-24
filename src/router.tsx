import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/pages/LoginPage";
import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { APP_ROUTES } from "./appRoutes";
import Spinner from "./components/ui/spinner";
import ErrorBoundary from "./layouts/ErrorBoundary";
import AppointmentConfirmationPage from "./pages/AppointmentConfirmationPage";
import AppointmentDetails from "./pages/AppointmentDetails/AppointmentDetails";
import AppointmentsList from "./pages/AppointmentsList";
import BookAppointmentPage from "./pages/BookAppointmentPage";
import DashboardPage from "./pages/DashboardPage";
import Medications from "./pages/Medications";
import NotFoundPage from "./pages/NotFoundPage";
import Profile from "./pages/Profile";
import ForgetPassword from "./pages/PasswordManagement/ForgetPassword";
import ResetPassword from "./pages/PasswordManagement/ResetPassword";
const RegisterPage = React.lazy(() => import("@/pages/RegisterPage"));
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
        path: APP_ROUTES.APPOINTMENT_LIST + "/:type",
        element: <AppointmentsList />,
      },
      {
        path: APP_ROUTES.APPOINTMENT_LIST,
        element: <AppointmentsList />,
      },
      {
        path: APP_ROUTES.APPOINTMENT_DETAILS + "/:id",
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
    element: (
      <ErrorBoundary>
        <AuthLayout />
      </ErrorBoundary>
    ),
    children: [
      {
        path: APP_ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: APP_ROUTES.REGISTER,
        element: (
          <Suspense
            fallback={
              <>
                <Spinner />
                Please wait...
              </>
            }
          >
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: APP_ROUTES.FORGET_PASSWORD,
        element: <ForgetPassword />,
      },
      {
        path: APP_ROUTES.RESET_PASSWORD + "/:token",
        element: <ResetPassword />,
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
