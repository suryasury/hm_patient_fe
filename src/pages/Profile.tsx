// src/pages/Profile.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DatePicker from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types";
import { UserIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
const Profile: React.FC = () => {
  const user = useSelector((state: { user: User }) => state.user);
  const imageRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<User>();
  const [gender, setGender] = useState(user.gender.toLocaleLowerCase());

  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(new Date(user.dateOfBirth));

  const onSubmit = (data: User) => {
    console.log(data);
  };

  const handleDateChange = (date: Date | undefined) => {
    setDateOfBirth(date);
    setValue("dateOfBirth", date ? date.toISOString().split("T")[0] : "");
  };

  return (
    <div className="container mx-auto p-4 w-[1128px]">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* First Row */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex gap-3 items-center">
                <div>
                  <Label>Profile Picture</Label>
                  <Avatar className="mt-2 w-20 h-20">
                    <AvatarImage src={user.profilePictureUrl} alt={"image"} />
                    <AvatarFallback
                      className="hover:cursor-pointer"
                      onClick={() => imageRef?.current?.click()}
                    >
                      <UserIcon className="w-12 h-12" />
                      <input ref={imageRef} type="file" className="hidden" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col  items-start">
                  <p className="text-gray-400 text-sm">
                    Pick a photo from your computer
                  </p>
                  <Button
                    variant="link"
                    onClick={() => imageRef?.current?.click()}
                    className="m-[-16px] mt-[8px]"
                  >
                    Add Photo
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <div className="flex flex-wrap">
                  <div className=" mb-4 flex flex-col gap-3">
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
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4 flex flex-col gap-[10px]">
                <Label>Gender</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="capitalize w-[200px]"
                    >
                      {gender.toLowerCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    <DropdownMenuCheckboxItem
                      checked={gender === "MALE"}
                      onCheckedChange={() => setGender("MALE")}
                    >
                      Male
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={gender === "FEMALE"}
                      onCheckedChange={() => setGender("FEMALE")}
                    >
                      Female
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={gender === "OTHER"}
                      onCheckedChange={() => setGender("OTHER")}
                    >
                      Other
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {errors.gender && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <DatePicker
                  date={dateOfBirth}
                  setDate={handleDateChange}
                />
                {errors.dateOfBirth && (
                  <span className="text-red-500">This field is required</span>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-1/4 mb-4 flex flex-col gap-[10px]">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="capitalize w-[200px]"
                    >
                      {user.bloodGroup}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    <DropdownMenuCheckboxItem
                      checked={gender === "MALE"}
                      onCheckedChange={() => setGender("MALE")}
                    >
                      A+
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={gender === "OTHER"}
                      onCheckedChange={() => setGender("OTHER")}
                    >
                      B+
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={gender === "OTHER"}
                      onCheckedChange={() => setGender("OTHER")}
                    >
                      O+
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={gender === "OTHER"}
                      onCheckedChange={() => setGender("OTHER")}
                    >
                      AB+
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={gender === "FEMALE"}
                      onCheckedChange={() => setGender("FEMALE")}
                    >
                      A-
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={gender === "OTHER"}
                      onCheckedChange={() => setGender("OTHER")}
                    >
                      B-
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={gender === "OTHER"}
                      onCheckedChange={() => setGender("OTHER")}
                    >
                      O-
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={gender === "OTHER"}
                      onCheckedChange={() => setGender("OTHER")}
                    >
                      AB-
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
