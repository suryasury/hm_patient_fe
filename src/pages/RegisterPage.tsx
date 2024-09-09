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
import { Eye, EyeOff } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { encryptPassword } from "./utils";
import logo from "@/assets/hms-logo.jpeg";
import { TERMS_AND_POLICIES } from "@/https/constants";

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
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const genders = ["MALE", "FEMALE", "OTHER"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      setSubmitting(true);
      const payload: ISignupForm = {
        ...data,
        password: await encryptPassword(data.password),
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
    date,
  ) => {
    formCtx?.setValue("dateOfBirth", date);
  };

  return (
    <section className="flex items-center justify-center">
      <Card className="w-full max-w-md border-none shadow-none items-center">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-[30px]">
            <img src={logo} width={"200px"} height={"100px"} />
          </div>
          <CardTitle className="text-3xl">Create an account</CardTitle>
          <CardDescription className="text-[16px] text-muted-foreground">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className="text-red-500">*</span>
                    </FormLabel>
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
                    <FormLabel>
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          form.trigger("email");
                        }}
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
                    <FormLabel>
                      Password <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
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
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="IN"
                        placeholder="Enter a phone number"
                        {...field}
                        onChange={(val) => {
                          field.onChange(val);
                          form.trigger("phoneNumber");
                        }}
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
                    <FormLabel>
                      Date of Birth <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        disabled={{ after: new Date() }}
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
                    <FormLabel>
                      Gender <span className="text-red-500">*</span>
                    </FormLabel>
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
                    <FormLabel>
                      Blood Group <span className="text-red-500">*</span>
                    </FormLabel>
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
            <CardContent>
              <p className="text-muted-foreground text-[15px] text-center">
                By creating an account, you agree to our{" "}
                <span>
                  <a
                    href={TERMS_AND_POLICIES.TERMS_OF_SERVICE}
                    className="text-blue-500 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </a>
                </span>{" "}
                and have read and acknowledge the{" "}
                <span>
                  <a
                    href={TERMS_AND_POLICIES.PRIVACY_POLICY}
                    className="text-blue-500 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </span>
              </p>
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
