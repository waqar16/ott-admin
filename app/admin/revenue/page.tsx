 "use client"

import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/lib/config";
import Cookies from "js-cookie";
export default function CreatorReportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const query = filters.start_date && filters.end_date
        ? `?start_date=${filters.start_date}&end_date=${filters.end_date}`
        : "";

      const res = await axios.get(`${API_BASE}api/v1/admin-dashboard/creator-report${query}`,
        { 
      headers: {
        "Content-Type": "application/json", 
        Authorization: `Bearer ${Cookies.get('access_token')}`,
      }
    }

      );
     
      setData(res.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
const downloadExcelReport = async () => {
  try {
    setDownloadLoading(true);
    const query = filters.start_date && filters.end_date
      ? `?start_date=${filters.start_date}&end_date=${filters.end_date}`
      : "";

    const res = await axios.get(
      `${API_BASE}api/v1/admin-dashboard/creator-report/excel${query}`,
      { 
        headers: {
          "Content-Type": "application/json", 
          Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
        responseType: 'blob', // Important: Handle binary data
      }
    );
    
    // Create a blob from the response
    const blob = new Blob([res.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Set filename with date range if filters exist
    const filename = filters.start_date && filters.end_date
      ? `creator-report_${filters.start_date}_${filters.end_date}.xlsx`
      : `creator-report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    link.setAttribute('download', filename);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
  } catch (err) {
    console.error('Error downloading report:', err);
    // Optional: Show error toast/notification to user
  } finally {
    setDownloadLoading(false);
  }
};
  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 text-white space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Creators Revenue</h1>
          <p className="text-neutral-400">Analytics of all creators Revenue.</p>
        </div>

        
      </div>
      <div className="flex gap-4 flex-row items-center justify-end  w-full">
        <div className="mr-2">
          <label className="text-sm mr-2">Start Date</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="bg-neutral-800 px-3 py-2 rounded"
          />
        </div>
        <div className="mr-2">
          <label className="text-sm mr-2">End Date</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="bg-neutral-800 px-3 py-2 rounded"
          />
        </div>
        <div className="flex flex-row items-center justify-end w-auto">
          <button
          onClick={handleFilter}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Apply
        </button>
        </div>
      </div> 
        
        <div className="flex flex-row items-center justify-end w-auto">
          <button
          onClick={downloadExcelReport}
          className="bg-blue-600 px-4 py-2 rounded"
        >
  {downloadLoading ? 'Downloading...' : 'Download Excel Report'}
  
        </button> 
      </div>
   
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Views" value={data.summary.total_unique_views} />
        <Card title="Revenue" value={data.summary.total_revenue} />
        <Card title="Creators" value={data.summary.total_creators} />
        <Card title="Avg Views" value={data.summary.avg_views_per_creator} />
      </div>

      {/* Top Performer */}
      {data.top_performer!=null && <PerformerCard title="Top Performer" performer={data.top_performer} />}

      {/* Lowest Performer */}
      {data.lowest_performer!=null &&  <PerformerCard title="Lowest Performer" performer={data.lowest_performer} />}

      {/* Creators List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Creators</h2>
        {data?.creators?.length == 0 ? 
          <h1>No Creator to show</h1>:
       <>
        {data.creators.map((creator, index) => (
          <div key={index} className="bg-neutral-800 p-4 rounded-xl">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {creator.creator_name || "UrView Creator"}
                </h3>
                <p className="text-sm text-neutral-400">
                  Views: {creator.unique_views} | Share: {creator.percentage_of_total_views}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-400">${creator.earning}</p>
              </div>
            </div>

            <div className="mt-3">
              <h4 className="text-sm mb-2">Top Contents</h4>
              <div className="space-y-1">
                {creator.top_contents.map((content) => (
                  <div
                    key={content.content_id}
                    className="flex justify-between text-sm bg-neutral-700 px-3 py-1 rounded"
                  >
                    <span>{content.title}</span>
                    <span>{content.views} views</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}</>
       }
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-neutral-800 p-4 rounded-xl shadow">
      <p className="text-sm text-neutral-400">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

function PerformerCard({ title, performer }) {
  return (
    <div className="bg-neutral-800 p-4 rounded-xl">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>

      <div className="flex justify-between mb-3">
        <div>
          <p className="text-lg">
            {performer.creator_name || "UrView Creator"}
          </p>
          <p className="text-sm text-neutral-400">
            Views: {performer.unique_views} | Share: {performer.percentage_of_total_views}%
          </p>
        </div>
        <div className="text-right text-green-400">
          ${performer.earning}
        </div>
      </div>

      <div>
        <h4 className="text-sm mb-2">Top Contents</h4>
        <div className="space-y-1">
          {performer.top_contents.map((content) => (
            <div
              key={content.content_id}
              className="flex justify-between text-sm bg-neutral-700 px-3 py-1 rounded"
            >
              <span>{content.title}</span>
              <span>{content.views} views</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
