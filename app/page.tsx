'use client'

import { useEffect, useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm.client'
import { leagueSpartan } from '@/fonts/fonts'
import { LuFilm, LuTv, LuUsers, LuCreditCard, LuChartBar, LuShield } from 'react-icons/lu'

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .minimal-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .minimal-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 999px;
        }
        .minimal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .minimal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
      `}</style>

      <div className="relative min-h-screen lg:h-screen flex flex-col lg:flex-row bg-slate-900 overflow-hidden">
        {/* Left Section - Hero & Features (Desktop/Tablet Info Panel) */}
        <div className="hidden md:flex md:w-[45%] lg:w-[50%] xl:w-[55%] relative flex-col justify-between p-8 lg:p-12 xl:p-16 bg-gradient-to-br from-[#1C4D8D] via-[#153D70] to-[#0D2545] border-r border-white/10 overflow-y-auto minimal-scrollbar z-10 animate-fade-in">
          {/* Subtle decorative mesh background and floating shapes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-white/[0.03] blur-[80px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/[0.08] blur-[120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03)_0%,transparent_60%)]" />
          </div>

          {/* Header/Branding */}
          <div className="flex items-center space-x-3 mb-12 relative z-20">
            <img
              src="/mainLogo.webp"
              alt="URView Logo"
              className="h-10 w-auto object-contain hover:scale-105 transition-transform duration-300"
            />
            <span
              className={`text-2xl font-bold tracking-wider text-white ${leagueSpartan.className}`}
            >
              URView
            </span>
          </div>

          {/* Hero Content */}
          <div className="my-auto max-w-2xl space-y-8 relative z-20">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold tracking-wider uppercase text-blue-200">
                <span>Secure Administration</span>
              </div>
              <h1
                className={`text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight ${leagueSpartan.className}`}
              >
                URView Admin Platform
              </h1>
              <p className="text-blue-100/90 text-sm font-semibold tracking-wider uppercase">
                Enterprise Content & Streaming Management
              </p>
              <p className="text-slate-300 leading-relaxed text-base lg:text-lg font-light">
                Manage your OTT streaming platform from a single, centralized dashboard. Monitor
                users, manage video content, oversee subscriptions, track analytics, configure
                platform settings, and streamline media operations through an intuitive
                administration interface.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              {/* Feature 1 */}
              <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 group-hover:scale-110 transition-transform duration-300">
                  <LuFilm className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Content Management</h4>
                  <p className="text-xs text-slate-300/80 mt-1">
                    Publish, edit, and organize videos seamlessly.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 group-hover:scale-110 transition-transform duration-300">
                  <LuTv className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Video & Media Library</h4>
                  <p className="text-xs text-slate-300/80 mt-1">
                    Manage video hosting, players, and uploads.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 group-hover:scale-110 transition-transform duration-300">
                  <LuUsers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">User & Role Management</h4>
                  <p className="text-xs text-slate-300/80 mt-1">
                    Control access, staff roles, and subscriptions.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 group-hover:scale-110 transition-transform duration-300">
                  <LuCreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Subscription Management</h4>
                  <p className="text-xs text-slate-300/80 mt-1">
                    Oversee pricing plans, payments, and invoices.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 group-hover:scale-110 transition-transform duration-300">
                  <LuChartBar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Analytics & Reporting</h4>
                  <p className="text-xs text-slate-300/80 mt-1">
                    Track content performance and platform health.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 group-hover:scale-110 transition-transform duration-300">
                  <LuShield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Secure Administration</h4>
                  <p className="text-xs text-slate-300/80 mt-1">
                    Deploy multi-factor authentication and auditing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 mt-12 border-t border-white/10 relative z-20">
            <p className="text-xs text-blue-200/50 uppercase tracking-widest font-semibold">
              Secure Enterprise Administration Portal
            </p>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 py-4 md:p-10 md:py-6 lg:p-8 lg:py-6 xl:p-16 xl:py-8 relative bg-slate-50 z-10 overflow-y-auto">
          {/* Subtle Grid and Background Effects for Light/Neutral Section */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
            {/* Subtle light grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-70" />
          </div>

          {/* Home > Login Breadcrumb */}
          <div className="absolute top-6 left-6 text-sm font-medium text-slate-400 z-20">
            <span>Home </span>
            <span className="text-slate-300 mx-1.5">&gt;</span>
            <span className="text-slate-600">Login</span>
          </div>

          {/* Branding for Mobile (Logo + Platform Name) */}
          <div className="flex items-center space-x-3 mb-8 md:hidden relative z-20">
            <img src="/mainLogo.webp" alt="URView Logo" className="h-8 w-auto object-contain" />
            <span
              className={`text-xl font-bold tracking-wider text-slate-800 ${leagueSpartan.className}`}
            >
              URView
            </span>
          </div>

          {/* Login Card Panel */}
          <div className="relative w-full max-w-[440px] bg-white/80 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-5 lg:p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] z-10 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-all duration-500 animate-slide-up">
            <div className="space-y-5">
              {/* Card Header & Branding */}
              <div className="flex flex-col space-y-2.5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm">
                    <img
                      src="/mainLogo.webp"
                      alt="URView Logo"
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold text-slate-800 tracking-wide ${leagueSpartan.className}`}
                    >
                      URView
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                      Admin Panel
                    </p>
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <h2
                    className={`text-2xl font-extrabold text-slate-900 tracking-tight ${leagueSpartan.className}`}
                  >
                    Welcome Back
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">
                    Sign in to continue to the URView Admin Dashboard.
                  </p>
                </div>
              </div>

              {/* Login Form Render */}
              {mounted && <LoginForm />}
            </div>
          </div>

          {/* Footer for Mobile Viewports */}
          <div className="mt-8 md:hidden text-center z-10">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Secure Enterprise Administration Portal
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
