import React from "react";

import AdminSidebar from "@/components/AdminSidebar/AdminSidebar";
import { PlatformSettingsProvider } from "@/lib/platformSettings";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlatformSettingsProvider>
      <div className="flex">
        <AdminSidebar />

        {/* Main content */}
        <div className="ml-[260px] w-full min-h-screen bg-black ">
          {children}
        </div>
      </div>
    </PlatformSettingsProvider>
  );
}
