"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";
import Cookies from "js-cookie";
import SkeletonLoader from "@/components/Loader/SkeletonLoader";
export default function AdminHome() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function getDashboardData() {
    try {
      const token = Cookies.get('access_token')
      console.log(token,"token")
      const res = await fetch(`${API_BASE}api/v1/admin-dashboard/overview`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,  
        },
      });

      if (!res.ok) throw new Error("Failed to fetch dashboard data");

      const json = await res.json();
      console.log("Dashboard:", json);
      return json;
    } catch (err: any) {
      console.log("API Error", err);
      setError(err.message);
      return null;
    }
  }

  useEffect(() => {
    async function load() { 
      const d = await getDashboardData();
      console.log(d,'d')
      setData(d.results);
      setLoading(false);
    }
    load();
  }, []);
 

  if (error)
    return (
      <div className="p-6 text-red-400 text-xl">
        Failed to load dashboard: {error}
      </div>
    );

  return (<> 
 {loading?
 <div className=" p-2 md:p-6 space-y-2 md:space-y-8 bg-black flex flex-col items-start w-fll mt-16 md:mt-0">
  <SkeletonLoader className="h-[30px] md:h-[30px] w-8/12 md:w-[300px] bg-neutral-800"/>
  <SkeletonLoader className="h-[20px] md:h-[20px] w-9/12 md:w-[300px] bg-neutral-800 mt-4"/>
  <SkeletonLoader className="h-[20px] md:h-[20px] w-2/12 md:w-[300px] bg-neutral-800 mt-4 sm:hidden "/>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full gap-6">
{Array.from({length:8}).map((_, index)=>(
  <div key={index} className="w-full      flex flex-col items-start rounded-lg  p-6 border border-neutral-950 bg-neutral-900">
      <SkeletonLoader className=" h-[10px] md:h-[20px] w-[70px] md:w-5/12 bg-neutral-800  "/>
      <SkeletonLoader className=" h-[25px] md:h-[20px] w-[30px] md:w-3/12 bg-neutral-800 mt-2 "/>
      <SkeletonLoader className=" h-[20px] md:h-[20px] w-[65px] md:w-3/12 bg-neutral-800 mt-2  "/>

     </div>
))
}

  </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full gap-6">
    {Array.from({length:3}).map((_, index)=>(
  <div key={index} className="w-full    bg-black flex flex-col items-start rounded-lg p-6 border border-gray-700">
      <SkeletonLoader className="h-[100px] md:h-[20px] w-full md:w-5/12 bg-neutral-800  "/>
      <SkeletonLoader className="h-[100px] md:h-[20px] w-full md:w-3/12 bg-neutral-800 mt-2 "/>
      <SkeletonLoader className="h-[100px] md:h-[20px] w-full md:w-3/12 bg-neutral-800 mt-4  "/>

     </div>
))
}
  </div>
 </div>
  :     
    <div className=" p-2 md:p-6 space-y-1 md:space-y-4 bg-black text-white mt-16 md:mt-0">
      {/* Header */}
      <h1 className="text-3xl font-bold">Admin Overview</h1>
      <p className="text-gray-400">Numeral overview of your OTT Platform</p>
       <h1 className=" ">User Stats</h1>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={data.total_users} />
        <StatCard title="Active Last 30 Days" value={data.active_users_last_30_days} />
        <StatCard title="Inactive Users" value={data.inactive_users} />
      </div>

       <h1>Subscriptions Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Active Subscriptions" value={data.active_subscriptions} />

        <StatCard title="Trialing Subscriptions" value={data.trialing_subscriptions} />
        <StatCard title="Canceled Subscriptions" value={data.canceled_subscriptions} />
        <StatCard title="Subscription Revenue (30 Days)" value={`$${data.subscription_revenue_last_30_days}`} />
      </div>

             <h1>Revenue Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Revenue (30 Days)" value={`$${data.revenue_last_30_days}`} />
        <StatCard title="PPV Revenue (30 Days)" value={`$${data.ppv_revenue_last_30_days}`} />
        <StatCard title="Total Revenue (All Time)" value={`$${data.revenue_all_time}`} />
      </div>

                   <h1>Content Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard title="Total Contents" value={data.total_contents} />
        <StatCard title="Movies" value={data.total_movies} />
        <StatCard title="Series" value={data.total_series} />
        <StatCard title="Episodes" value={data.total_episodes} />
        <StatCard title="Published Contents" value={data.total_published} />
      </div>

      {/* Views Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Views Last 24 Hours" value={data.views_last_24_hours} />
        <StatCard title="Views Last 7 Days" value={data.views_last_7_days} />
         <StatCard title="Unique Viewers Last 24 Hours" value={data.unique_viewers_last_24_hours} />
        <StatCard title="Unique Viewers Last 7 Days" value={data.unique_viewers_last_7_days} />
      </div>

      {/* Charts Section */}
      
    </div>
  
 } </>
  );
}

function StatCard({ title, value, growth }: any) {
  return (
    <div className="bg-neutral-900 p-5 rounded-xl shadow-lg border border-neutral-800">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      <p className="text-[var(--main-color)] text-sm mt-1">{growth}</p>
    </div>
  );
}

