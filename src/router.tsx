import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import { createBrowserRouter } from "react-router-dom";
import AppointmentConfirmationPage from "./pages/AppointmentConfirmationPage";
import BookAppointmentFrom from "./pages/BookAppointmentPage";
import Profile from "./pages/Profile";
import BookAppointmentPage from "./pages/BookAppointmentPage";
import DashboardPage from "./pages/DashboardPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "patient",
        element: <HomePage />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "appointment",
        element: <BookAppointmentPage />,
      },
      {
        path: "appointment/confirm",
        element: <AppointmentConfirmationPage />,
      },
      {
        path:"dashboard",
        element:<DashboardPage/>
      }
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
]);

export default router;
