
"use client";

import { useState } from "react";
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
  FiUserPlus
} from "react-icons/fi";
import { BiFolder, BiPlus, BiTv } from "react-icons/bi";
import { GrAnalytics } from "react-icons/gr";
import { BsFileBarGraph } from "react-icons/bs";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const [openUsers, setOpenUsers] = useState(false);
  const [openTemplates, setOpenTemplates] = useState(false);
  const [openShows, setOpenShows] = useState(false);

  const linkBase =
    "flex items-center gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition";

  const isActive = (path: string) => pathname === path;

  return (
    <div className="pr-2 w-64 bg-gray-900 h-screen text-gray-200 fixed left-0 top-0 shadow-xl overflow-y-auto border border-r-gray-500 border-l-0 border-y-0">
      <div className="py-5 text-center border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      </div>
      {/* <button
  onClick={() => setCollapsed(!collapsed)}
  className="absolute right-3 top-5 text-white"
>
  {collapsed ? "➡" : "⬅"}
</button> */}

      <div className="mt-4 flex flex-col space-y-2">

        {/* Dashboard */}
        <Link
          href="/admin"
          className={`${linkBase} ${isActive("/admin") ? "bg-gray-700 text-white font-semibold" : ""}`}
        >
          <FiHome size={18} /> Overview
        </Link>
<Link
          href="/admin/analytics"
          className={`${linkBase} ${isActive("/admin/analytics") ? "bg-gray-700 text-white font-semibold" : ""}`}
        >
          <BsFileBarGraph size={18} /> Analytics
        </Link>
        {/* Users dropdown */}
        <div>
          <button
            onClick={() =>{ setOpenUsers(!openUsers)
                    setOpenShows(false)}}
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
                href={"/admin/users"}
                className={`${linkBase} ${isActive("/admin/users") ? "bg-gray-700 text-white" : ""}`}
              >
                <FiList size={16} />Manage Users
              </Link>

              <Link
                href="/admin/create-user"
                className={`${linkBase} ${isActive("/admin/create-user") ? "bg-gray-700 text-white" : ""}`}
              >
                <FiUserPlus size={16} />  Add User
              </Link>

            </div>
          )}
        </div>

        {/* Templates dropdown */}
        <div>
          <button
            onClick={() => setOpenTemplates(!openTemplates)}
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
                href="/admin/movie-management"
                className={`${linkBase} ${isActive("/admin/movie-management") ? "bg-gray-700 text-white" : ""}`}
              >
                <FiList size={16} /> Movies
              </Link>
              <div>
                <button
                  onClick={() => {
                    setOpenUsers(false)
                    setOpenShows(!openShows)}}
                  className={`${linkBase} w-full justify-between`}
                >
                  <span className="flex items-center gap-3 text-start">
                    <FiList size={16} /> Shows 
                  </span>
                  {openShows ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>
              {openShows && (
            <div className="ml-4 mt-1 flex flex-col space-y-1">
               
  <Link
                href="/admin/series-management"
                className={`${linkBase} ${isActive("/admin/series-management") ? "bg-gray-700 text-white" : ""}`}
              >
                <BiTv size={16} />   Series
              </Link>
<Link
                href="/admin/episode-management"
                className={`${linkBase} ${isActive("/admin/episode-management") ? "bg-gray-700 text-white" : ""}`}
              >
                <BiFolder size={16} />   Episode
              </Link>
                      
</div>)}
  <Link
                                href="/admin/documentary-management"

                className={`${linkBase} ${isActive("/admin/documentary-management") ? "bg-gray-700 text-white" : ""}`}
              >
                <FiList size={16} /> Documentary
              </Link>
              <Link
                href="/admin/trailer-management"
                className={`${linkBase} ${isActive("/admin/trailer-management") ? "bg-gray-700 text-white" : ""}`}
              >
                <FiList size={16} /> Trailers
              </Link>

              <Link
                href="/admin/demo-content-management"
                className={`${linkBase} ${isActive("/admin/demo-content-management") ? "bg-gray-700 text-white" : ""}`}
              >
                <FiList size={16} /> Demo Contents
              </Link>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link
          href={`/admin/settings`}
          className={`${linkBase} ${isActive("/admin/settings") ? "bg-gray-700 text-white" : ""}`}
        >
          <FiSettings size={18} /> Settings
        </Link>

      </div>
    </div>
  );
}
