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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import useErrorHandler from "@/hooks/useError";
import { getUserDetails, login } from "@/https/auth-service";
import { getWeekdayList } from "@/https/patients-service";
import { setWeekdays } from "@/state/appointementReducer";
import { setUser } from "@/state/userReducer";
import { IloginForm, UserState } from "@/types";
import { Eye, EyeOff } from "lucide-react";
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
    message: "Enter valid email address or  phone number",
  }
);

const loginSchema = z.object({
  userName: emailOrPhoneSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginForm = () => {
  const form = useForm<IloginForm>({
    resolver: zodResolver(loginSchema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const user = useSelector((state: { user: UserState }) => state.user.user);
  const handleError = useErrorHandler();

  if (user) {
    return <Navigate to={APP_ROUTES.DASHBOARD} />;
  }
  console.log(form.formState.errors);
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
        const [detailsRes, weekdayRes] = await Promise.all([
          getUserDetails(),
          getWeekdayList(),
        ]);

        dispatch(setUser(detailsRes.data.data));
        dispatch(setWeekdays(weekdayRes.data.data));
        navigate(APP_ROUTES.DASHBOARD);
      }
      toast.success("Logged in successfully");
    } catch (error) {
      handleError(error, "Failed to login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex justify-center items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>Log in to your account</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email / Mobile</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="m@example.com / 9898989898"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="************"
                        />
                        {showPassword ? (
                          <Eye
                            className="absolute cursor-pointer top-2 right-2 hover:text-muted-foreground"
                            onClick={() => setShowPassword((prev) => !prev)}
                          />
                        ) : (
                          <EyeOff
                            className="absolute cursor-pointer top-2 right-2 hover:text-muted-foreground"
                            onClick={() => setShowPassword((prev) => !prev)}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <div className="mt-4 self-start flex gap-2 items-center justifu-center text-sm">
                <Link
                  to={APP_ROUTES.FORGET_PASSWORD}
                  className="underline m-0 p-0"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="mt-4 self-start flex gap-2 items-center justifu-center text-sm">
                <span>Don&apos;t have an account?</span>
                <Link to={APP_ROUTES.REGISTER} className="underline m-0 p-0">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </section>
  );
};

export default LoginForm;
