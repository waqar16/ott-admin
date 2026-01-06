"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import ReactECharts from "echarts-for-react";
import SkeletonLoader from "@/components/Loader/SkeletonLoader";
import { API_BASE } from "@/lib/config";

// Generic ChartCard
export function ChartCard({ title, description, chartData, type = "line" }: any) {
  const option = {
    tooltip: { trigger: "axis", backgroundColor: "#1f2937", textStyle: { color: "#fff" } },
    xAxis: { type: "category", data: chartData.map((d: any) => d.date), axisLine: { lineStyle: { color: "#ccc" } } },
    yAxis: { type: "value", axisLine: { lineStyle: { color: "#ccc" } } },
    grid: { left: "10%", right: "5%", bottom: "10%", top: "20%" },
    series: [
      {
        data: chartData.map((d: any) => d.count ?? d.total_revenue ?? d.value),
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
        fetchAPI("api/v1/admin-dashboard/engagement/active-users/"),
        fetchAPI("api/v1/admin-dashboard/engagement/watch-time/"),
        fetchAPI("api/v1/admin-dashboard/engagement/devices/"),
        fetchAPI("api/v1/admin-dashboard/engagement/timeline/"),
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

if (loading)
    return (
      <div className="p-6 space-y-6 ">
        <SkeletonLoader className="h-56 w-full bg-neutral-900" />
        <div className="grid grid-cols-2 gap-6">
          <SkeletonLoader className="h-56 w-full bg-neutral-900" />
          <SkeletonLoader className="h-56 w-full bg-neutral-900" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <SkeletonLoader className="h-56 w-full bg-neutral-900" />
          <SkeletonLoader className="h-56 w-full bg-neutral-900" />
          <SkeletonLoader className="h-56 w-full bg-neutral-900" />
        </div>
      </div>
    );
  return (
    <div className="p-6 space-y-8  text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <ChartCard
  title="User Growth"
  description="New users per day"
  chartData={data.userGrowth?.results ?? []}
/>

<ChartCard
  title="Active Users"
  description="Daily active users"
  chartData={data.activeUsers?.results ?? []}
/>
      </div>

      <div className="grid grid-cols-3 gap-6">
       <PieCard
  title="User Roles"
  data={Object.entries(data.userRoles ?? {}).map(([k, v]) => ({ label: k, count: v }))}
/>

<PieCard
  title="User Status"
  data={Object.entries(data.userStatus ?? {}).map(([k, v]) => ({ label: k, count: v }))}
/>

<PieCard
  title="Subscription Status"
  data={Object.entries(data.subscriptionStatus ?? {}).map(([k, v]) => ({ label: k, count: v }))}
/>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard title="Churn Rate" value={`${data.subscriptionChurn.churn_rate_percent}%`} />
        <ChartCard title="New Subscriptions" description="Subscriptions per day" chartData={data.newSubscriptions.results?? []} />
        <ChartCard title="Revenue Timeseries" description="Revenue per day" chartData={data.revenueTimeseries.results?? []} />
      </div>

      <TableCard title="Top Paying Users" columns={["email", "total_spent", "subscription_count", "last_payment_date"]} data={data.topUsers.results ?? []} />

      <div className="grid grid-cols-3 gap-6">
        <PieCard title="Payment Status" data={Object.entries(data.paymentStatus).map(([k, v]) => ({ label: k, count: v })) ?? []} />
        <PieCard title="Payment Processor" data={data?.paymentProcessor?.results?data.paymentProcessor.results.map((p: any) => ({ label: p.processor, count: p.count })) : []} />
      </div>

      <div className="space-y-6">
        <TableCard title="Top Movies" columns={["title", "views"]} data={data.topMovies.results?? []} />
        <TableCard title="Top Series" columns={["title", "views"]} data={data.topSeries.results?? []} />
        <TableCard title="Top Episodes" columns={["title", "views"]} data={data.topEpisodes.results?? []} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard title="DAU" value={data.engagementActive.dau} />
        <StatCard title="WAU" value={data.engagementActive.wau} />
        <StatCard title="MAU" value={data.engagementActive.mau} />
      </div>

      <ChartCard title="Engagement Timeline" description="DAU & PPV revenue" chartData={data.engagementTimeline.results?? []} />
    </div>
  );
}
