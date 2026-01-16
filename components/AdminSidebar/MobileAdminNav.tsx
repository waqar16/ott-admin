"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiSettings,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiList,
  FiMessageSquare
} from "react-icons/fi";
import { BsFileBarGraph, BsCash, BsPersonFillGear, BsSubscript, BsQuestionDiamondFill } from "react-icons/bs";
import { BiMovie, BiTv } from "react-icons/bi";
import { GrDocumentCloud, GrPlan } from "react-icons/gr";
import { leagueSpartan } from "@/fonts/fonts";
import FullScreenRedirectLoader from "../Loader/FullScreenRedirectLoader";
import {  FiMaximize, FiMinimize } from "react-icons/fi";
 
export default function MobileAdminNav() {
  const pathname = usePathname();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
    const [openUsers, setOpenUsers] = useState(false);
  const [openContent, setOpenContent] = useState(false);
  const [openPayments, setOpenPayments] = useState(false);
  const [openFaqs, setOpenFaqs] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const linkBase =
    "flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-[var(--brand-primary)] hover:text-white rounded-lg transition";

  const isActive = (path: string) => pathname === path;
 React.useEffect(() => {
  // Route change completed
  setIsNavigating(false);
}, [pathname]);

React.useEffect(() => {
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);

  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  };
}, []);
const enterFullscreen = () => {
  document.documentElement.requestFullscreen();
};

const exitFullscreen = () => {
  document.exitFullscreen();
};

  // Sub-dropdown states

 useEffect(() => {
  if (openDrawer) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}, [openDrawer]);

  return (
    <>
    {isNavigating && <FullScreenRedirectLoader message="loading"/>}
      {/* TOP MOBILE BAR */}
      <div className={`md:hidden fixed top-0 left-0 w-full bg-black text-white flex items-center justify-between px-4 py-3 border-b border-gray-700 z-50`}>
        <div className="flex flex-row items-center gap-2">
          <img src="/mainLogo.webp" className="w-7 h-auto" />
          <span className={` ${leagueSpartan.className} font-bold mt-1`}>Admin Panel</span>
        </div>
        <div className="flex flex-row items-center justify-end space-x-2">
          <button
  onClick={isFullscreen ? exitFullscreen : enterFullscreen}
  className="p-2 text-white"
>
  {isFullscreen ? (
    <FiMinimize size={22} />   // Exit fullscreen icon
  ) : (
    <FiMaximize size={22} />   // Enter fullscreen icon
  )}
</button>

        <button onClick={() => setOpenDrawer(true)}>
          <FiMenu size={22} />
        </button>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity ${openDrawer ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setOpenDrawer(false)}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-black text-white z-50 transform transition-transform duration-300 ${openDrawer ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <img src="/mainLogo.webp" className="w-7 h-auto" />
            <span className="font-semibold">Admin Panel</span>
          </div>
          <button onClick={() => setOpenDrawer(false)}>
            <FiX size={22} />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-2">

          <Link href="/admin" onClick={() => {
            
             if (pathname !== "/admin") {
    setIsNavigating(true);
  }
            setOpenDrawer(false)}} className={`${linkBase} ${isActive("/admin") ? "bg-[var(--brand-primary)]" : ""}`}>
            <FiHome size={18} /> Overview
          </Link>

          <Link href="/admin/analytics" onClick={() => {setOpenDrawer(false)
if (pathname !== "/admin/analytics") {
    setIsNavigating(true);
  }

          }} className={`${linkBase} ${isActive("/admin/analytics") ? "bg-[var(--brand-primary)]" : ""}`}>
            <BsFileBarGraph size={18} /> Analytics
          </Link>

          {/* Users Dropdown */}
          <div>
            <button
              onClick={() => { setOpenUsers(!openUsers); setOpenContent(false); setOpenPayments(false); setOpenFaqs(false); }}
              className={`${linkBase} justify-between w-full`}
            >
              <span className="flex items-center gap-3">
                <FiUsers size={18} /> Users
              </span>
              {openUsers ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {openUsers && (
              <div className="ml-4 mt-1 flex flex-col space-y-1">
                <Link href="/admin/users" onClick={() => {setOpenDrawer(false)
 
  if (pathname !== "/admin/users") {
    setIsNavigating(true);
  }
 

                }} className={`${linkBase} text-xs ${isActive("/admin/users") ? "bg-[var(--brand-primary)]" : ""}`}>
                  <FiList size={16} /> Manage Users
                </Link>
                <Link href="/admin/user-profiles" onClick={() => {setOpenDrawer(false)

  if (pathname !== "/admin/profiles") {
    setIsNavigating(true);
  } 

                }} className={`${linkBase} text-xs ${isActive("/admin/user-profiles") ? "bg-[var(--brand-primary)]" : ""}`}>
                  <BsPersonFillGear size={16} /> Manage User Profiles
                </Link>
              </div>
            )}
          </div>

          {/* FAQs Dropdown */}
          <div>
            <button
              onClick={() => { setOpenFaqs(!openFaqs); setOpenUsers(false); setOpenContent(false); setOpenPayments(false); }}
              className={`${linkBase} justify-between w-full`}
            >
              <span className="flex items-center gap-3">
                <BsQuestionDiamondFill size={18} /> FAQs
              </span>
              {openFaqs ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {openFaqs && (
              <div className="ml-4 mt-1 flex flex-col space-y-1">
                <Link href="/admin/faqs" onClick={() => {setOpenDrawer(false)
 if (pathname !== "/admin/faqs") {
    setIsNavigating(true);
  } 

                }} className={`${linkBase} text-xs ${isActive("/admin/faqs") ? "bg-[var(--brand-primary)]" : ""}`}>
                  <FiMessageSquare size={16} /> Manage FAQs
                </Link>
              </div>
            )}
          </div>

          {/* Content Dropdown */}
          <div>
            <button
              onClick={() => { setOpenContent(!openContent); setOpenUsers(false); setOpenPayments(false); setOpenFaqs(false); }}
              className={`${linkBase} justify-between w-full`}
            >
              <span className="flex items-center gap-3">
                <FiFileText size={18} /> Content
              </span>
              {openContent ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {openContent && (
              <div className="ml-4 mt-1 flex flex-col space-y-1">
                <Link href="/admin/movie-management" onClick={() => {setOpenDrawer(false)
 if (pathname !== "/admin/movie-management") {
    setIsNavigating(true);
  } 

                }} className={`${linkBase} text-xs ${isActive("/admin/movie-management") ? "bg-[var(--brand-primary)]" : ""}`}>
                  <BiMovie size={16} /> Movies
                </Link>
                <Link href="/admin/series-management" onClick={() => {setOpenDrawer(false)
 if (pathname !== "/admin/series-management") {
    setIsNavigating(true);
  } 

                }} className={`${linkBase} text-xs ${isActive("/admin/series-management") ? "bg-[var(--brand-primary)]" : ""}`}>
                  <BiTv size={16} /> Series
                </Link>
                <Link href="/admin/documentary-management" onClick={() => {setOpenDrawer(false)
 if (pathname !== "/admin/documentary-management") {
    setIsNavigating(true);
  } 

                }} className={`${linkBase} text-xs ${isActive("/admin/documentary-management") ? "bg-[var(--brand-primary)]" : ""}`}>
                  <GrDocumentCloud size={16} /> Documentary
                </Link>
                <Link href="/admin/trailer-management" onClick={() => {setOpenDrawer(false)
 if (pathname !== "/admin/trailer-management") {
    setIsNavigating(true);
  } 

                }} className={`${linkBase} text-xs ${isActive("/admin/trailer-management") ? "bg-[var(--brand-primary)]" : ""}`}>
                  <BiTv size={16} /> Trailers
                </Link>
                <Link href="/admin/demo-content-management" onClick={() => {setOpenDrawer(false)
 if (pathname !== "/admin/demo-content-management") {
    setIsNavigating(true);
  } 

                }} className={`${linkBase} text-xs ${isActive("/admin/demo-content-management") ? "bg-[var(--brand-primary)]" : ""}`}>
                  <FiList size={16} /> Demo Contents
                </Link>
              </div>
            )}
          </div>

          {/* Payments Dropdown */}
          <div>
            <button
              onClick={() => { setOpenPayments(!openPayments); setOpenUsers(false); setOpenContent(false); setOpenFaqs(false); }}
              className={`${linkBase} justify-between w-full`}
            >
              <span className="flex items-center gap-3">
                <BsCash size={18} /> Payments
              </span>
              {openPayments ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {openPayments && (
              <div className="ml-4 mt-1 flex flex-col space-y-1">
                <Link href="/admin/payment-plans" onClick={() => {setOpenDrawer(false)
                   if (pathname !== "/admin/payment-plans") {
    setIsNavigating(true);
  } 
                }} className={`${linkBase} text-xs ${isActive("/admin/payment-plans") ? "bg-[var(--brand-primary)]" : ""}`}>
                  <BsSubscript size={16} /> Payment Plans
                </Link>
                <Link href="/admin/subscriptions" onClick={() => {setOpenDrawer(false)
                   if (pathname !== "/admin/subscriptions") {
    setIsNavigating(true);
  } 
                }} className={`${linkBase} text-xs ${isActive("/admin/subscriptions") ? "bg-[var(--brand-primary)]" : ""}`}>
                  <GrPlan size={16} /> Subscriptions
                </Link>
              </div>
            )}
          </div>

          {/* Settings */}
          <Link href="/admin/settings" onClick={() => {setOpenDrawer(false)
  if (pathname !== "/admin/settings") {
    setIsNavigating(true);
  }
          }} className={`${linkBase} ${isActive("/admin/settings") ? "bg-[var(--brand-primary)]" : ""}`}>
            <FiSettings size={18} /> Settings
          </Link>

        </nav>
      </aside>
    </>
  );
}
