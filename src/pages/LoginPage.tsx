import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

import { APP_ROUTES } from "@/appRoutes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { getUserDetails, login } from "@/https/auth-service";
import { setUser } from "@/state/userReducer";
import { IloginForm, UserState } from "@/types";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const emailOrPhoneSchema = z.string().refine(
  (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  },
  {
    message: "Must be a valid email address or a 10-digit phone number",
  }
);

const loginSchema = z.object({
  userName: emailOrPhoneSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IloginForm>({
    resolver: zodResolver(loginSchema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const user = useSelector((state: { user: UserState }) => state.user.user);

  if (user) {
    return <Navigate to={APP_ROUTES.DASHBOARD} />;
  }

  const onSubmit: SubmitHandler<IloginForm> = async (data: IloginForm) => {
    try {
      setSubmitting(true);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const userNameType = emailRegex.test(data.userName)
        ? "EMAIL"
        : "PHONE_NUMBER";

      const payload = {
        ...data,
        userNameType,
      };
      const response = await login(payload);
      console.log(response.status);
      if (response.status === 200) {
        const detailsRes = await getUserDetails();
        dispatch(setUser(detailsRes.data.data));
        navigate(APP_ROUTES.DASHBOARD);
      }
      toast.success("Logged in successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email or mobile number below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="emailOrPhone">Email / Mobile</Label>
              <Input
                id="userName"
                type="text"
                placeholder="m@example.com / 9898989898"
                {...register("userName")}
                className="border-2 rounded-sm p-2"
                required
              />
              {errors.userName && (
                <span className="text-red-500">
                  {errors.userName.message as string}
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="border-2 rounded-sm p-2"
                required
              />
              {errors.password && (
                <span className="text-red-500">
                  {errors.password.message as string}
                </span>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex-col">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner type="light" />
                  Please wait...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to={APP_ROUTES.REGISTER} className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </section>
  );
};

export default LoginForm;
