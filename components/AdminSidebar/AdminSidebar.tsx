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
  FiUserCheck,
  FiLoader,
} from 'react-icons/fi'
import { BiDollar, BiMovie, BiTv } from 'react-icons/bi'
import { GrPlan } from 'react-icons/gr'
import { usePlatformSettings } from '@/lib/platformSettings'
import { leagueSpartan } from '@/fonts/fonts'
import { useNavigationLoading } from '@/components/Navigation/NavigationLoadingContext'

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
  const { isPending, startNavigation } = useNavigationLoading()

  // Dropdown states
  const [openUsers, setOpenUsers] = useState(false)
  const [openFaqs, setOpenFaqs] = useState(false)
  const [openContent, setOpenContent] = useState(false)
  const [openPayments, setOpenPayments] = useState(false)

  const isActive = (path: string) => pathname === path
  const isSubActive = (paths: string[]) => paths.includes(pathname)

  // Auto-expand appropriate dropdowns based on the active path on mount
  useEffect(() => {
    if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/pre-signup')) setOpenUsers(true)
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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isActive(href)) {
      return
    }
    if (isPending(href)) {
      e.preventDefault()
      return
    }
    startNavigation(href)
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
      className={`h-screen bg-white dark:bg-neutral-950 border-r border-slate-200/80 dark:border-neutral-900/80 text-slate-700 dark:text-neutral-300 transition-all duration-300 z-40 fixed left-0 top-0 flex flex-col justify-between select-none ${collapsed ? 'w-[76px]' : 'w-[260px]'
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
              onClick={(e) => handleLinkClick(e, '/admin')}
              className={`${linkBase} ${isPending('/admin')
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                  : isActive('/admin')
                    ? activeClass
                    : inactiveClass
                }`}
              aria-current={isActive('/admin') ? 'page' : undefined}
            >
              {isPending('/admin') && collapsed ? (
                <FiLoader className="w-[18px] h-[18px] flex-shrink-0 animate-spin text-[var(--main-color)] dark:text-blue-400" />
              ) : (
                <FiHome className={`w-[18px] h-[18px] flex-shrink-0 ${isPending('/admin') ? 'opacity-70' : ''}`} />
              )}
              {!collapsed && (
                <>
                  <span className="truncate">Overview</span>
                  {isPending('/admin') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3.5 h-3.5 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </>
              )}
            </Link>
          </SidebarTooltip>

          {/* Analytics Link */}
          <SidebarTooltip content="Analytics" disabled={!collapsed}>
            <Link
              href="/admin/analytics"
              onClick={(e) => handleLinkClick(e, '/admin/analytics')}
              className={`${linkBase} ${isPending('/admin/analytics')
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                  : isActive('/admin/analytics')
                    ? activeClass
                    : inactiveClass
                }`}
              aria-current={isActive('/admin/analytics') ? 'page' : undefined}
            >
              {isPending('/admin/analytics') && collapsed ? (
                <FiLoader className="w-[18px] h-[18px] flex-shrink-0 animate-spin text-[var(--main-color)] dark:text-blue-400" />
              ) : (
                <BsAnalyticsIcon className={`w-[18px] h-[18px] flex-shrink-0 ${isPending('/admin/analytics') ? 'opacity-70' : ''}`} />
              )}
              {!collapsed && (
                <>
                  <span className="truncate">Analytics</span>
                  {isPending('/admin/analytics') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3.5 h-3.5 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </>
              )}
            </Link>
          </SidebarTooltip>

          {/* Creators Link */}
          <SidebarTooltip content="Creators" disabled={!collapsed}>
            <Link
              href="/admin/creator"
              onClick={(e) => handleLinkClick(e, '/admin/creator')}
              className={`${linkBase} ${isPending('/admin/creator')
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                  : isActive('/admin/creator')
                    ? activeClass
                    : inactiveClass
                }`}
              aria-current={isActive('/admin/creator') ? 'page' : undefined}
            >
              {isPending('/admin/creator') && collapsed ? (
                <FiLoader className="w-[18px] h-[18px] flex-shrink-0 animate-spin text-[var(--main-color)] dark:text-blue-400" />
              ) : (
                <FiUsers className={`w-[18px] h-[18px] flex-shrink-0 ${isPending('/admin/creator') ? 'opacity-70' : ''}`} />
              )}
              {!collapsed && (
                <>
                  <span className="truncate">Creators</span>
                  {isPending('/admin/creator') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3.5 h-3.5 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </>
              )}
            </Link>
          </SidebarTooltip>

          {/* Creators Revenue Link */}
          <SidebarTooltip content="Revenue" disabled={!collapsed}>
            <Link
              href="/admin/revenue"
              onClick={(e) => handleLinkClick(e, '/admin/revenue')}
              className={`${linkBase} ${isPending('/admin/revenue')
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                  : isActive('/admin/revenue')
                    ? activeClass
                    : inactiveClass
                }`}
              aria-current={isActive('/admin/revenue') ? 'page' : undefined}
            >
              {isPending('/admin/revenue') && collapsed ? (
                <FiLoader className="w-[18px] h-[18px] flex-shrink-0 animate-spin text-[var(--main-color)] dark:text-blue-400" />
              ) : (
                <BiDollar className={`w-[18px] h-[18px] flex-shrink-0 ${isPending('/admin/revenue') ? 'opacity-70' : ''}`} />
              )}
              {!collapsed && (
                <>
                  <span className="truncate">Revenue</span>
                  {isPending('/admin/revenue') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3.5 h-3.5 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </>
              )}
            </Link>
          </SidebarTooltip>

          {/* Users Dropdown */}
          <div className="w-full">
            <SidebarTooltip content="Users" disabled={!collapsed}>
              <button
                type="button"
                onClick={() => handleDropdownClick(openUsers, setOpenUsers)}
                className={`${linkBase} ${isSubActive(['/admin/users', '/admin/pre-signup']) && !collapsed
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
                  onClick={(e) => handleLinkClick(e, '/admin/users')}
                  className={`${subLinkClass} ${isPending('/admin/users')
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                      : isActive('/admin/users')
                        ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                        : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  aria-current={isActive('/admin/users') ? 'page' : undefined}
                >
                  <FiList className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Manage Users</span>
                  {isPending('/admin/users') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3 h-3 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/pre-signup"
                  onClick={(e) => handleLinkClick(e, '/admin/pre-signup')}
                  className={`${subLinkClass} ${isPending('/admin/pre-signup')
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                      : isActive('/admin/pre-signup')
                        ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                        : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  aria-current={isActive('/admin/pre-signup') ? 'page' : undefined}
                >
                  <FiUserCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Pre-Signup & Waitlist</span>
                  {isPending('/admin/pre-signup') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3 h-3 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Faqs Dropdown */}
          <div className="w-full">
            <SidebarTooltip content="FAQs" disabled={!collapsed}>
              <button
                type="button"
                onClick={() => handleDropdownClick(openFaqs, setOpenFaqs)}
                className={`${linkBase} ${isSubActive(['/admin/faqs']) && !collapsed
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
                  onClick={(e) => handleLinkClick(e, '/admin/faqs')}
                  className={`${subLinkClass} ${isPending('/admin/faqs')
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                      : isActive('/admin/faqs')
                        ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                        : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  aria-current={isActive('/admin/faqs') ? 'page' : undefined}
                >
                  <FiMessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Manage FAQs</span>
                  {isPending('/admin/faqs') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3 h-3 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Content Dropdown */}
          <div className="w-full">
            <SidebarTooltip content="Content" disabled={!collapsed}>
              <button
                type="button"
                onClick={() => handleDropdownClick(openContent, setOpenContent)}
                className={`${linkBase} ${isSubActive([
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
                  onClick={(e) => handleLinkClick(e, '/admin/movie-management')}
                  className={`${subLinkClass} ${isPending('/admin/movie-management')
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                      : isActive('/admin/movie-management')
                        ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                        : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  aria-current={isActive('/admin/movie-management') ? 'page' : undefined}
                >
                  <BiMovie className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Movies</span>
                  {isPending('/admin/movie-management') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3 h-3 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/series-management"
                  onClick={(e) => handleLinkClick(e, '/admin/series-management')}
                  className={`${subLinkClass} ${isPending('/admin/series-management')
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                      : isActive('/admin/series-management')
                        ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                        : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  aria-current={isActive('/admin/series-management') ? 'page' : undefined}
                >
                  <BiTv className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Series</span>
                  {isPending('/admin/series-management') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3 h-3 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/trailer-management"
                  onClick={(e) => handleLinkClick(e, '/admin/trailer-management')}
                  className={`${subLinkClass} ${isPending('/admin/trailer-management')
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                      : isActive('/admin/trailer-management')
                        ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                        : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  aria-current={isActive('/admin/trailer-management') ? 'page' : undefined}
                >
                  <BiTv className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Trailers</span>
                  {isPending('/admin/trailer-management') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3 h-3 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Payment Dropdown */}
          <div className="w-full">
            <SidebarTooltip content="Payment" disabled={!collapsed}>
              <button
                type="button"
                onClick={() => handleDropdownClick(openPayments, setOpenPayments)}
                className={`${linkBase} ${isSubActive(['/admin/payment-plans', '/admin/subscriptions']) && !collapsed
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
                  onClick={(e) => handleLinkClick(e, '/admin/payment-plans')}
                  className={`${subLinkClass} ${isPending('/admin/payment-plans')
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                      : isActive('/admin/payment-plans')
                        ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                        : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  aria-current={isActive('/admin/payment-plans') ? 'page' : undefined}
                >
                  <BsSubscriptIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Payment Plans</span>
                  {isPending('/admin/payment-plans') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3 h-3 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/subscriptions"
                  onClick={(e) => handleLinkClick(e, '/admin/subscriptions')}
                  className={`${subLinkClass} ${isPending('/admin/subscriptions')
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                      : isActive('/admin/subscriptions')
                        ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                        : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  aria-current={isActive('/admin/subscriptions') ? 'page' : undefined}
                >
                  <GrPlan className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Subscriptions</span>
                  {isPending('/admin/subscriptions') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3 h-3 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Settings Link */}
          <SidebarTooltip content="Settings" disabled={!collapsed}>
            <Link
              href="/admin/settings"
              onClick={(e) => handleLinkClick(e, '/admin/settings')}
              className={`${linkBase} ${isPending('/admin/settings')
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 text-[var(--main-color)] dark:text-blue-400 font-semibold ring-1 ring-[var(--main-color)]/30 shadow-xs'
                  : isActive('/admin/settings')
                    ? activeClass
                    : inactiveClass
                }`}
              aria-current={isActive('/admin/settings') ? 'page' : undefined}
            >
              {isPending('/admin/settings') && collapsed ? (
                <FiLoader className="w-[18px] h-[18px] flex-shrink-0 animate-spin text-[var(--main-color)] dark:text-blue-400" />
              ) : (
                <FiSettings className={`w-[18px] h-[18px] flex-shrink-0 ${isPending('/admin/settings') ? 'opacity-70' : ''}`} />
              )}
              {!collapsed && (
                <>
                  <span className="truncate">Settings</span>
                  {isPending('/admin/settings') && (
                    <span className="ml-auto flex-shrink-0 flex items-center" aria-label="Loading">
                      <FiLoader className="w-3.5 h-3.5 animate-spin text-[var(--main-color)] dark:text-blue-400" />
                    </span>
                  )}
                </>
              )}
            </Link>
          </SidebarTooltip>
        </nav>
      </div>

      {/* Version/Build Footer */}
    </aside>
  )
}
