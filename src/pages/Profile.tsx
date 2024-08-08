// src/pages/Profile.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import useErrorHandler from "@/hooks/useError";
import { getUserDetails } from "@/https/auth-service";
import { updateProfile, uploadProfilePicture } from "@/https/patients-service";
import { setUser } from "@/state/userReducer";
import { IUpdateUserProfile, UserState } from "@/types";
import { Loader, UserIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PhoneInput } from "@/components/ui/phone-input";
import Spinner from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";
import { dirtyValues } from "./utils";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  phoneNumber: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHERS"]),
  bloodGroup: z.enum(["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"]),
  houseNumber: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
});
const Profile: React.FC = () => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const user = useSelector((state: { user: UserState }) => state.user.user!);
  const imageRef = useRef<HTMLInputElement>(null);
  const handleError = useErrorHandler();

  const dispatch = useDispatch();

  const form = useForm<IUpdateUserProfile>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      ...user,
    },
  });

  const onSubmit: SubmitHandler<IUpdateUserProfile> = async () => {
    try {
      setSubmitting(true);
      const payload: IUpdateUserProfile = dirtyValues(
        form.formState.dirtyFields,
        form.getValues()
      );
      const res = await updateProfile(payload);
      if (res.status === 200) {
        toast.success("Appointment updated successfully");
        const detailsRes = await getUserDetails();
        dispatch(setUser(detailsRes.data.data));
        form.reset(detailsRes.data.data);
      }
    } catch (error) {
      handleError(error, "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      setUploadingImage(true);
      if (file) {
        const validImageTypes = ["image/jpeg", "image/png"];
        if (!validImageTypes.includes(file.type)) {
          toast.error("Only images are allowed");
          throw new Error("Not an image");
        }
        const formData = new FormData();
        formData.append("file", file);
        await uploadProfilePicture(formData);
        toast.success("Profile picture uploaded successfully");
        const detailsRes = await getUserDetails();
        dispatch(setUser(detailsRes.data.data));
      } else {
        throw new Error("No file selected");
      }
    } catch (error) {
      console.error(error);
      handleError(error, "Failed to upload profile picture");
    } finally {
      setUploadingImage(false);
    }
  };
  const genders = ["MALE", "FEMALE", "OTHERS"];
  const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];

  return (
    <div className="container mx-auto p-4 w-full">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {/* First Row */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center w-full md:w-1/3">
              <div className="flex gap-3 items-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={user.signedUrl}
                    alt="image"
                    className="object-fit aspect-square"
                  />
                  <AvatarFallback
                    className="hover:cursor-pointer"
                    onClick={() => imageRef?.current?.click()}
                  >
                    <UserIcon className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start ml-4">
                  <Label>Profile Picture</Label>
                  <p className="text-gray-400 text-sm mt-1">
                    Pick a photo from your computer
                  </p>
                  <Button
                    variant="link"
                    onClick={(e) => {
                      e.preventDefault();
                      imageRef?.current?.click();
                    }}
                    className="mt-2 ml-[-12px]"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader className="animate-spin" />
                        Uploading...
                      </>
                    ) : user.signedUrl ? (
                      "Update Photo"
                    ) : (
                      "Add Photo"
                    )}
                  </Button>
                </div>
                <input
                  ref={imageRef}
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png"
                />
              </div>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* First Row */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} defaultValue={user.name} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <hr className="my-4" />

              {/* Second Row */}
              <div className="flex flex-wrap gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
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
                  name="email"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          defaultValue={user.email}
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
                    <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4 flex flex-col gap-2">
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
                                  className="capitalize"
                                  key={item}
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
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={
                            field.value ? new Date(field.value) : new Date()
                          }
                          setDate={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4 flex flex-col gap-2">
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
              </div>

              <hr className="my-4" />

              {/* Third Row */}
              <div className="flex flex-wrap gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="houseNumber"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                      <FormLabel>House Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          defaultValue={user?.address?.houseNumber}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address1"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                      <FormLabel>Colony</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          defaultValue={user?.address?.colony}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={user?.address?.city} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue={user?.address?.state} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          defaultValue={user?.address?.country}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2 lg:w-1/4 mb-4">
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          defaultValue={user?.address?.pincode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={submitting || !form.formState.isDirty}
              >
                {submitting ? (
                  <>
                    <Spinner type="light" />
                    Please wait...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
