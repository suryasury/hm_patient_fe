import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarPlus2,
  CircleUser,
  LayoutDashboard,
  Stethoscope,
  Users,
} from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

const navItemIconClass = "h-4 w-4";

const linkToTitle = {
  "/dashboard": "Dashboard",
  "/patients": "Patients",
  "/doctors": "Doctors",
  "/appointments": "Appointments",
};

const navItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className={navItemIconClass} />,
    link: "/dashboard",
  },
  {
    label: "Patients",
    icon: <Users className={navItemIconClass} />,
    link: "/patients",
  },
  {
    label: "Doctors",
    icon: <Stethoscope className={navItemIconClass} />,
    link: "/doctors",
  },
  {
    label: "Appointments",
    icon: <CalendarPlus2 className={navItemIconClass} />,
    link: "/appointments",
  },
];

const DashboardLayout = () => {
  const location = useLocation();
  return (
    <div className="grid min-h-screen w-full ">
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b  px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold md:text-2xl">
              {linkToTitle[location.pathname as keyof typeof linkToTitle]}
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="w-max-[1180px] flex item-center justify-center m-3 overflow-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
