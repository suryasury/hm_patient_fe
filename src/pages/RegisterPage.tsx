import { APP_ROUTES } from "@/appRoutes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  return (
    <section className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email/Mobile Number</Label>
              <Input id="email-ph-number" type="text" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
            <Button type="submit" className="w-full">
              Get Started!
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to={APP_ROUTES.LOGIN} className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default RegisterPage;
