'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiSettings,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiList,
  FiMessageSquare,
} from 'react-icons/fi'
import {
  BsSubscript as BsSubscriptIcon,
  BsCash as BsCashIcon,
  BsQuestionDiamondFill as BsQuestionIcon,
  BsFileBarGraph as BsAnalyticsIcon,
} from 'react-icons/bs'
import { BiMovie, BiTv, BiDollar } from 'react-icons/bi'
import { GrPlan } from 'react-icons/gr'
import { leagueSpartan } from '@/fonts/fonts'

interface MobileAdminNavProps {
  openDrawer: boolean
  setOpenDrawer: (open: boolean) => void
}

export default function MobileAdminNav({ openDrawer, setOpenDrawer }: MobileAdminNavProps) {
  const pathname = usePathname()

  // Sub-dropdown states
  const [openUsers, setOpenUsers] = useState(false)
  const [openFaqs, setOpenFaqs] = useState(false)
  const [openContent, setOpenContent] = useState(false)
  const [openPayments, setOpenPayments] = useState(false)

  const isActive = (path: string) => pathname === path

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (openDrawer) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [openDrawer])

  const linkBase =
    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200'
  const activeClass =
    'bg-blue-50 dark:bg-blue-950/30 text-[var(--main-color)] dark:text-blue-400 font-semibold border-l-4 border-[var(--main-color)]'
  const inactiveClass =
    'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900 hover:text-slate-900 dark:hover:text-white'
  const subLinkClass =
    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs transition-colors duration-150'

  return (
    <>
      {/* Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${
          openDrawer ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setOpenDrawer(false)}
      />

      {/* Drawer Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-neutral-950 border-r border-slate-200 dark:border-neutral-905 text-slate-700 dark:text-neutral-300 z-50 transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          openDrawer ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto minimal-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-neutral-900 h-16">
            <div className="flex items-center gap-2.5">
              <img src="/mainLogo.webp" className="w-7 h-auto" alt="Logo" />
              <span
                className={`text-lg font-bold text-slate-800 dark:text-white tracking-wider ${leagueSpartan.className}`}
              >
                Admin Panel
              </span>
            </div>
            <button
              onClick={() => setOpenDrawer(false)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-lg text-slate-500 dark:text-neutral-400"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {/* Overview */}
            <Link
              href="/admin"
              onClick={() => setOpenDrawer(false)}
              className={`${linkBase} ${isActive('/admin') ? activeClass : inactiveClass}`}
            >
              <FiHome size={18} />
              <span>Overview</span>
            </Link>

            {/* Analytics */}
            <Link
              href="/admin/analytics"
              onClick={() => setOpenDrawer(false)}
              className={`${linkBase} ${isActive('/admin/analytics') ? activeClass : inactiveClass}`}
            >
              <BsAnalyticsIcon size={18} />
              <span>Analytics</span>
            </Link>

            {/* Creators */}
            <Link
              href="/admin/creator"
              onClick={() => setOpenDrawer(false)}
              className={`${linkBase} ${isActive('/admin/creator') ? activeClass : inactiveClass}`}
            >
              <FiUsers size={18} />
              <span>Creators</span>
            </Link>

            {/* Revenue */}
            <Link
              href="/admin/revenue"
              onClick={() => setOpenDrawer(false)}
              className={`${linkBase} ${isActive('/admin/revenue') ? activeClass : inactiveClass}`}
            >
              <BiDollar size={18} />
              <span>Revenue</span>
            </Link>

            {/* Users Dropdown */}
            <div>
              <button
                onClick={() => {
                  setOpenUsers(!openUsers)
                  setOpenContent(false)
                  setOpenPayments(false)
                  setOpenFaqs(false)
                }}
                className={`${linkBase} ${
                  pathname.startsWith('/admin/users')
                    ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                    : inactiveClass
                } justify-between w-full`}
              >
                <span className="flex items-center gap-3">
                  <FiUsers size={18} />
                  <span>Users</span>
                </span>
                {openUsers ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
              {openUsers && (
                <div className="pl-6 mt-1 flex flex-col space-y-1 border-l border-slate-200 dark:border-neutral-900 ml-5">
                  <Link
                    href="/admin/users"
                    onClick={() => setOpenDrawer(false)}
                    className={`${subLinkClass} ${isActive('/admin/users') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    <FiList size={14} />
                    <span>Manage Users</span>
                  </Link>
                </div>
              )}
            </div>

            {/* FAQs Dropdown */}
            <div>
              <button
                onClick={() => {
                  setOpenFaqs(!openFaqs)
                  setOpenUsers(false)
                  setOpenContent(false)
                  setOpenPayments(false)
                }}
                className={`${linkBase} ${
                  pathname.startsWith('/admin/faqs')
                    ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                    : inactiveClass
                } justify-between w-full`}
              >
                <span className="flex items-center gap-3">
                  <BsQuestionIcon size={18} />
                  <span>FAQs</span>
                </span>
                {openFaqs ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
              {openFaqs && (
                <div className="pl-6 mt-1 flex flex-col space-y-1 border-l border-slate-200 dark:border-neutral-900 ml-5">
                  <Link
                    href="/admin/faqs"
                    onClick={() => setOpenDrawer(false)}
                    className={`${subLinkClass} ${isActive('/admin/faqs') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    <FiMessageSquare size={14} />
                    <span>Manage FAQs</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Content Dropdown */}
            <div>
              <button
                onClick={() => {
                  setOpenContent(!openContent)
                  setOpenUsers(false)
                  setOpenPayments(false)
                  setOpenFaqs(false)
                }}
                className={`${linkBase} ${
                  pathname.startsWith('/admin/movie') ||
                  pathname.startsWith('/admin/series') ||
                  pathname.startsWith('/admin/trailer')
                    ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                    : inactiveClass
                } justify-between w-full`}
              >
                <span className="flex items-center gap-3">
                  <FiFileText size={18} />
                  <span>Content</span>
                </span>
                {openContent ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
              {openContent && (
                <div className="pl-6 mt-1 flex flex-col space-y-1 border-l border-slate-200 dark:border-neutral-900 ml-5">
                  <Link
                    href="/admin/movie-management"
                    onClick={() => setOpenDrawer(false)}
                    className={`${subLinkClass} ${isActive('/admin/movie-management') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    <BiMovie size={14} />
                    <span>Movies</span>
                  </Link>
                  <Link
                    href="/admin/series-management"
                    onClick={() => setOpenDrawer(false)}
                    className={`${subLinkClass} ${isActive('/admin/series-management') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    <BiTv size={14} />
                    <span>Series</span>
                  </Link>
                  <Link
                    href="/admin/trailer-management"
                    onClick={() => setOpenDrawer(false)}
                    className={`${subLinkClass} ${isActive('/admin/trailer-management') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    <BiTv size={14} />
                    <span>Trailers</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Payments Dropdown */}
            <div>
              <button
                onClick={() => {
                  setOpenPayments(!openPayments)
                  setOpenUsers(false)
                  setOpenContent(false)
                  setOpenFaqs(false)
                }}
                className={`${linkBase} ${
                  pathname.startsWith('/admin/payment') ||
                  pathname.startsWith('/admin/subscriptions')
                    ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold'
                    : inactiveClass
                } justify-between w-full`}
              >
                <span className="flex items-center gap-3">
                  <BsCashIcon size={18} />
                  <span>Payment</span>
                </span>
                {openPayments ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
              {openPayments && (
                <div className="pl-6 mt-1 flex flex-col space-y-1 border-l border-slate-200 dark:border-neutral-900 ml-5">
                  <Link
                    href="/admin/payment-plans"
                    onClick={() => setOpenDrawer(false)}
                    className={`${subLinkClass} ${isActive('/admin/payment-plans') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    <BsSubscriptIcon size={14} />
                    <span>Payment Plans</span>
                  </Link>
                  <Link
                    href="/admin/subscriptions"
                    onClick={() => setOpenDrawer(false)}
                    className={`${subLinkClass} ${isActive('/admin/subscriptions') ? 'text-[var(--main-color)] dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    <GrPlan size={14} />
                    <span>Subscriptions</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Settings */}
            <Link
              href="/admin/settings"
              onClick={() => setOpenDrawer(false)}
              className={`${linkBase} ${isActive('/admin/settings') ? activeClass : inactiveClass}`}
            >
              <FiSettings size={18} />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Version Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-neutral-900 text-center text-[10px] text-slate-400 dark:text-neutral-600">
          <span>v1.0.0 &bull; URView Admin</span>
        </div>
      </aside>
    </>
  )
}
