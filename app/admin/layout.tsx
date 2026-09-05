'use client'

import React, { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar/AdminSidebar'
import MobileAdminNav from '@/components/AdminSidebar/MobileAdminNav'
import AdminNavbar from '@/components/AdminNavbar/AdminNavbar'
import { PlatformSettingsProvider } from '@/lib/platformSettings'
import { ThemeProvider } from '@/components/theme/ThemeContext'
import { leagueSpartan } from '@/fonts/fonts'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 300)

    return () => clearTimeout(timer)
  }, [sidebarCollapsed])
  return (
    <PlatformSettingsProvider>
      <ThemeProvider>
        {/* Synchronous script to prevent theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              var savedTheme = localStorage.getItem('admin-theme');
              if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();
        `,
          }}
        />

        <div className=" flex min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
          </div>

          {/* Mobile Drawer (Mobile Sidebar) */}
          <MobileAdminNav openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />

          {/* Main content wrapper */}
          <div
            className={`flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300 ${
              sidebarCollapsed ? 'md:pl-[76px]' : 'md:pl-[260px]'
            }`}
          >
            {/* Sticky Top Navbar */}
            <AdminNavbar
              collapsed={sidebarCollapsed}
              setCollapsed={setSidebarCollapsed}
              setOpenDrawer={setOpenDrawer}
            />

            {/* Main content page area */}
            <main
              className={`flex-1 min-w-0 overflow-x-hidden p-4 md:p-6 lg:p-8 mt-16 ${leagueSpartan.className}`}
            >
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </PlatformSettingsProvider>
  )
}
