
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  FiHome,
  FiUsers,
  FiFileText,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiList,
  FiUserPlus,
  FiMessageSquare
} from "react-icons/fi";
import { BiFolder, BiMovie, BiPlus, BiTv } from "react-icons/bi";
import { GrAnalytics, GrDocumentCloud, GrPlan } from "react-icons/gr";
import { BsCash, BsFileBarGraph, BsPersonFillGear, BsQuestionDiamondFill, BsSubscript } from "react-icons/bs";
import FullScreenLoader from "../Loader/FullScreenLoader";
import { usePlatformSettings } from "@/lib/platformSettings";

export default function AdminSidebar() {
  const { settings } = usePlatformSettings();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const [openUsers, setOpenUsers] = useState(false);
  const [openFaqs, setOpenFaqs] = useState(false);
  const [openPayments, setOpenPayments] = useState(false);
  const [openTemplates, setOpenTemplates] = useState(false);
  const [openShows, setOpenShows] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const linkBase =
    "flex items-center gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--brand-primary)] hover:text-white transition";
  const activeClass = "bg-[var(--brand-primary)] text-white font-semibold";

  const isActive = (path: string) => pathname === path;
 useEffect(() => {
  // Route change completed
  setIsNavigating(false);
}, [pathname]);

  const brandName = settings.site_name || "UR VIEW";
  const logoUrl = settings.logo_url;

  return (
    <div className="pr-2 w-[260px] bg-black h-screen text-gray-200 fixed left-0 top-0 shadow-xl overflow-y-auto border border-r-blue-500 border-l-0 border-y-0">
      
      {isNavigating && <FullScreenLoader/>}
      <div className="py-5 text-center border-b border-gray-700">
        <div className="flex flex-col items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${brandName} logo`}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <span className="p-1 rounded-md bg-[var(--brand-primary)] text-white text-sm font-semibold uppercase tracking-wide">
              {brandName}
            </span>
          )}
          <h1 className="text-xl font-bold text-white">{brandName} Admin Panel</h1>
        </div>
      </div>
       

      <div className="mt-4 flex flex-col space-y-2">

 
        <Link
onClick={() => {
  if (pathname !== "/admin") {
    setIsNavigating(true);
  }
}}          href="/admin"
          className={`${linkBase} ${isActive("/admin") ? activeClass : ""}`}
        >
          <FiHome size={18} /> Overview
        </Link>
        <Link
onClick={() => {
  if (pathname !== "/admin/analytics") {
    setIsNavigating(true);
  }
}}          href="/admin/analytics"
          className={`${linkBase} ${isActive("/admin/analytics") ? activeClass : ""}`}
        >
          <BsFileBarGraph size={18} /> Analytics
        </Link>
        {/* Users dropdown */}
        <div>
          <button
            onClick={() => {
              setOpenUsers(!openUsers)
              setOpenShows(false)
              setOpenPayments(false)
            }}
            className={`${linkBase} w-full justify-between`}
          >
            <span className="flex items-center gap-3">
              <FiUsers size={18} /> Users
            </span>
            {openUsers ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {openUsers && (
            <div className="ml-4 mt-1 flex flex-col space-y-1">
              <Link
onClick={() => {
  if (pathname !== "/admin/users") {
    setIsNavigating(true);
  }
}}                href={"/admin/users"}
                className={`${linkBase} ${isActive("/admin/users") ? activeClass : ""}`}
              >
                <FiList size={16} />Manage Users
              </Link>
 <Link
onClick={() => {
  if (pathname !== "/admin/user-profiles") {
    setIsNavigating(true);
  }
}}                href="/admin/user-profiles"
                className={`${linkBase} ${isActive("/admin/user-profiles") ? activeClass : ""}`}
              >
                <BsPersonFillGear size={16} /> Manage User Profiles
              </Link>
              {/* <Link
onClick={() => {
  if (pathname !== "/admin/settings") {
    setLoading(true);
  }
}}                href="/admin/create-user"
                className={`${linkBase} ${isActive("/admin/create-user") ? "bg-blue-700 text-white" : ""}`}
              >
                <FiUserPlus size={16} />  Add User
              </Link> */}

            </div>
          )}
        </div>
{/* Faqs Dropdown */}
 <div>
          <button
            onClick={() => {
              setOpenFaqs(!openFaqs)
              setOpenUsers(false)
              setOpenShows(false)
              setOpenPayments(false)
            }}
            className={`${linkBase} w-full justify-between`}
          >
            <span className="flex items-center gap-3">
              <BsQuestionDiamondFill size={18} /> Faqs
            </span>
            {openUsers ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {openFaqs && (
            <div className="ml-4 mt-1 flex flex-col space-y-1">
              <Link
onClick={() => {
  if (pathname !== "/admin/faqs") {
    setIsNavigating(true);
  }
}}                href={"/admin/faqs"}
                className={`${linkBase} ${isActive("/admin/faqs") ? activeClass : ""}`}
              >
                <FiMessageSquare size={16} />Manage FAQS
              </Link>
  

            </div>
          )}
        </div>
        {/* Templates dropdown */}
        <div>
          <button
            onClick={() => {
              setOpenPayments(false)
              setOpenUsers(false)
              setOpenTemplates(!openTemplates)}}
            className={`${linkBase} w-full justify-between`}
          >
            <span className="flex items-center gap-3">
              <FiFileText size={18} /> Content
            </span>
            {openTemplates ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {openTemplates && (
            <div className="ml-4 mt-1 flex flex-col space-y-1">
              <Link
onClick={() => {
  if (pathname !== "/admin/movie-management") {
    setIsNavigating(true);
  }
}}                href="/admin/movie-management"
                className={`${linkBase} ${isActive("/admin/movie-management") ? activeClass : ""}`}
              >
                <BiMovie size={16} /> Movies
              </Link>
              {/* <div>
                <button
                  onClick={() => {
                    setOpenUsers(false)
                    setOpenShows(!openShows)
                    setOpenPayments(false)
                  }}
                  className={`${linkBase} w-full justify-between`}
                >
                  <span className="flex items-center gap-3 text-start">
                    <FiList size={16} /> Shows
                  </span>
                  {openShows ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div> */}
              {/* {openShows && (
                <div className="ml-4 mt-1 flex flex-col space-y-1">

                  <Link
onClick={() => {
  if (pathname !== "/admin/settings") {
    setLoading(true);
  }
}}                    href="/admin/series-management"
                    className={`${linkBase} ${isActive("/admin/series-management") ? "bg-blue-700 text-white" : ""}`}
                  >
                    <BiTv size={16} />   Series
                  </Link>
                  <Link
onClick={() => {
  if (pathname !== "/admin/settings") {
    setLoading(true);
  }
}}                    href="/admin/episode-management"
                    className={`${linkBase} ${isActive("/admin/episode-management") ? "bg-blue-700 text-white" : ""}`}
                  >
                    <BiFolder size={16} />   Episode
                  </Link>

                </div>)} */}
                <Link
onClick={() => {
  if (pathname !== "/admin/series-management") {
    setIsNavigating(true);
  }
}}                    href="/admin/series-management"
                    className={`${linkBase} ${isActive("/admin/series-management") ? activeClass : ""}`}
                  >
                    <BiTv size={16} />   Series
                  </Link>
              <Link
onClick={() => {
  if (pathname !== "/admin/documentary-management") {
    setIsNavigating(true);
  }
}}                href="/admin/documentary-management"

                className={`${linkBase} ${isActive("/admin/documentary-management") ? activeClass : ""}`}
              >
                <GrDocumentCloud size={16} /> Documentary
              </Link>
              <Link
onClick={() => {
  if (pathname !== "/admin/trailer-management") {
    setIsNavigating(true);
  }
}}                href="/admin/trailer-management"
                className={`${linkBase} ${isActive("/admin/trailer-management") ? activeClass : ""}`}
              >
                <BiTv size={16} /> Trailers
              </Link>

              <Link
onClick={() => {
  if (pathname !== "/admin/demo-content-management") {
    setIsNavigating(true);
  }
}}                href="/admin/demo-content-management"
                className={`${linkBase} ${isActive("/admin/demo-content-management") ? activeClass : ""}`}
              >
                <FiList size={16} /> Demo Contents
              </Link>
            </div>
          )}
        </div>
 <div>
          <button
            onClick={() => {
              setOpenPayments(!openPayments)
              setOpenUsers(false)
              setOpenShows(false)
              setOpenTemplates(false)
            }}
            className={`${linkBase} w-full justify-between`}
          >
            <span className="flex items-center gap-3">
              <BsCash size={18} /> Payment
            </span>
            {openPayments ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {openPayments && (
            <div className="ml-4 mt-1 flex flex-col space-y-1">
              <Link
onClick={() => {
  if (pathname !== "/admin/payment-plans") {
    setIsNavigating(true);
  }
}}                href={"/admin/payment-plans"}
                className={`${linkBase} ${isActive("/admin/payment-plans") ? activeClass : ""}`}
              >
                <BsSubscript size={16} />   Payment Plans
              </Link>

              <Link
onClick={() => {
  if (pathname !== "/admin/subscriptions") {
    setIsNavigating(true);
  }
}}                href="/admin/subscriptions"
                className={`${linkBase} ${isActive("/admin/subscriptions") ? activeClass : ""}`}
              >
                <GrPlan size={16} /> Subscriptions
              </Link>

            </div>
          )}
        </div>
        {/* Settings */}
        <Link
onClick={() => {
  if (pathname !== "/admin/settings") {
    setIsNavigating(true);
  }
}}          href={`/admin/settings`}
          className={`${linkBase} ${isActive("/admin/settings") ? activeClass : ""}`}
        >
          <FiSettings size={18} /> Settings
        </Link>

      </div>
    </div>
  );
}
