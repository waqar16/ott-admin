
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
import { BiDollar, BiFolder, BiMovie, BiPlus, BiTv } from "react-icons/bi";
import { GrAnalytics, GrDocumentCloud, GrPlan } from "react-icons/gr";
import { BsCash, BsFileBarGraph, BsPersonFillGear, BsQuestionDiamondFill, BsSubscript } from "react-icons/bs";
import FullScreenLoader from "../Loader/FullScreenLoader";
import { usePlatformSettings } from "@/lib/platformSettings";
 import { titan_one,cinzel, varela_round } from "@/app/layout";
import { leagueSpartan } from "@/fonts/fonts";
import FullScreenRedirectLoader from "../Loader/FullScreenRedirectLoader";
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
    "w-11/12 flex items-center text-sm gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition";
  const activeClass = "bg-[var(--main-color)] text-white  ";

  const isActive = (path: string) => pathname === path;
 useEffect(() => {
  // Route change completed
  setIsNavigating(false);
}, [pathname]);

  const brandName = settings.site_name || "UR VIEW";
  const logoUrl = settings.logo_url;

  return (
    <div className={`  w-[260px] bg-black h-screen text-gray-200 fixed left-0 top-0 shadow-xl overflow-y-auto   ${varela_round.className}`}>
      
      {isNavigating && <FullScreenRedirectLoader message="loading"/>}
      <div className="py-5 text-center border-b border-gray-700">
        <div className="flex flex-row items-center gap-2 w-full justify-center">
           
          <img src="/mainLogo.webp" className="w-8 h-auto mr-2"/><h1 className={`text-xl font-bold text-white ${leagueSpartan.className}`}> Admin Panel</h1>
        </div>
      </div>
       

      <div className="mt-4 flex flex-col items-center space-y-2">

 
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
        <Link
onClick={() => {
  if (pathname !== "/admin/creator") {
    setIsNavigating(true);
  }
}}          href={"/admin/creator"}
          className={`${linkBase} ${isActive("/admin/creator") ? activeClass : ""}`}
        >
          <FiUsers size={18} /> Creators
        </Link>
          <Link
onClick={() => {
  if (pathname !== "/admin/revenue") {
    setIsNavigating(true);
  }
}}          href={"/admin/revenue"}
          className={`${linkBase} ${isActive("/admin/revenue") ? activeClass : ""}`}
        >
          <BiDollar size={18} />Creators  Revenue
        </Link>
        {/* Users dropdown */}
        <div className="w-11/12">
          <button
            onClick={() => {
              setOpenUsers(!openUsers)
              setOpenShows(false)
              setOpenPayments(false)
              setOpenTemplates(false)
              setOpenFaqs(false)
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
                className={`${linkBase} ${isActive("/admin/users") ? activeClass : ""} text-xs`}
              >
                <FiList size={16} />Manage Users
              </Link>
 {/* <Link
onClick={() => {
  if (pathname !== "/admin/user-profiles") {
    setIsNavigating(true);
  }
}}                href="/admin/user-profiles"
                className={`${linkBase} ${isActive("/admin/user-profiles") ? activeClass : ""}  text-xs`}
              >
                <BsPersonFillGear size={16} /> Manage User Profiles
              </Link> */}
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
 <div className="w-11/12">
          <button
            onClick={() => {
              setOpenFaqs(!openFaqs)
              setOpenUsers(false)
              setOpenShows(false)
              setOpenTemplates(false)
              setOpenPayments(false)
            }}
            className={`${linkBase} w-full justify-between`}
          >
            <span className="flex items-center gap-3">
              <BsQuestionDiamondFill size={18} /> Faqs
            </span>
            {openFaqs ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {openFaqs && (
            <div className="ml-4 mt-1 flex flex-col space-y-1">
              <Link
onClick={() => {
  if (pathname !== "/admin/faqs") {
    setIsNavigating(true);
  }
}}                href={"/admin/faqs"}
                className={`${linkBase} ${isActive("/admin/faqs") ? activeClass : ""}  text-xs`}
              >
                <FiMessageSquare size={16} />Manage FAQS
              </Link>
  

            </div>
          )}
        </div>
        {/* Templates dropdown */}
        <div className="w-11/12">
          <button
            onClick={() => {
              setOpenPayments(false)
              setOpenUsers(false)
              setOpenFaqs(false)
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
                className={`${linkBase} ${isActive("/admin/movie-management") ? activeClass : ""}  text-xs`}
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
                    className={`${linkBase} ${isActive("/admin/series-management") ? activeClass : ""}  text-xs`}
                  >
                    <BiTv size={16} />   Series
                  </Link>
              {/* <Link
onClick={() => {
  if (pathname !== "/admin/documentary-management") {
    setIsNavigating(true);
  }
}}                href="/admin/documentary-management"

                className={`${linkBase} ${isActive("/admin/documentary-management") ? activeClass : ""}  text-xs`}
              >
                <GrDocumentCloud size={16} /> Documentary
              </Link> */}
              <Link
onClick={() => {
  if (pathname !== "/admin/trailer-management") {
    setIsNavigating(true);
  }
}}                href="/admin/trailer-management"
                className={`${linkBase} ${isActive("/admin/trailer-management") ? activeClass : ""}  text-xs`}
              >
                <BiTv size={16} /> Trailers
              </Link>

              {/* <Link
onClick={() => {
  if (pathname !== "/admin/demo-content-management") {
    setIsNavigating(true);
  }
}}                href="/admin/demo-content-management"
                className={`${linkBase} ${isActive("/admin/demo-content-management") ? activeClass : ""}  text-xs`}
              >
                <FiList size={16} /> Demo Contents
              </Link> */}
            </div>
          )}
        </div>
 <div className="w-11/12">
          <button
            onClick={() => {
              setOpenPayments(!openPayments)
              setOpenUsers(false)
              setOpenFaqs(false)
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
                className={`${linkBase} ${isActive("/admin/payment-plans") ? activeClass : ""}  text-xs`}
              >
                <BsSubscript size={16} />   Payment Plans
              </Link>

              <Link
onClick={() => {
  if (pathname !== "/admin/subscriptions") {
    setIsNavigating(true);
  }
}}                href="/admin/subscriptions"
                className={`${linkBase} ${isActive("/admin/subscriptions") ? activeClass : ""}  text-xs`}
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
