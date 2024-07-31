import { APP_ROUTES } from "@/appRoutes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearUser } from "@/state/userReducer";
import { UserState } from "@/types";
import { CircleUser } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DynamicBreadcrumbs } from "./DynamicBreadCrumbs";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: { user: UserState }) => state.user.user);

  if (!user) {
    toast.error("You need to login to access this page");
    return <Navigate to={APP_ROUTES.LOGIN} />;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="flex h-16 items-center gap-4 border-b bg-white px-4 lg:h-20 lg:px-6">
        <div className="flex-1">
          <h1 className="text-xl font-semibold md:text-2xl">Logo </h1>
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
            <DropdownMenuItem onClick={() => navigate(APP_ROUTES.PROFILE)}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                dispatch(clearUser());
                navigate(APP_ROUTES.LOGIN);
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-col items-center justify-center p-6 ">
        <h2 className="text-2xl font-bold mb-4">
          Hi, <span className="capitalize">{user?.name}</span>
        </h2>
        <div className="px-8 w-full max-w-[1180px] mb-3">
          <DynamicBreadcrumbs />
        </div>
        <div className="w-full max-w-[1180px] flex items-center justify-center overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
