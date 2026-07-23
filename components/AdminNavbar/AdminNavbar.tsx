'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { useTheme } from '@/components/theme/ThemeContext'
import {
  FiSun,
  FiMoon,
  FiMenu,
  FiBell,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiSearch,
  FiChevronRight,
} from 'react-icons/fi'
import { leagueSpartan } from '@/fonts/fonts'

interface AdminNavbarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  setOpenDrawer: (open: boolean) => void
}

export default function AdminNavbar({ collapsed, setCollapsed, setOpenDrawer }: AdminNavbarProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Format pathname segments into clean title text
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Overview'
    const segment = pathname.split('/').pop() || 'Dashboard'
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
  }

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    return segments.map((seg, idx) => {
      const cleanSeg = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
      const url = '/' + segments.slice(0, idx + 1).join('/')
      const isLast = idx === segments.length - 1

      return (
        <React.Fragment key={url}>
          {idx > 0 && (
            <FiChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400 dark:text-neutral-600" />
          )}
          <span
            className={
              isLast
                ? 'text-slate-800 dark:text-slate-200 font-semibold'
                : 'text-slate-500 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-400'
            }
          >
            {cleanSeg}
          </span>
        </React.Fragment>
      )
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-900/80 shadow-sm transition-all duration-300 ${
        collapsed ? 'left-0 md:left-[46px]' : 'left-0 md:left-[240px]'
      }`}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Side: Toggles & Titles */}
        <div className="flex items-center space-x-4">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setOpenDrawer(true)}
            className="p-2 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-lg md:hidden transition"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-2 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-lg transition"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          {/* Page Titles / Breadcrumbs */}
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center text-xs font-medium text-slate-500 dark:text-neutral-500">
              {getBreadcrumbs()}
            </div>
            {/* <h1 className={`text-lg font-bold text-slate-900 dark:text-white leading-tight ${leagueSpartan.className}`}>
              {getPageTitle()}
            </h1> */}
          </div>
        </div>

        {/* Center: Optional UI Search (Search box) */}
        <div className="hidden lg:flex items-center max-w-xs w-full relative">
          <FiSearch className="absolute left-3 w-4 h-4 text-slate-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--main-color)] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-neutral-500 transition"
            readOnly
          />
        </div>

        {/* Right Side: Theme Toggle, Notifications, User Dropdown */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-lg transition-all duration-300 hover:scale-105"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <FiSun className="w-5 h-5 text-amber-500" />
            ) : (
              <FiMoon className="w-5 h-5 text-indigo-600" />
            )}
          </button>

          {/* Notifications button placeholder */}
          <button
            className="p-2 text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-lg transition relative"
            aria-label="Notifications"
          >
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-slate-200 dark:bg-neutral-800" />

          {/* User profile dropdown container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-xl transition"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-sm font-semibold shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || <FiUser className="w-4 h-4" />}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">
                  {user?.role || 'Admin'}
                </span>
              </div>
              <FiChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-900 rounded-xl shadow-lg py-1.5 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-neutral-900">
                  <p className="text-xs text-slate-400 dark:text-neutral-500">Signed in as</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    router.push('/admin/settings')
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-900 text-left transition"
                >
                  <FiUser className="w-4 h-4" />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-left transition"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
