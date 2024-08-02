// src/pages/Profile.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DatePicker from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserState } from "@/types";
import { UserIcon } from "lucide-react";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
const Profile: React.FC = () => {
  const user = useSelector((state: { user: UserState }) => state.user.user!);
  const imageRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<User>();

  const [gender, setGender] = useState<User["gender"]>(user.gender);

  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    new Date(user.dateOfBirth)
  );
  const [bloodGroup, setBloodGroup] = useState("A+");

  const onSubmit = (data: User) => {
    console.log(data);
  };

  const handleDateChange: Dispatch<SetStateAction<Date | undefined>> = (
    date
  ) => {
    setDateOfBirth(date);
    setValue(
      "dateOfBirth",
      date ? (date as Date).toISOString().split("T")[0] : ""
    );
  };
  const genders = ["MALE", "FEMALE", "OTHERS"];
  const bloodGrops = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];
  return (
    <div className="container mx-auto p-4 w-full">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* First Row */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center w-full md:w-1/3">
                <div className="flex gap-3 items-center">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user.profilePictureUrl} alt="image" />
                    <AvatarFallback
                      className="hover:cursor-pointer"
                      onClick={() => imageRef?.current?.click()}
                    >
                      <UserIcon className="w-12 h-12" />
                      <input ref={imageRef} type="file" className="hidden" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start ml-4">
                    <Label>Profile Picture</Label>
                    <p className="text-gray-400 text-sm mt-1">
                      Pick a photo from your computer
                    </p>
                    <Button
                      variant="link"
                      onClick={() => imageRef?.current?.click()}
                      className="mt-2"
                    >
                      Add Photo
                    </Button>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <div className="flex flex-wrap">
                  <div className="mb-4 flex flex-col gap-[8px] w-full">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      type="text"
                      id="name"
                      defaultValue={user.name}
                      {...register("name", { required: true })}
                    />
                    {errors.name && (
                      <span className="text-red-500">
                        This field is required
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            {/* Second Row */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  type="text"
                  id="phoneNumber"
                  defaultValue={user.phoneNumber}
                  {...register("phoneNumber", { required: true })}
                />
                {errors.phoneNumber && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  defaultValue={user.email}
                  {...register("email", { required: true })}
                />
                {errors.email && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4 flex flex-col gap-2">
                <Label>Gender</Label>
                <Select
                  value={gender}
                  onValueChange={(option: User["gender"]) => setGender(option)}
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
                {errors.gender && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <DatePicker date={dateOfBirth} setDate={handleDateChange} />
                {errors.dateOfBirth && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4 flex flex-col gap-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select
                  value={bloodGroup}
                  onValueChange={(option) => setBloodGroup(option)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Select Blood Group"
                      defaultValue={bloodGroup}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {bloodGrops.map((item) => (
                        <SelectItem value={item} key={item}>
                          {" "}
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.bloodGroup && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
            </div>

            <hr className="my-4" />

            {/* Third Row */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4">
                <Label htmlFor="houseNumber">House Number</Label>
                <Input
                  type="text"
                  id="houseNumber"
                  defaultValue={user?.address?.houseNumber}
                  {...register("address.houseNumber", { required: true })}
                />
                {errors.address?.houseNumber && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4">
                <Label htmlFor="colony">Colony</Label>
                <Input
                  type="text"
                  id="colony"
                  defaultValue={user?.address?.colony}
                  {...register("address.colony", { required: true })}
                />
                {errors.address?.colony && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4">
                <Label htmlFor="city">City</Label>
                <Input
                  type="text"
                  id="city"
                  defaultValue={user?.address?.city}
                  {...register("address.city", { required: true })}
                />
                {errors.address?.city && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4">
                <Label htmlFor="state">State</Label>
                <Input
                  type="text"
                  id="state"
                  defaultValue={user?.address?.state}
                  {...register("address.state", { required: true })}
                />
                {errors.address?.state && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4">
                <Label htmlFor="country">Country</Label>
                <Input
                  type="text"
                  id="country"
                  defaultValue={user?.address?.country}
                  {...register("address.country", { required: true })}
                />
                {errors.address?.country && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  type="text"
                  id="pincode"
                  defaultValue={user?.address?.pincode}
                  {...register("address.pincode", { required: true })}
                />
                {errors.address?.pincode && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
            </div>

            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
