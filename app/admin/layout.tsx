import React from "react";

import AdminSidebar from "@/components/AdminSidebar/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />

      {/* Main content */}
      <div className="ml-64 w-full  min-h-screen  ">
        {children}
      </div>
    </div>
  );
}
