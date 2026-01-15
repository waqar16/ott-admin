import React from "react";

import AdminSidebar from "@/components/AdminSidebar/AdminSidebar";
import { PlatformSettingsProvider } from "@/lib/platformSettings";
import { leagueSpartan } from "@/fonts/fonts";
import MobileAdminNav from "@/components/AdminSidebar/MobileAdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlatformSettingsProvider>
      <div className="flex">
         <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileAdminNav />

        {/* Main content */}
        <div className={`md:ml-[260px] w-full min-h-screen bg-black  ${leagueSpartan.className} font-normal`}>
          {children}
        </div>
      </div>
    </PlatformSettingsProvider>
  );
}
