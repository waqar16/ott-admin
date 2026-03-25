 
'use client';

import { useCallback, useEffect, useState } from "react";
import { listContent } from "@/lib/contentApi";
import SeriesTree from "@/components/SeriesTree";
import SeriesSkeleton from "@/components/SeriesSkeleton";
import Cookies from "js-cookie";
import { API_BASE } from "@/lib/config";
import ContentEditor from "@/components/admin/content/ContentEditor.client";
import { Content } from "@/lib/types/content";
import { usePathname } from "next/navigation";
import { BiRefresh } from "react-icons/bi";
import UploadTrailerClient from "@/components/admin/content/UploadTrailerClient";
import AdminContentHelpPanel from '@/components/admin/content/AdminContentHelpPanel';
export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); 
  const [showAddSeries, setShowAddSeries] = useState(false);
const [creatingSeries, setCreatingSeries] = useState(false);
const [seriesTitle, setSeriesTitle] = useState("");
const [seriesDescription, setSeriesDescription] = useState("");
   const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [open,setOpen] = useState(false);
function openAddSeriesModal() {
  setShowAddSeries(true);
}
async function createSeries() {
  try {
    setCreatingSeries(true);
    const token = Cookies.get("access_token"); 

    const res = await fetch(`${API_BASE}api/v1/content/contents/series`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: seriesTitle,
        description: seriesDescription,
      }),
    });

    if (!res.ok) throw new Error("Failed to create series");

    let newS = await res.json();
    setShowAddSeries(false);
setSeriesList(prev => [...prev, newS]);
    setSeriesDescription("");

    // fetchContent(); // refresh list
  } catch (error) {
    console.error(error);
    alert("Error creating series.");
  } finally {
    setCreatingSeries(false);
  }
}
let pathname = usePathname()
  async function fetchSeries() {
    setLoading(true);
    try {
      const data = await listContent({ media_type: "series",content_type:pathname.includes('movie')?'movie':
            pathname.includes('document')?'documentary':
            pathname.includes('trailer')?'trailer':
            pathname.includes('series')?'series':
            pathname.includes('episode')?'episode':"movie"
          , });
      setSeriesList(data.results ?? data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSeries();
  }, []);

  const filtered = seriesList.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen   text-white p-2 md:p-6 mt-16 md:mt-0">
      {/* Top Section */}
      <div className="flex justify-between items-center md:mb-6 mb-2">
        <input
          type="text"
          placeholder="Search Series"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-neutral-800 px-4 py-2 rounded-lg md:w-1/3 w-7/12 outline-none md:text-lg text-sm"
        />

        <button
          className="px-5 py-2 bg-[var(--main-color)] rounded-lg hover:bg-neutral-900 md:text-lg text-sm "
         onClick={openAddSeriesModal}

        >
          Add New Series
        </button>
      </div>
<div className='flex flex-row items-center w-full justify-end p-2'>
  <button className='p-2 rounded-md bg-neutral-800 flex flex-row items-center' onClick={()=>{ 
    fetchSeries()
  }}>Refresh <BiRefresh className='ml-1'/> </button>
</div>
      <AdminContentHelpPanel />

      {/* Loading Skeleton */}
      {loading ? (
        <SeriesSkeleton />
      ) : (
        <SeriesTree
        setSeriesList={setSeriesList}
          seriesList={filtered}
          refresh={fetchSeries}
           setSelectedContent={setSelectedContent}
          editSeriesHandler={()=>{setShowAddSeries(true)}}
        />
      )}
      {showAddSeries && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
    <div className="bg-neutral-800 rounded-lg w-full max-w-lg p-6 space-y-4">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Add New Series</h2>
        <button
          onClick={() => setShowAddSeries(false)}
          className="text-neutral-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-neutral-300 mb-1 block">Series Title</label>
          <input
            type="text"
            value={seriesTitle}
            onChange={(e) => setSeriesTitle(e.target.value)}
            className="w-full bg-neutral-700 border border-neutral-600 rounded px-3 py-2 outline-none"
            placeholder="Enter series title"
          />
        </div>

        <div>
          <label className="text-neutral-300 mb-1 block">Description</label>
          <textarea
            value={seriesDescription}
            onChange={(e) => setSeriesDescription(e.target.value)}
            className="w-full bg-neutral-700 border border-neutral-600 rounded px-3 py-2 outline-none h-24"
            placeholder="Enter series description"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setShowAddSeries(false)}
          className="px-4 py-2 bg-neutral-600 rounded-lg hover:bg-neutral-500"
        >
          Cancel
        </button>
        <button
          disabled={creatingSeries}
          onClick={createSeries}
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {creatingSeries ? "Creating..." : "Create Series"}
        </button>
      </div>
    </div>
  </div>
)}

   
    {showAddSeries && (
           <ContentEditor
           setContent={setSeriesList}
             content={selectedContent} 
             onClose={()=>{
              
              setShowAddSeries(false)
            fetchSeries()
            }}
             onSuccess={()=>setShowAddSeries(false)}
             contentType={'series'}
           />
         )} </div>
  );
}
