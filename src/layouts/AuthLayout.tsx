import { Outlet } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import sideImage from "@/assets/side_image.webp";

const Layout = () => {
  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="hidden bg-muted lg:block">
        <img
          src={sideImage}
          alt="image"
          className="h-full object dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  );
};

export default Layout;
