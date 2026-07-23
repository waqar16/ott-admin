'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiList,
  FiMessageSquare,
} from 'react-icons/fi'
import { BiDollar, BiMovie, BiTv } from 'react-icons/bi'
import { GrPlan } from 'react-icons/gr'
import { usePlatformSettings } from '@/lib/platformSettings'
import { leagueSpartan } from '@/fonts/fonts'

// Replacing Bs icon imports with standard react-icons ones to prevent import issues
import {
  BsSubscript as BsSubscriptIcon,
  BsCash as BsCashIcon,
  BsQuestionDiamondFill as BsQuestionIcon,
  BsFileBarGraph as BsAnalyticsIcon,
} from 'react-icons/bs'

import SidebarTooltip from './SidebarTooltip'

interface AdminSidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export default function AdminSidebar({ collapsed, setCollapsed }: AdminSidebarProps) {
  const { settings } = usePlatformSettings()
  const pathname = usePathname()

  // Dropdown states
  const [openUsers, setOpenUsers] = useState(false)
  const [openFaqs, setOpenFaqs] = useState(false)
  const [openContent, setOpenContent] = useState(false)
  const [openPayments, setOpenPayments] = useState(false)

  const isActive = (path: string) => pathname === path
  const isSubActive = (paths: string[]) => paths.includes(pathname)

  // Auto-expand appropriate dropdowns based on the active path on mount
  useEffect(() => {
    if (pathname.startsWith('/admin/users')) setOpenUsers(true)
    if (pathname.startsWith('/admin/faqs')) setOpenFaqs(true)
    if (
      pathname.startsWith('/admin/movie') ||
      pathname.startsWith('/admin/series') ||
      pathname.startsWith('/admin/trailer')
    ) {
      setOpenContent(true)
    }
    if (pathname.startsWith('/admin/payment') || pathname.startsWith('/admin/subscriptions')) {
      setOpenPayments(true)
    }
  }, [pathname])

  const handleDropdownClick = (openState: boolean, setOpenState: (val: boolean) => void) => {
    if (collapsed) {
      setCollapsed(false)
      setOpenState(true)
    } else {
      setOpenState(!openState)
    }
  }

  const linkBase =
    'group relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200'
  const activeClass =
    'bg-blue-50 dark:bg-blue-950/30 text-[var(--main-color)] dark:text-blue-400 font-semibold border-r-2 border-[var(--main-color)]'
  const inactiveClass =
    'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900 hover:text-slate-900 dark:hover:text-white'
  const subLinkClass =
    'flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition-colors duration-150'

  return (
    <aside
      className={`h-screen bg-white dark:bg-neutral-950 border-r border-slate-200/80 dark:border-neutral-900/80 text-slate-700 dark:text-neutral-300 transition-all duration-300 z-40 fixed left-0 top-0 flex flex-col justify-between select-none ${
        collapsed ? 'w-[76px]' : 'w-[260px]'
      }`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto minimal-scrollbar">
        {/* Header/Logo */}
        <div className="h-16 flex items-center justify-center border-b border-slate-200/80 dark:border-neutral-900/80 px-4">
          <div className="flex items-center space-x-2.5">
            <img
              src="/mainLogo.webp"
              alt="Logo"
              className="w-8 h-auto object-contain hover:scale-105 transition-transform"
            />
            {!collapsed && (
              <span
                className={`text-lg font-bold text-slate-800 dark:text-white tracking-wider ${leagueSpartan.className} animate-fade-in`}
              >
                Admin Panel
              </span>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5 flex flex-col items-center">
          {/* Overview Link */}
          <SidebarTooltip content="Overview" disabled={!collapsed}>
            <Link
              href="/admin"
              className={`${linkBase} ${isActive('/admin') ? activeClass : inactiveClass}`}
            >
              <FiHome className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">Overview</span>}
            </Link>
          </SidebarTooltip>

          {/* Analytics Link */}
          <SidebarTooltip content="Analytics" disabled={!collapsed}>
            <Link
              href="/admin/analytics"
              className={`${linkBase} ${isActive('/admin/analytics') ? activeClass : inactiveClass}`}
            >
              <BsAnalyticsIcon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">Analytics</span>}
            </Link>
          </SidebarTooltip>

          {/* Creators Link */}
          <SidebarTooltip content="Creators" disabled={!collapsed}>
            <Link
              href="/admin/creator"
              className={`${linkBase} ${isActive('/admin/creator') ? activeClass : inactiveClass}`}
            >
              <FiUsers className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">Creators</span>}
            </Link>
          </SidebarTooltip>

          {/* Creators Revenue Link */}
          <SidebarTooltip content="Revenue" disabled={!collapsed}>
            <Link
              href="/admin/revenue"
              className={`${linkBase} ${isActive('/admin/revenue') ? activeClass : inactiveClass}`}
            >
              <BiDollar className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">Revenue</span>}
            </Link>
          </SidebarTooltip>

          {/* Users Dropdown */}
          <div className="w-full">
            <SidebarTooltip content="Users" disabled={!collapsed}>
              <button
                onClick={() => handleDropdownClick(openUsers, setOpenUsers)}
                className={`${linkBase} ${
                  isSubActive(['/admin/users']) && !collapsed
                    ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                    : inactiveClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiUsers className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span className="truncate">Users</span>}
                </div>
                {!collapsed &&
                  (openUsers ? (
                    <FiChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <FiChevronDown className="w-3.5 h-3.5" />
                  ))}
              </button>
            </SidebarTooltip>
            {openUsers && !collapsed && (
              <div className="pl-6 mt-1 flex flex-col space-y-1 border-l border-slate-200 dark:border-neutral-900 ml-5">
                <Link
                  href="/admin/users"
                  className={`${subLinkClass} ${isActive('/admin/users') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  <FiList className="w-3.5 h-3.5" />
                  <span>Manage Users</span>
                </Link>
              </div>
            )}
          </div>

          {/* Faqs Dropdown */}
          <div className="w-full">
            <SidebarTooltip content="FAQs" disabled={!collapsed}>
              <button
                onClick={() => handleDropdownClick(openFaqs, setOpenFaqs)}
                className={`${linkBase} ${
                  isSubActive(['/admin/faqs']) && !collapsed
                    ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                    : inactiveClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <BsQuestionIcon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span className="truncate">FAQs</span>}
                </div>
                {!collapsed &&
                  (openFaqs ? (
                    <FiChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <FiChevronDown className="w-3.5 h-3.5" />
                  ))}
              </button>
            </SidebarTooltip>
            {openFaqs && !collapsed && (
              <div className="pl-6 mt-1 flex flex-col space-y-1 border-l border-slate-200 dark:border-neutral-900 ml-5">
                <Link
                  href="/admin/faqs"
                  className={`${subLinkClass} ${isActive('/admin/faqs') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  <FiMessageSquare className="w-3.5 h-3.5" />
                  <span>Manage FAQs</span>
                </Link>
              </div>
            )}
          </div>

          {/* Content Dropdown */}
          <div className="w-full">
            <SidebarTooltip content="Content" disabled={!collapsed}>
              <button
                onClick={() => handleDropdownClick(openContent, setOpenContent)}
                className={`${linkBase} ${
                  isSubActive([
                    '/admin/movie-management',
                    '/admin/series-management',
                    '/admin/trailer-management',
                  ]) && !collapsed
                    ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                    : inactiveClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiFileText className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span className="truncate">Content</span>}
                </div>
                {!collapsed &&
                  (openContent ? (
                    <FiChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <FiChevronDown className="w-3.5 h-3.5" />
                  ))}
              </button>
            </SidebarTooltip>
            {openContent && !collapsed && (
              <div className="pl-6 mt-1 flex flex-col space-y-1 border-l border-slate-200 dark:border-neutral-900 ml-5">
                <Link
                  href="/admin/movie-management"
                  className={`${subLinkClass} ${isActive('/admin/movie-management') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  <BiMovie className="w-3.5 h-3.5" />
                  <span>Movies</span>
                </Link>
                <Link
                  href="/admin/series-management"
                  className={`${subLinkClass} ${isActive('/admin/series-management') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  <BiTv className="w-3.5 h-3.5" />
                  <span>Series</span>
                </Link>
                <Link
                  href="/admin/trailer-management"
                  className={`${subLinkClass} ${isActive('/admin/trailer-management') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  <BiTv className="w-3.5 h-3.5" />
                  <span>Trailers</span>
                </Link>
              </div>
            )}
          </div>

          {/* Payment Dropdown */}
          <div className="w-full">
            <SidebarTooltip content="Payment" disabled={!collapsed}>
              <button
                onClick={() => handleDropdownClick(openPayments, setOpenPayments)}
                className={`${linkBase} ${
                  isSubActive(['/admin/payment-plans', '/admin/subscriptions']) && !collapsed
                    ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                    : inactiveClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <BsCashIcon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span className="truncate">Payment</span>}
                </div>
                {!collapsed &&
                  (openPayments ? (
                    <FiChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <FiChevronDown className="w-3.5 h-3.5" />
                  ))}
              </button>
            </SidebarTooltip>
            {openPayments && !collapsed && (
              <div className="pl-6 mt-1 flex flex-col space-y-1 border-l border-slate-200 dark:border-neutral-900 ml-5">
                <Link
                  href="/admin/payment-plans"
                  className={`${subLinkClass} ${isActive('/admin/payment-plans') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  <BsSubscriptIcon className="w-3.5 h-3.5" />
                  <span>Payment Plans</span>
                </Link>
                <Link
                  href="/admin/subscriptions"
                  className={`${subLinkClass} ${isActive('/admin/subscriptions') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  <GrPlan className="w-3.5 h-3.5" />
                  <span>Subscriptions</span>
                </Link>
              </div>
            )}
          </div>

          {/* Settings Link */}
          <SidebarTooltip content="Settings" disabled={!collapsed}>
            <Link
              href="/admin/settings"
              className={`${linkBase} ${isActive('/admin/settings') ? activeClass : inactiveClass}`}
            >
              <FiSettings className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">Settings</span>}
            </Link>
          </SidebarTooltip>
        </nav>
      </div>

      {/* Version/Build Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200/80 dark:border-neutral-900/80 text-center text-[10px] text-slate-400 dark:text-neutral-600">
          <span>v1.0.0 &bull; URView Admin</span>
        </div>
      )}
    </aside>
  )
}
