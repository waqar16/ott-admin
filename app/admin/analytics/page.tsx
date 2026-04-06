"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import ReactECharts from "echarts-for-react";
import SkeletonLoader from "@/components/Loader/SkeletonLoader";
import { API_BASE } from "@/lib/config";
import GoogleDriveButton from "@/components/GoogleDriveUploadButton/GoogleDriveButton";
import { upperCaseString } from "@/utils/stringUpperCase";

// Generic ChartCard
export function ChartCard({ title, description, chartData, type = "line" }: any) {
  const option = {
    tooltip: { trigger: "axis", backgroundColor: "#1f2937", textStyle: { color: "#fff" } },
    xAxis: { type: "category", data: chartData.map((d: any) => d.date), axisLine: { lineStyle: { color: "#ccc" } } },
    yAxis: { type: "value", axisLine: { lineStyle: { color: "#ccc" } } },
    grid: { left: "10%", right: "5%", bottom: "10%", top: "20%" },
    series: [
      {
        data: chartData.map((d: any) => d.count ?? d.total_revenue ?? d.watch_seconds ?? d.events ?? d.value ?? 0),
        type,
        smooth: true,
        lineStyle: { color: "#423ffdff", width: 3 },
        itemStyle: { color: "#3b3ef6ff" },
        areaStyle: { color: "rgba(87, 59, 246, 0.2)" },
      },
    ],
  };
  return (
    <div className="bg-neutral-950 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className="h-56">
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
}

// Pie Chart Card
export function PieCard({ title, data }: any) {
  // Define shades of red
  const redShades = ["#0011ffff", "#4d8bffff", "#99a0ffff","#403dffff", "#2500ccff"];

  const option = {
    color: redShades, // <-- custom colors here
    tooltip: {
      trigger: "item",
      backgroundColor: "#1f2937",
      textStyle: { color: "#fff" },
      formatter: "{b}: {c} ({d}%)",
    },
    series: [
      {
        type: "pie",
        radius: "70%",
        data: data.map((d: any) => ({
          value: d.count ?? d.value,
          name: d.plan_name ?? d.status ?? d.device_type ?? d.label,
        })),
        label: { color: "#fff" },
      },
    ],
  };

  return (
    <div className="bg-neutral-950 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <div className="h-56">
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
}


// StatCard for single value
export function StatCard({ title, value }: any) {
  return (
    <div className="bg-neutral-950 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col">
      <h2 className="text-gray-400 text-sm">{title}</h2>
      <p className="text-white text-2xl font-semibold">{value}</p>
    </div>
  );
}

// TableCard for list of items
export function TableCard({ title, columns, data }: any) {
  return (
    <div className="bg-neutral-950 p-6 rounded-xl shadow-lg border border-gray-700 overflow-auto">
     
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      {data.length > 0 ?
      <>
      <table className="min-w-full text-left">
        <thead>
          <tr>{columns?.map((col: any) => <th key={col} className="text-gray-400 px-4 py-2">{col}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row: any, i: number) => (
            <tr key={`row-${i}`} className="border-t border-gray-700">
              {columns?.map((col: any) => <td key={col} className="px-4 py-2 text-white">{row[col]}</td>)}
            </tr>
          ))}
        </tbody>
      </table></>:
      <p className="text-gray-600">No Data to show</p>}
    </div>
  );
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [error, setError] = useState("");

  function formatSeconds(seconds: number | undefined) {
    if (typeof seconds !== "number" || Number.isNaN(seconds)) return "0s";

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }

  async function fetchAPI(endpoint: string, defaultData: any = []) {
    try {
      const token = Cookies.get("access_token");
      const res = await fetch(`${API_BASE}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("API fetch failed");
      return await res.json();
    } catch (err: any) {
      console.log(err);
      return defaultData;
    }
  }

  useEffect(() => {
    async function loadAll() {
      setLoading(true);

      const [
        userGrowth,
        activeUsers,
        userRoles,
        userStatus,
        subscriptionPlans,
        subscriptionStatus,
        subscriptionChurn,
        newSubscriptions,
        revenueSummary,
        revenueTimeseries,
        revenuePlan,
        topUsers,
        paymentStatus,
        paymentProcessor,
        topMovies,
        topSeries,
        topEpisodes,
        engagementActive,
        engagementWatchTime,
        engagementDevices,
        engagementTimeline,
      ] = await Promise.all([
        fetchAPI("api/v1/admin-dashboard/users/growth"),
        fetchAPI("api/v1/admin-dashboard/users/active"),
        fetchAPI("api/v1/admin-dashboard/users/roles"),
        fetchAPI("api/v1/admin-dashboard/users/status"),
        fetchAPI("api/v1/admin-dashboard/subscriptions/plan-breakdown"),
        fetchAPI("api/v1/admin-dashboard/subscriptions/status"),
        fetchAPI("api/v1/admin-dashboard/subscriptions/churn"),
        fetchAPI("api/v1/admin-dashboard/subscriptions/new"),
        fetchAPI("api/v1/admin-dashboard/revenue/summary"),
        fetchAPI("api/v1/admin-dashboard/revenue/timeseries"),
        fetchAPI("api/v1/admin-dashboard/revenue/plan-breakdown"),
        fetchAPI("api/v1/admin-dashboard/revenue/top-users"),
        fetchAPI("api/v1/admin-dashboard/revenue/payment-status"),
        fetchAPI("api/v1/admin-dashboard/revenue/payment-processor"),
        fetchAPI("api/v1/admin-dashboard/content/top-movies"),
        fetchAPI("api/v1/admin-dashboard/content/top-series"),
        fetchAPI("api/v1/admin-dashboard/content/top-episodes"),
        fetchAPI("api/v1/admin-dashboard/engagement/active-users"),
        fetchAPI("api/v1/admin-dashboard/engagement/watch-time"),
        fetchAPI("api/v1/admin-dashboard/engagement/devices"),
        fetchAPI("api/v1/admin-dashboard/engagement/timeline"),
      ]);

      setData({
        userGrowth,
        activeUsers,
        userRoles,
        userStatus,
        subscriptionPlans,
        subscriptionStatus,
        subscriptionChurn,
        newSubscriptions,
        revenueSummary,
        revenueTimeseries,
        revenuePlan,
        topUsers,
        paymentStatus,
        paymentProcessor,
        topMovies,
        topSeries,
        topEpisodes,
        engagementActive,
        engagementWatchTime,
        engagementDevices,
        engagementTimeline,
      });

      setLoading(false);
    }

    loadAll();
  }, []);

  if (error) return <div className="text-red-500 p-6">{error}</div>;

  const engagementTimelineData = Array.isArray(data?.engagementTimeline)
    ? data.engagementTimeline
    : data?.engagementTimeline?.results ?? [];

if (loading)
    return (
      <div className=" p-2 md:p-6 mt-16 md:mt-0 space-y-2 md:space-y-8 ">
        <SkeletonLoader className="h-[25px] md:h-56 w-full bg-neutral-800 w-8/12" />
        <SkeletonLoader className="md:hidden h-[15px] md:h-56 w-9/12 bg-neutral-800 mt-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonLoader  className="h-64 md:h-56 w-full bg-neutral-800" />
          <SkeletonLoader className="h-64 md:h-56 w-full bg-neutral-800" />
        </div>
        <div className="grid  grid-cols-1  sm:grid-cols-2  md:grid-cols-3 gap-6">
          <SkeletonLoader className="h-56 w-full bg-neutral-800" />
          <SkeletonLoader className="h-56 w-full bg-neutral-800" />
          <SkeletonLoader className="h-56 w-full bg-neutral-800" />
        </div>
      </div>
    );
  return (
    <div className=" p-2 md:p-6 space-y-2 md:space-y-8  text-white sm:mt-0 mt-16 ">
       <h1 className="text-3xl font-bold">Admin Analytics</h1>
      
     
      <p className="text-gray-400">Numeral overview of your OTT Platform</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
       {data.userGrowth.results>0 && 
       <ChartCard
  title="User Growth"
  description="New users per day"
  chartData={data.userGrowth?.results ?? []}
/>}

<ChartCard
  title="Active Users"
  description="Daily active users"
  chartData={data.activeUsers?.results ?? []}
/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
       <PieCard
  title="User Roles"
  data={(data.userRoles?.breakdown ?? []).map((item: any) => ({
    label: upperCaseString(item.role),
    count: item.count,
  }))}
/>

<PieCard
  title="User Status"
   data={(data.userStatus?.breakdown ?? []).map((item: any) => ({
    label: upperCaseString(item.status),
    count: item.count,
  }))} 
/>

<PieCard
  title="Subscription Status"
  data={Object.entries(data.subscriptionStatus ?? {}).map(([k, v]) => ({ label: k, count: v }))}
/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {data.subscriptionChurn.churn_rate_percent>0 && <StatCard title="Churn Rate" value={`${data.subscriptionChurn.churn_rate_percent}%`} />}
        
        
        {data.newSubscriptions.results?.length > 0 && (
          <ChartCard title="New Subscriptions" description="Subscriptions per day" chartData={data.newSubscriptions.results?? []} />
        )}
        {data.revenueTimeseries.results?.length > 0 && (
          <ChartCard title="Revenue Timeseries" description="Revenue per day" chartData={data.revenueTimeseries.results?? []} />
        )}
      </div>

      <TableCard title="Top Paying Users" columns={["email", "total_revenue", "payments_count"]} data={data.topUsers.results ?? []} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <PieCard
          title="Payment Status"
          data={data?.paymentStatus?.results ? data.paymentStatus.results.map((p: any) => ({ label: upperCaseString(p.status), count: p.count })) : []}
        />
        <PieCard title="Payment Processor" data={data?.paymentProcessor?.results?data.paymentProcessor.results.map((p: any) => ({ label: upperCaseString(p.processor), count: p.count })) : []} />
      </div>

      <div className="space-y-6">
        {data.topMovies?.length > 0 && <TableCard title="Top Movies" columns={["title", "views"]} data={data.topMovies?? []} />}
        {data.topSeries?.length > 0 && <TableCard title="Top Series" columns={["title", "views"]} data={data.topSeries?? []} />}
        {data.topEpisodes?.length > 0 && <TableCard title="Top Episodes" columns={["title", "views"]} data={data.topEpisodes?? []} />}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard title="DAU" value={data.engagementActive.dau} />
        <StatCard title="WAU" value={data.engagementActive.wau} />
        <StatCard title="MAU" value={data.engagementActive.mau} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <StatCard title="Total Watch Time" value={formatSeconds(data.engagementWatchTime?.total_watch_seconds)} />
        <StatCard title="Avg Watch / User" value={formatSeconds(data.engagementWatchTime?.avg_watch_per_user_seconds)} />
        <StatCard title="Avg Watch / Session" value={formatSeconds(data.engagementWatchTime?.avg_watch_per_session_seconds)} />
      </div>

      <ChartCard title="Engagement Timeline" description="Watch seconds over time" chartData={engagementTimelineData} />
    </div>
  );
}
