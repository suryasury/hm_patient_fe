import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // Adjust the import path as needed
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function DynamicBreadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split("/").filter((x, index, arr) => {
    // Filter out 'patient' and discard any part after 'details'
    if (x === "patient") return false;
    const detailsIndex = arr.indexOf("details");
    if (detailsIndex !== -1 && index > detailsIndex) return false;
    return true;
  }).filter(x => x!=="");

  // Create breadcrumbs, excluding 'patient' from the path
  const breadcrumbItems: Array<{ name: string; to: string; isLast?: boolean }> =
    [
      {
        name: "Home",
        to: "/patient/dashboard",
      },
      ...pathnames.map((value, index) => {
        const to = `/patient/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return {
          name: value.charAt(0).toUpperCase() + value.slice(1),
          to,
          isLast,
        };
      }),
    ];
    
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={`${item.name}`}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => navigate(item.to)}
                >
                  {item.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
