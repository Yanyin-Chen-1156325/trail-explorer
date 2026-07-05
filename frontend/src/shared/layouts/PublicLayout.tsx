import { Outlet } from "react-router-dom";

import { SiteFooter } from "@/shared/components/SiteFooter";
import { SiteHeader } from "@/shared/components/SiteHeader";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F7F8F3] text-[#0B1511] dark:bg-[#071511] dark:text-white">
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </div>
  );
}

export { PublicLayout };
