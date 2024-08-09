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
import DatePicker from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import { getUserDetails, register } from "@/https/auth-service";
import { setUser } from "@/state/userReducer";
import { ISignupForm } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email({ message: "Entar a valid email" }),
  password: z.string().min(1, "Password is required"),
  phoneNumber: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .or(z.literal("")),
  dateOfBirth: z.date({ required_error: "Date of Birth is required" }),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z.string().min(1, "Blood Group is required"),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const form = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      dateOfBirth: undefined,
      gender: "",
      bloodGroup: "",
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const formCtx = useFormContext();
  const dispatch = useDispatch();

  const genders = ["MALE", "FEMALE", "OTHER"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      setSubmitting(true);
      const payload: ISignupForm = {
        ...data,
        phoneNumber: data.phoneNumber.substring(3),
        isd_code: data.phoneNumber.substring(0, 3),
        dateOfBirth: data.dateOfBirth.toISOString(),
      };

      await register(payload);
      toast.success("Registration successful");
      const detailsRes = await getUserDetails();
      dispatch(setUser(detailsRes.data.data));
      navigate(APP_ROUTES.DASHBOARD);
    } catch (error: AxiosError | unknown) {
      console.error("Error:", error);
      let message =
        "Our servers are facing some issues. Please try again later";

      if ((error as AxiosError)?.response?.status === 409) {
        message = "User already exists";
      }

      toast.error("Registration failed", {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleDateChange: Dispatch<SetStateAction<Date | undefined>> = (
    date
  ) => {
    formCtx?.setValue("dateOfBirth", date);
  };

  return (
    <section className="flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} >
            <CardContent className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
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
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="IN"
                        placeholder="Enter a phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={(date) => {
                          field.onChange(date);
                          handleDateChange(date);
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="capitalize">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent className="capitalize">
                          <SelectGroup>
                            {genders.map((item) => (
                              <SelectItem
                                value={item}
                                key={item}
                                className="capitalize"
                              >
                                {item.toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Blood Group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {bloodGroups.map((item) => (
                              <SelectItem value={item} key={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex-col w-full">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner type="light" />
                    Please wait...
                  </>
                ) : (
                  "Get Started!"
                )}
              </Button>
              <div className="mt-4 text-center flex gap-2 items-center text-sm">
                <span>Already have an account?</span>
                <Link to={APP_ROUTES.LOGIN} className="underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </section>
  );
};

export default RegisterPage;
