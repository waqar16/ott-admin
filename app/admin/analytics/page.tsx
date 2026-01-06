"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";
import Cookies from "js-cookie";
import SkeletonLoader from "@/components/Loader/SkeletonLoader";
import ReactECharts from "echarts-for-react";
interface ChartCardProps {
  title: string;
  description: string;
  chartData: { date: string; count: number }[];
}

export default function Analytics() { 
  const [chartdata, setChartData] = useState<any>(null);
  const [userChartdata, setUserChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function getDashboardData() {
    try {
      const token = Cookies.get('access_token')
      console.log(token,"token")
      const res = await fetch(`${API_BASE}/api/v1/admin-dashboard/users/growth/
 

`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,  
        },
      });
const res2 = await fetch(`${API_BASE}/api/v1/admin-dashboard/users/active/
 

`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,  
        },
      });
      if (!res.ok || !res2.ok) throw new Error("Failed to fetch dashboard data");

      const json = await res.json();
      const json2 = await res2.json();
      console.log("Dashboard:", json);
      return {json,json2};
    } catch (err: any) {
      console.log("API Error", err);
      setError(err.message);
      return null;
    }
  }

  useEffect(() => {
    async function load() { 
      const d:{json:{results:[]},json2:{results:[]}} = await getDashboardData();
      console.log(d,'d')
      // setData(d.results);
      setChartData(d.json)
      setUserChartData(d.json2)
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
 <div className="p-6 space-y-8 bg-gray-900 flex flex-col items-start w-fll">
  <SkeletonLoader className="h-[30px] w-[300px] bg-white"/>
  <SkeletonLoader className="h-[20px] w-[300px] bg-gray-600 mt-4"/>
  <div className="grid grid-cols-4 w-full gap-6">
{Array.from({length:8}).map(()=>(
  <div className="w-full    bg-gray-800 flex flex-col items-start rounded-lg p-6 border border-gray-700">
      <SkeletonLoader className="h-[20px] w-5/12 bg-gray-600  "/>
      <SkeletonLoader className="h-[20px] w-3/12 bg-white mt-2 "/>
      <SkeletonLoader className="h-[20px] w-3/12 bg-gray-600 mt-4  "/>

     </div>
))
}

  </div>
 <div className="grid grid-cols-3 w-full gap-6">
    {Array.from({length:3}).map(()=>(
  <div className="w-full    bg-gray-800 flex flex-col items-start rounded-lg p-6 border border-gray-700">
      <SkeletonLoader className="h-[20px] w-5/12 bg-gray-600  "/>
      <SkeletonLoader className="h-[20px] w-3/12 bg-white mt-2 "/>
      <SkeletonLoader className="h-[20px] w-3/12 bg-gray-600 mt-4  "/>

     </div>
))
}
  </div>
 </div>
  :     
    <div className="p-6 space-y-4 bg-gray-900 text-white">
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <ChartCard
    title="Monthly User Growth"
    description="Users added per day"
    chartData={userChartdata.results} // your API response [{ date, count }]
  />
  {chartdata && <ChartCard
    title="Total Watch Time"
    description="Hours streamed this month"
    chartData={chartdata.results}
  />}
 
      </div>

      {/* Top Performing Content */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Top Performing Content</h2>
        <div className="space-y-4">
          {[
            { title: "The Last Kingdom", type: "Movie", views: "1.2M" },
            { title: "Planet Earth II", type: "Documentary", views: "942K" },
            { title: "Cyber Hunt", type: "Show", views: "800K" },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
              <div>
                <h3 className="text-white font-medium">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.type}</p>
              </div>
              <span className="text-blue-400 font-semibold">{item.views}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
} </>
  );
}

// function ChartCard({ title, description }: any) {
//   return (
//     <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
//       <div className="flex justify-between mb-4">
//         <div>
//           <h2 className="text-xl font-semibold text-white">{title}</h2>
//           <p className="text-gray-400 text-sm">{description}</p>
//         </div>
//       </div>

//       {/* Mock Chart Placeholder */}
//       <div className="h-56 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
//         Chart Placeholder
//       </div>
//     </div>
//   );
// }

export   function ChartCard({ title, description, chartData }: ChartCardProps) {
 
  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1f2937",
      textStyle: { color: "#fff" },
    },
    xAxis: {
      type: "category",
      data: chartData.map((d) => d.date),
      axisLine: { lineStyle: { color: "#ccc" } },
      axisLabel: { color: "#ccc" },
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#ccc" } },
      axisLabel: { color: "#ccc" },
    },
    grid: { left: "10%", right: "5%", bottom: "10%", top: "20%" },
    series: [
      {
        data: chartData.map((d) => d.count),
        type: "line",
        smooth: true,
        lineStyle: { color: "#3b82f6", width: 3 },
        itemStyle: { color: "#3b82f6" },
        areaStyle: { color: "rgba(59, 130, 246, 0.2)" },
      },
    ],
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>

      <div className="h-56">
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
}