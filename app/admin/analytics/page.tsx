// "use client";

// import { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import ReactECharts from "echarts-for-react";
// import SkeletonLoader from "@/components/Loader/SkeletonLoader";
// import { API_BASE } from "@/lib/config";
// import GoogleDriveButton from "@/components/GoogleDriveUploadButton/GoogleDriveButton";
// import { upperCaseString } from "@/utils/stringUpperCase";

// // Generic ChartCard
// export function ChartCard({ title, description, chartData, type = "line" }: any) {
//   const option = {
//     tooltip: { trigger: "axis", backgroundColor: "#1f2937", textStyle: { color: "#fff" } },
//     xAxis: { type: "category", data: chartData.map((d: any) => d.date), axisLine: { lineStyle: { color: "#ccc" } } },
//     yAxis: { type: "value", axisLine: { lineStyle: { color: "#ccc" } } },
//     grid: { left: "10%", right: "5%", bottom: "10%", top: "20%" },
//     series: [
//       {
//         data: chartData.map((d: any) => d.count ?? d.total_revenue ?? d.watch_seconds ?? d.events ?? d.value ?? 0),
//         type,
//         smooth: true,
//         lineStyle: { color: "#423ffdff", width: 3 },
//         itemStyle: { color: "#3b3ef6ff" },
//         areaStyle: { color: "rgba(87, 59, 246, 0.2)" },
//       },
//     ],
//   };
//   return (
//     <div className="bg-neutral-950 p-6 rounded-xl shadow-lg border border-gray-700">
//       <h2 className="text-xl font-semibold text-white">{title}</h2>
//       <p className="text-gray-400 text-sm mb-4">{description}</p>
//       <div className="h-56">
//         <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
//       </div>
//     </div>
//   );
// }

// // Pie Chart Card
// export function PieCard({ title, data }: any) {
//   // Define shades of red
//   const redShades = ["#0011ffff", "#4d8bffff", "#99a0ffff","#403dffff", "#2500ccff"];

//   const option = {
//     color: redShades, // <-- custom colors here
//     tooltip: {
//       trigger: "item",
//       backgroundColor: "#1f2937",
//       textStyle: { color: "#fff" },
//       formatter: "{b}: {c} ({d}%)",
//     },
//     series: [
//       {
//         type: "pie",
//         radius: "70%",
//         data: data.map((d: any) => ({
//           value: d.count ?? d.value,
//           name: d.plan_name ?? d.status ?? d.device_type ?? d.label,
//         })),
//         label: { color: "#fff" },
//       },
//     ],
//   };

//   return (
//     <div className="bg-neutral-950 p-6 rounded-xl shadow-lg border border-gray-700">
//       <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
//       <div className="h-56">
//         <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
//       </div>
//     </div>
//   );
// }


// // StatCard for single value
// export function StatCard({ title, value }: any) {
//   return (
//     <div className="bg-neutral-950 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col">
//       <h2 className="text-gray-400 text-sm">{title}</h2>
//       <p className="text-white text-2xl font-semibold">{value}</p>
//     </div>
//   );
// }

// // TableCard for list of items
// export function TableCard({ title, columns, data }: any) {
//   return (
//     <div className="bg-neutral-950 p-6 rounded-xl shadow-lg border border-gray-700 overflow-auto">
     
//       <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
//       {data.length > 0 ?
//       <>
//       <table className="min-w-full text-left">
//         <thead>
//           <tr>{columns?.map((col: any) => <th key={col} className="text-gray-400 px-4 py-2">{col}</th>)}</tr>
//         </thead>
//         <tbody>
//           {data.map((row: any, i: number) => (
//             <tr key={`row-${i}`} className="border-t border-gray-700">
//               {columns?.map((col: any) => <td key={col} className="px-4 py-2 text-white">{row[col]}</td>)}
//             </tr>
//           ))}
//         </tbody>
//       </table></>:
//       <p className="text-gray-600">No Data to show</p>}
//     </div>
//   );
// }

// export default function Analytics() {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState<any>({});
//   const [error, setError] = useState("");

//   function formatSeconds(seconds: number | undefined) {
//     if (typeof seconds !== "number" || Number.isNaN(seconds)) return "0s";

//     const hrs = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     const secs = Math.floor(seconds % 60);

//     if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
//     if (mins > 0) return `${mins}m ${secs}s`;
//     return `${secs}s`;
//   }

//   async function fetchAPI(endpoint: string, defaultData: any = []) {
//     try {
//       const token = Cookies.get("access_token");
//       const res = await fetch(`${API_BASE}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
//       if (!res.ok) throw new Error("API fetch failed");
//       return await res.json();
//     } catch (err: any) {
//       console.log(err);
//       return defaultData;
//     }
//   }

//   useEffect(() => {
//     async function loadAll() {
//       setLoading(true);

//       const [
//         userGrowth,
//         activeUsers,
//         userRoles,
//         userStatus,
//         subscriptionPlans,
//         subscriptionStatus,
//         subscriptionChurn,
//         newSubscriptions,
//         revenueSummary,
//         revenueTimeseries,
//         revenuePlan,
//         topUsers,
//         paymentStatus,
//         paymentProcessor,
//         topMovies,
//         topSeries,
//         topEpisodes,
//         engagementActive,
//         engagementWatchTime,
//         engagementDevices,
//         engagementTimeline,
//       ] = await Promise.all([
//         fetchAPI("api/v1/admin-dashboard/users/growth"),
//         fetchAPI("api/v1/admin-dashboard/users/active"),
//         fetchAPI("api/v1/admin-dashboard/users/roles"),
//         fetchAPI("api/v1/admin-dashboard/users/status"),
//         fetchAPI("api/v1/admin-dashboard/subscriptions/plan-breakdown"),
//         fetchAPI("api/v1/admin-dashboard/subscriptions/status"),
//         fetchAPI("api/v1/admin-dashboard/subscriptions/churn"),
//         fetchAPI("api/v1/admin-dashboard/subscriptions/new"),
//         fetchAPI("api/v1/admin-dashboard/revenue/summary"),
//         fetchAPI("api/v1/admin-dashboard/revenue/timeseries"),
//         fetchAPI("api/v1/admin-dashboard/revenue/plan-breakdown"),
//         fetchAPI("api/v1/admin-dashboard/revenue/top-users"),
//         fetchAPI("api/v1/admin-dashboard/revenue/payment-status"),
//         fetchAPI("api/v1/admin-dashboard/revenue/payment-processor"),
//         fetchAPI("api/v1/admin-dashboard/content/top-movies"),
//         fetchAPI("api/v1/admin-dashboard/content/top-series"),
//         fetchAPI("api/v1/admin-dashboard/content/top-episodes"),
//         fetchAPI("api/v1/admin-dashboard/engagement/active-users"),
//         fetchAPI("api/v1/admin-dashboard/engagement/watch-time"),
//         fetchAPI("api/v1/admin-dashboard/engagement/devices"),
//         fetchAPI("api/v1/admin-dashboard/engagement/timeline"),
//       ]);

//       setData({
//         userGrowth,
//         activeUsers,
//         userRoles,
//         userStatus,
//         subscriptionPlans,
//         subscriptionStatus,
//         subscriptionChurn,
//         newSubscriptions,
//         revenueSummary,
//         revenueTimeseries,
//         revenuePlan,
//         topUsers,
//         paymentStatus,
//         paymentProcessor,
//         topMovies,
//         topSeries,
//         topEpisodes,
//         engagementActive,
//         engagementWatchTime,
//         engagementDevices,
//         engagementTimeline,
//       });

//       setLoading(false);
//     }

//     loadAll();
//   }, []);

//   if (error) return <div className="text-red-500 p-6">{error}</div>;

//   const engagementTimelineData = Array.isArray(data?.engagementTimeline)
//     ? data.engagementTimeline
//     : data?.engagementTimeline?.results ?? [];

// if (loading)
//     return (
//       <div className=" p-2 md:p-6 mt-16 md:mt-0 space-y-2 md:space-y-8 ">
//         <SkeletonLoader className="h-[25px] md:h-56 w-full bg-neutral-800 w-8/12" />
//         <SkeletonLoader className="md:hidden h-[15px] md:h-56 w-9/12 bg-neutral-800 mt-4" />
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <SkeletonLoader  className="h-64 md:h-56 w-full bg-neutral-800" />
//           <SkeletonLoader className="h-64 md:h-56 w-full bg-neutral-800" />
//         </div>
//         <div className="grid  grid-cols-1  sm:grid-cols-2  md:grid-cols-3 gap-6">
//           <SkeletonLoader className="h-56 w-full bg-neutral-800" />
//           <SkeletonLoader className="h-56 w-full bg-neutral-800" />
//           <SkeletonLoader className="h-56 w-full bg-neutral-800" />
//         </div>
//       </div>
//     );
//   return (
//     <div className=" p-2 md:p-6 space-y-2 md:space-y-8  text-white sm:mt-0 mt-16 ">
//        <h1 className="text-3xl font-bold">Admin Analytics</h1>
      
     
//       <p className="text-gray-400">Numeral overview of your OTT Platform</p>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
//        {data.userGrowth.results>0 && 
//        <ChartCard
//   title="User Growth"
//   description="New users per day"
//   chartData={data.userGrowth?.results ?? []}
// />}

// <ChartCard
//   title="Active Users"
//   description="Daily active users"
//   chartData={data.activeUsers?.results ?? []}
// />
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//        <PieCard
//   title="User Roles"
//   data={(data.userRoles?.results ?? []).map((item: any) => ({
//     label: upperCaseString(item.role),
//     count: item.count,
//   }))}
// />

// <PieCard
//   title="User Status"
//    data={(data.userStatus?.results ?? []).map((item: any) => ({
//     label: upperCaseString(item.status),
//     count: item.count,
//   }))} 
// />

// <PieCard
//   title="Subscription Status"
//   data={Object.entries(data.subscriptionStatus ?? {}).map(([k, v]) => ({ label: k, count: v }))}
// />
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {data.subscriptionChurn.churn_rate_percent>0 && <StatCard title="Churn Rate" value={`${data.subscriptionChurn.churn_rate_percent}%`} />}
        
        
//         {data.newSubscriptions.results?.length > 0 && (
//           <ChartCard title="New Subscriptions" description="Subscriptions per day" chartData={data.newSubscriptions.results?? []} />
//         )}
//         {data.revenueTimeseries.results?.length > 0 && (
//           <ChartCard title="Revenue Timeseries" description="Revenue per day" chartData={data.revenueTimeseries.results?? []} />
//         )}
//       </div>

//       <TableCard title="Top Paying Users" columns={["email", "total_revenue", "payments_count"]} data={data.topUsers.results ?? []} />

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         <PieCard
//           title="Payment Status"
//           data={data?.paymentStatus?.results ? data.paymentStatus.results.map((p: any) => ({ label: upperCaseString(p.status), count: p.count })) : []}
//         />
//         <PieCard title="Payment Processor" data={data?.paymentProcessor?.results?data.paymentProcessor.results.map((p: any) => ({ label: upperCaseString(p.processor), count: p.count })) : []} />
//       </div>

//       <div className="space-y-6">
//         {data.topMovies?.length > 0 && <TableCard title="Top Movies" columns={["title", "views"]} data={data.topMovies?? []} />}
//         {data.topSeries?.length > 0 && <TableCard title="Top Series" columns={["title", "views"]} data={data.topSeries?? []} />}
//         {data.topEpisodes?.length > 0 && <TableCard title="Top Episodes" columns={["title", "views"]} data={data.topEpisodes?? []} />}
//       </div>

//       <div className="grid grid-cols-3 gap-6">
//         <StatCard title="DAU" value={data.engagementActive.dau} />
//         <StatCard title="WAU" value={data.engagementActive.wau} />
//         <StatCard title="MAU" value={data.engagementActive.mau} />
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         <StatCard title="Total Watch Time" value={formatSeconds(data.engagementWatchTime?.total_watch_seconds)} />
//         <StatCard title="Avg Watch / User" value={formatSeconds(data.engagementWatchTime?.avg_watch_per_user_seconds)} />
//         <StatCard title="Avg Watch / Session" value={formatSeconds(data.engagementWatchTime?.avg_watch_per_session_seconds)} />
//       </div>

//       <ChartCard title="Engagement Timeline" description="Watch seconds over time" chartData={engagementTimelineData} />
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import ReactECharts from "echarts-for-react";
import SkeletonLoader from "@/components/Loader/SkeletonLoader";
import { API_BASE } from "@/lib/config";
import { upperCaseString } from "@/utils/stringUpperCase";

// Generic ChartCard
export function ChartCard({ title, description, chartData, type = "line", dataKey = "count" }: any) {
  const option = {
    tooltip: { trigger: "axis", backgroundColor: "#1f2937", textStyle: { color: "#fff" } },
    xAxis: { 
      type: "category", 
      data: chartData.map((d: any) => d.date), 
      axisLine: { lineStyle: { color: "#ccc" } } 
    },
    yAxis: { type: "value", axisLine: { lineStyle: { color: "#ccc" } } },
    grid: { left: "10%", right: "5%", bottom: "10%", top: "20%" },
    series: [
      {
        data: chartData.map((d: any) => {
          // Handle different response keys
          return d[dataKey] ?? d.count ?? d.total_revenue ?? d.watch_seconds ?? 
                 d.events ?? d.value ?? d.new_users ?? d.active_users ?? 
                 d.new_subscriptions ?? d.revenue ?? d.views ?? d.watch_hours ?? 0;
        }),
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
  const blueShades = ["#0011ffff", "#4d8bffff", "#99a0ffff", "#403dffff", "#2500ccff"];

  const option = {
    color: blueShades,
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
          value: d.count ?? d.value ?? d.amount,
          name: d.plan_name ?? d.status ?? d.device_type ?? d.label ?? d.role ?? d.processor,
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
export function StatCard({ title, value, subtitle }: any) {
  return (
    <div className="bg-neutral-950 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col">
      <h2 className="text-gray-400 text-sm">{title}</h2>
      <p className="text-white text-2xl font-semibold">{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

// TableCard for list of items
export function TableCard({ title, columns, data }: any) {
  return (
    <div className="bg-neutral-950 p-6 rounded-xl shadow-lg border border-gray-700 overflow-auto">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      {data && data.length > 0 ? (
        <table className="min-w-full text-left">
          <thead>
            <tr>
              {columns?.map((col: any) => (
                <th key={col.key} className="text-gray-400 px-4 py-2">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={`row-${i}`} className="border-t border-gray-700">
                {columns?.map((col: any) => (
                  <td key={col.key} className="px-4 py-2 text-white">
                    {col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No Data to show</p>
      )}
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

  function formatCurrency(amount: number | undefined) {
    if (typeof amount !== "number") return "$0.00";
    return `$${amount.toFixed(2)}`;
  }

  async function fetchAPI(endpoint: string, defaultData: any = []) {
    try {
      const token = Cookies.get("access_token");
      const res = await fetch(`${API_BASE}${endpoint}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
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
        overview,
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
        completionRates,
        dropoffAnalysis,
        engagementActive,
        engagementWatchTime,
        engagementDevices,
        engagementTimeline,
        engagementPeakHours,
      ] = await Promise.all([
        fetchAPI("api/v1/admin-dashboard/overview/"),
        fetchAPI("api/v1/admin-dashboard/users/growth/"),
        fetchAPI("api/v1/admin-dashboard/users/active/"),
        fetchAPI("api/v1/admin-dashboard/users/roles/"),
        fetchAPI("api/v1/admin-dashboard/users/status/"),
        fetchAPI("api/v1/admin-dashboard/subscriptions/plan-breakdown/"),
        fetchAPI("api/v1/admin-dashboard/subscriptions/status/"),
        fetchAPI("api/v1/admin-dashboard/subscriptions/churn/"),
        fetchAPI("api/v1/admin-dashboard/subscriptions/new/"),
        fetchAPI("api/v1/admin-dashboard/revenue/summary/"),
        fetchAPI("api/v1/admin-dashboard/revenue/timeseries/"),
        fetchAPI("api/v1/admin-dashboard/revenue/plan-breakdown/"),
        fetchAPI("api/v1/admin-dashboard/revenue/top-users/"),
        fetchAPI("api/v1/admin-dashboard/revenue/payment-status/"),
        fetchAPI("api/v1/admin-dashboard/revenue/payment-processor/"),
        fetchAPI("api/v1/admin-dashboard/content/top-movies/"),
        fetchAPI("api/v1/admin-dashboard/content/top-series/"),
        fetchAPI("api/v1/admin-dashboard/content/top-episodes/"),
        fetchAPI("api/v1/admin-dashboard/content/completion-rates/"),
        fetchAPI("api/v1/admin-dashboard/content/dropoff/"),
        fetchAPI("api/v1/admin-dashboard/engagement/active-users/"),
        fetchAPI("api/v1/admin-dashboard/engagement/watch-time/"),
        fetchAPI("api/v1/admin-dashboard/engagement/devices/"),
        fetchAPI("api/v1/admin-dashboard/engagement/timeline/"),
        fetchAPI("api/v1/admin-dashboard/engagement/peak-hours/"),
      ]);

      setData({
        overview,
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
        completionRates,
        dropoffAnalysis,
        engagementActive,
        engagementWatchTime,
        engagementDevices,
        engagementTimeline,
        engagementPeakHours,
      });

      setLoading(false);
    }

    loadAll();
  }, []);

  if (error) return <div className="text-red-500 p-6">{error}</div>;

  if (loading) {
    return (
      <div className="p-2 md:p-6 mt-16 md:mt-0 space-y-2 md:space-y-8">
        <SkeletonLoader className="h-[25px] md:h-56 w-full bg-neutral-800 w-8/12" />
        <SkeletonLoader className="md:hidden h-[15px] md:h-56 w-9/12 bg-neutral-800 mt-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonLoader className="h-64 md:h-56 w-full bg-neutral-800" />
          <SkeletonLoader className="h-64 md:h-56 w-full bg-neutral-800" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <SkeletonLoader className="h-56 w-full bg-neutral-800" />
          <SkeletonLoader className="h-56 w-full bg-neutral-800" />
          <SkeletonLoader className="h-56 w-full bg-neutral-800" />
        </div>
      </div>
    );
  }

  // Helper to check if data exists and has content
  const hasData = (obj: any, key?: string) => {
    if (!obj) return false;
    if (key) {
      const value = obj[key];
      return Array.isArray(value) ? value.length > 0 : value != null;
    }
    if (Array.isArray(obj)) return obj.length > 0;
    if (typeof obj === 'object') return Object.keys(obj).length > 0;
    return false;
  };

  return (
    <div className="p-2 md:p-6 space-y-2 md:space-y-8 text-white sm:mt-0 mt-16">
      <h1 className="text-3xl font-bold">Admin Analytics</h1>
      <p className="text-gray-400">Comprehensive overview of your OTT Platform</p>

      {/* Overview Section */}
      {hasData(data.overview) && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {data.overview.total_users != null && (
              <StatCard title="Total Users" value={data.overview.total_users.toLocaleString()} />
            )}
            {data.overview.active_users_last_30_days != null && (
              <StatCard 
                title="Active Users (30d)" 
                value={data.overview.active_users_last_30_days.toLocaleString()} 
              />
            )}
            {data.overview.active_subscriptions != null && (
              <StatCard 
                title="Active Subscriptions" 
                value={data.overview.active_subscriptions.toLocaleString()} 
              />
            )}
            {data.overview.revenue_last_30_days != null && (
              <StatCard 
                title="Revenue (30d)" 
                value={formatCurrency(data.overview.revenue_last_30_days)} 
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {data.overview.total_contents != null && (
              <StatCard title="Total Content" value={data.overview.total_contents.toLocaleString()} />
            )}
            {data.overview.total_contents_public != null && (
              <StatCard 
                title="Public Content" 
                value={data.overview.total_contents_public.toLocaleString()} 
              />
            )}
            {data.overview.total_contents_beta != null && (
              <StatCard 
                title="Beta Content" 
                value={data.overview.total_contents_beta.toLocaleString()} 
              />
            )}
            {data.overview.views_last_24_hours != null && (
              <StatCard 
                title="Views (24h)" 
                value={data.overview.views_last_24_hours.toLocaleString()} 
              />
            )}
          </div>
        </div>
      )}

      {/* User Analytics */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">User Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {hasData(data.userGrowth, 'results') && (
            <ChartCard
              title="User Growth"
              description="New users over time"
              chartData={data.userGrowth.results}
              dataKey="new_users"
            />
          )}
          {hasData(data.activeUsers, 'results') && (
            <ChartCard
              title="Active Users"
              description="Daily active users"
              chartData={data.activeUsers.results}
              dataKey="active_users"
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {hasData(data.userRoles, 'results') && (
            <PieCard
              title="User Roles"
              data={data.userRoles.results.map((item: any) => ({
                label: upperCaseString(item.role),
                count: item.count,
              }))}
            />
          )}
          {hasData(data.userStatus, 'results') && (
            <PieCard
              title="User Status"
              data={data.userStatus.results.map((item: any) => ({
                label: upperCaseString(item.status),
                count: item.count,
              }))}
            />
          )}
        </div>
      </div>

      {/* Subscription Analytics */}
      <div>
        {(hasData(data.subscriptionPlans, 'results') ||
        hasData(data.subscriptionStatus, 'results') ||
        data.subscriptionChurn?.churn_rate != null ||
        hasData(data.newSubscriptions, 'results'))
        &&
        <h2 className="text-2xl font-semibold mb-4">Subscription Analytics</h2>
        }
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {hasData(data.subscriptionPlans, 'results') && (
            <PieCard
              title="Subscription Plans"
              data={data.subscriptionPlans.results.map((item: any) => ({
                plan_name: item.plan_name,
                count: item.subscriber_count ?? item.count,
              }))}
            />
          )}
          {hasData(data.subscriptionStatus, 'results') && (
            <PieCard
              title="Subscription Status"
              data={data.subscriptionStatus.results.map((item: any) => ({
                label: upperCaseString(item.status),
                count: item.count,
              }))}
            />
          )}
          {data.subscriptionChurn?.churn_rate != null && (
            <StatCard 
              title="Churn Rate (30d)" 
              value={`${(data.subscriptionChurn.churn_rate * 100).toFixed(2)}%`}
              subtitle={`${data.subscriptionChurn.churn_count_last_30_days || 0} cancellations`}
            />
          )}
        </div>

        {hasData(data.newSubscriptions, 'results') && (
          <div className="mt-6">
            <ChartCard
              title="New Subscriptions"
              description="New subscriptions over time"
              chartData={data.newSubscriptions.results}
              dataKey="new_subscriptions"
            />
          </div>
        )}
      </div>

      {/* Revenue Analytics */}
      <div>
        {(hasData(data.revenueSummary) ||
        hasData(data.revenueTimeseries, 'results') ||
        hasData(data.revenuePlan, 'results') ||
        hasData(data.paymentStatus, 'results') ||
        hasData(data.paymentProcessor, 'results') ||
        hasData(data.topUsers, 'results')
      
      )
        &&
                <h2 className="text-2xl font-semibold mb-4">Revenue Analytics</h2>

        }
        {hasData(data.revenueSummary) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {data.revenueSummary.revenue_last_30_days != null && (
              <StatCard 
                title="Revenue (30d)" 
                value={formatCurrency(data.revenueSummary.revenue_last_30_days)} 
              />
            )}
            {data.revenueSummary.total_revenue_all_time != null && (
              <StatCard 
                title="All-Time Revenue" 
                value={formatCurrency(data.revenueSummary.total_revenue_all_time)} 
              />
            )}
            {data.revenueSummary.subscription_revenue_last_30_days != null && (
              <StatCard 
                title="Subscription Revenue (30d)" 
                value={formatCurrency(data.revenueSummary.subscription_revenue_last_30_days)} 
              />
            )}
            {data.revenueSummary.ppv_revenue_last_30_days != null && (
              <StatCard 
                title="Pay-Per-View Revenue (30d)" 
                value={formatCurrency(data.revenueSummary.ppv_revenue_last_30_days)} 
              />
            )}
          </div>
        )}

        {hasData(data.revenueTimeseries, 'results') && (
          <div className="mt-6">
            <ChartCard
              title="Revenue Timeline"
              description="Revenue over time"
              chartData={data.revenueTimeseries.results}
              dataKey="revenue"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {hasData(data.revenuePlan, 'results') && (
            <PieCard
              title="Revenue by Plan"
              data={data.revenuePlan.results.map((item: any) => ({
                plan_name: item.plan_name,
                value: item.revenue_last_30 ?? item.revenue,
              }))}
            />
          )}
          {hasData(data.paymentStatus, 'results') && (
            <PieCard
              title="Payment Status"
              data={data.paymentStatus.results.map((item: any) => ({
                label: upperCaseString(item.status),
                count: item.count,
              }))}
            />
          )}
        </div>

        {hasData(data.paymentProcessor, 'results') && (
          <div className="mt-6">
            <PieCard
              title="Payment Processors"
              data={data.paymentProcessor.results.map((item: any) => ({
                processor: upperCaseString(item.processor),
                count: item.count,
              }))}
            />
          </div>
        )}

        {hasData(data.topUsers, 'results') && (
          <div className="mt-6">
            <TableCard
              title="Top Paying Users"
              columns={[
                { key: "email", label: "Email" },
                { key: "total_spent", label: "Total Spent", format: formatCurrency },
                { key: "subscription_spent", label: "Subscription", format: formatCurrency },
                { key: "ppv_spent", label: "PPV", format: formatCurrency },
              ]}
              data={data.topUsers.results}
            />
          </div>
        )}
      </div>

      {/* Content Analytics */}
      <div>
        {(hasData(data.topMovies, 'results') ||
        hasData(data.topSeries, 'results') ||
        hasData(data.topEpisodes, 'results') ||
        hasData(data.completionRates, 'results') ||
        hasData(data.dropoffAnalysis, 'results')
      
      )
        &&
                <h2 className="text-2xl font-semibold mb-4">Content Analytics</h2>

        }
        
        <div className="space-y-6">
          {hasData(data.topMovies, 'results') && (
            <TableCard
              title="Top Movies"
              columns={[
                { key: "title", label: "Title" },
                { key: "views", label: "Views" },
                { key: "watch_time_hours", label: "Watch Hours", format: (v: number) => v?.toFixed(1) || "0" },
                { key: "completion_rate", label: "Completion", format: (v: number) => v ? `${(v * 100).toFixed(1)}%` : "0%" },
              ]}
              data={data.topMovies.results}
            />
          )}

          {hasData(data.topSeries, 'results') && (
            <TableCard
              title="Top Series"
              columns={[
                { key: "title", label: "Title" },
                { key: "views", label: "Views" },
                { key: "watch_time_hours", label: "Watch Hours", format: (v: number) => v?.toFixed(1) || "0" },
                { key: "completion_rate", label: "Completion", format: (v: number) => v ? `${(v * 100).toFixed(1)}%` : "0%" },
              ]}
              data={data.topSeries.results}
            />
          )}

          {hasData(data.topEpisodes, 'results') && (
            <TableCard
              title="Top Episodes"
              columns={[
                { key: "title", label: "Title" },
                { key: "series_title", label: "Series" },
                { key: "views", label: "Views" },
              ]}
              data={data.topEpisodes.results}
            />
          )}

          {hasData(data.completionRates, 'results') && (
            <TableCard
              title="Completion Rates by Content"
              columns={[
                { key: "title", label: "Title" },
                { key: "visibility_mode", label: "Mode" },
                { key: "completion_rate", label: "Completion", format: (v: number) => `${(v * 100).toFixed(1)}%` },
                { key: "views", label: "Views" },
              ]}
              data={data.completionRates.results}
            />
          )}

          {hasData(data.dropoffAnalysis, 'results') && (
            <TableCard
              title="Dropoff Analysis"
              columns={[
                { key: "title", label: "Title" },
                { key: "avg_dropoff_percent", label: "Avg Dropoff", format: (v: number) => `${v?.toFixed(1) || 0}%` },
                { key: "peak_dropoff_time_seconds", label: "Peak Dropoff Time", format: formatSeconds },
              ]}
              data={data.dropoffAnalysis.results}
            />
          )}
        </div>
      </div>

      {/* Engagement Analytics */}
      <div>
        {( 
        hasData(data.engagementDevices, 'results') ||
        hasData(data.engagementPeakHours, 'results') ||
        hasData(data.engagementTimeline, 'results') ||
        hasData(data.engagementActive) ||
        hasData(data.engagementWatchTime)
      
      )
        &&
                     <h2 className="text-2xl font-semibold mb-4">Engagement Analytics</h2>


        }
        {hasData(data.engagementActive) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {data.engagementActive.dau != null && (
              <StatCard title="DAU" value={data.engagementActive.dau.toLocaleString()} />
            )}
            {data.engagementActive.wau != null && (
              <StatCard title="WAU" value={data.engagementActive.wau.toLocaleString()} />
            )}
            {data.engagementActive.mau != null && (
              <StatCard title="MAU" value={data.engagementActive.mau.toLocaleString()} />
            )}
          </div>
        )}

        {hasData(data.engagementWatchTime) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {data.engagementWatchTime.total_watch_seconds != null && (
              <StatCard
                title="Total Watch Time"
                value={formatSeconds(data.engagementWatchTime.total_watch_seconds)}
              />
            )}
            {data.engagementWatchTime.avg_watch_per_user_seconds != null && (
              <StatCard
                title="Avg Watch / User"
                value={formatSeconds(data.engagementWatchTime.avg_watch_per_user_seconds)}
              />
            )}
            {data.engagementWatchTime.avg_watch_per_session_seconds != null && (
              <StatCard
                title="Avg Watch / Session"
                value={formatSeconds(data.engagementWatchTime.avg_watch_per_session_seconds)}
              />
            )}
          </div>
        )}

        {hasData(data.engagementDevices, 'results') && (
          <div className="mt-6">
            <PieCard
              title="Device Breakdown"
              data={data.engagementDevices.results.map((item: any) => ({
                device_type: upperCaseString(item.device_type),
                count: item.views ?? item.count,
              }))}
            />
          </div>
        )}

        {hasData(data.engagementTimeline, 'results') && (
          <div className="mt-6">
            <ChartCard
              title="Engagement Timeline"
              description="User engagement over time"
              chartData={data.engagementTimeline.results}
              dataKey="active_users"
            />
          </div>
        )}

        {hasData(data.engagementPeakHours, 'results') && (
          <div className="mt-6">
            <TableCard
              title="Peak Hours"
              columns={[
                { key: "hour", label: "Hour (UTC)", format: (h: number) => `${h}:00` },
                { key: "event_count", label: "Views Count" }, 
              ]}
              data={data.engagementPeakHours.results }
            />
          </div>
        )}
      </div>
    </div>
  );
}