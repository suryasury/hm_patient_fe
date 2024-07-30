import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import { createBrowserRouter } from "react-router-dom";
import PatientDetails from "./forms/PatientDetails";
import BookAppointmentForm from "./pages/BookAppointmentPage";
import BookAppointmentFrom from "./pages/BookAppointmentPage";
import AppointmentConfirmationPage from "./pages/AppointmentConfirmationPage";

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
        element: <PatientDetails />,
      },
      {
        path:"appointment",
        element:<BookAppointmentFrom/>
      },
      {
        path:"appointment/confirm",
        element:<AppointmentConfirmationPage/>
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
