// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import {  useRouter } from 'next/navigation';
// import { Content, ContentFilters, ApiError, Rendition } from '@/lib/types/content';
// import { listContent, getContent, getRenditions, getStreamingUrl } from '@/lib/contentApi';
// import ContentEditor from '@/components/admin/content/ContentEditor.client';
// import RoundLoader from '@/components/Loader/RoundLoader';
// import SkeletonLoader from '@/components/Loader/SkeletonLoader';
// import ContentHeaderComponent from '@/components/Content/ContentHeader';
// import ContentLoading from '@/components/Content/ContentLoading';
// import ContentFilter from '@/components/Content/ContentFilter';

// export default function ContentManagementPage() {
   
//   const router = useRouter();
//   const [content, setContent] = useState<Content[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showEditor, setShowEditor] = useState(false);
//   const [selectedContent, setSelectedContent] = useState<Content | null>(null);
//   const [detailContent, setDetailContent] = useState<Content | null>(null);
//   const [showDetails, setShowDetails] = useState(false);
//   const [renditions, setRenditions] = useState<Rendition[]>([]);
//   const [videoUrl, setVideoUrl] = useState<string | null>(null);
//   const [videoUrlLoading, setVideoUrlLoading] = useState<boolean>(false);
//   const [loadingRenditions, setLoadingRenditions] = useState(false);

//   // Filter state
//   const [filters, setFilters] = useState<ContentFilters>({
//     status: undefined,
//     content_type: undefined,
//     is_kid_safe: undefined,
//     is_ppv: undefined,
//     media_type: "series"
//   });

//   const fetchContent = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const result: any = await listContent(filters as any);
//       const items = Array.isArray(result)
//         ? result
//         : (result?.results ?? result?.content ?? []);
//       setContent(items as Content[]);
//     } catch (err) {
//       const apiError = err as ApiError;
//       setError(apiError.message || 'Failed to load content');
//       console.error('Error fetching content:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   useEffect(() => {
//     // Always fetch content on mount and filter changes
//     fetchContent();
//   }, [fetchContent]);

//   function handleCreateNew() {
//     setSelectedContent(null);
//     setShowEditor(true);
//   }

//   function handleEdit(item: Content) {
//     setSelectedContent(item);
//     setShowEditor(true);
//   }

//   async function handleViewDetails(item: Content) {
//     try {
//       setVideoUrlLoading(true);
//       setLoadingRenditions(true);
//       setRenditions([]);
//       const details = await getContent(item.id);
//       setDetailContent(details);
//       setShowDetails(true);

//       // Fetch renditions
//       try {
//         const urlPayload = await getStreamingUrl(item.id);
//         setVideoUrlLoading(false);

//         setVideoUrl(urlPayload.playback_url);
//       } catch (rendErr) {
//         console.error('Error fetching renditions:', rendErr);
//         // Don't fail the whole operation if renditions fail
//       }
//     } catch (err) {
//       const apiError = err as ApiError;
//       setError(apiError.message || 'Failed to load content details');
//     } finally {
//       setLoadingRenditions(false);
//     }
//   }

//   function handleEditorClose() {
//     setShowEditor(false);
//     setSelectedContent(null);
//   }

//   function handleEditorSuccess(updatedContent: Content) {
//     // Refresh list
//     fetchContent();
//     // Close editor after a short delay to show success message
//     setTimeout(() => {
//       handleEditorClose();
//     }, 2000);
//   }

//   function handleDetailsClose() {
//     setShowDetails(false);
//     setDetailContent(null);
//   }

//   function getStatusBadge(status: string) {
//     const colors = {
//       draft: 'bg-neutral-600',
//       processing: 'bg-yellow-600',
//       published: 'bg-green-600',
//       inactive: 'bg-neutral-700',
//     } as const;
//     return (colors as any)[status] || 'bg-neutral-600';
//   }

//   function formatBitrate(bitrate: number): string {
//     if (bitrate >= 1000000) {
//       return `${(bitrate / 1000000).toFixed(1)} Mbps`;
//     } else if (bitrate >= 1000) {
//       return `${(bitrate / 1000).toFixed(0)} Kbps`;
//     }
//     return `${bitrate} bps`;
//   }

//   function getQualityBadgeColor(quality: string): string {
//     switch (quality.toLowerCase()) {
//       case '4k':
//       case 'uhd':
//         return 'bg-purple-600';
//       case '1080p':
//       case 'fhd':
//         return 'bg-blue-600';
//       case '720p':
//       case 'hd':
//         return 'bg-green-600';
//       case '480p':
//       case 'sd':
//         return 'bg-yellow-600';
//       default:
//         return 'bg-neutral-600';
//     }
//   }

//   return (
//     <div className="min-h-screen bg-neutral-900 text-white">
//       {/* Header */}
//       <ContentHeaderComponent handleCreateNew={handleCreateNew} />


//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Loading Spinner */}


//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
//             {error}
//           </div>
//         )}
//         {loading ? (
//                     <ContentLoading/>
          

//         )
//           :
//           <>
//                      <ContentFilter filters={filters} setFilters={setFilters}/>


//             {/* Content List */}
//             {!loading && (!content || content.length === 0) ? (
//               <div className="bg-neutral-800 rounded-lg p-12 text-center">
//                 <p className="text-neutral-400 text-lg mb-4">No content found</p>
//                 <button
//                   onClick={handleCreateNew}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Create Your First Content
//                 </button>
//               </div>
//             ) : (
//               <div className="grid gap-4">
//                 {content && content.map((item) => (
//                   <div
//                     key={item.id}
//                     className="bg-neutral-800 rounded-lg p-6 hover:bg-neutral-750 transition-colors"
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-2">
//                           <h3 className="text-xl font-semibold">{item.title}</h3>
//                           <div className={`flex flex-row items-center ${getStatusBadge(item.status)} rounded-full px-2 py-[2px]`}>
//                             <span
//                               className={` py-1 rounded-full text-xs font-bold text-white capitalize`}
//                             >
//                               {item.ingest_status as string}
//                             </span>
//                             {/* <span
//                         className={` py-1 rounded-full text-xs font-bold text-white capitalize`}
//                       >
//                         {item.transcoding_progress  != null && item.status === 'processing'
//                           ? ` - ${item.transcoding_progress}%`
//                           : ''}
//                       </span> */}
//                           </div>
//                           {item.is_kid_safe && (
//                             <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">
//                               Kid Safe
//                             </span>
//                           )}
//                           {item.is_ppv && (
//                             <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">
//                               PPV ${(item?.price_cents??0 / 100).toFixed(2)}
//                             </span>
//                           )}
//                         </div>

//                         <p className="text-neutral-400 mb-3 line-clamp-2">{item.description}</p>

//                         <div className="flex items-center gap-4 text-sm text-neutral-500">
//                           <span>Type: {item.content_type}</span>
//                           <span>•</span>
//                           <span>Media: {item.media_type}</span>
//                           <span>•</span>
//                           <span>ID: {item.id}</span>
//                         </div>
//                       </div>

//                       <div className="flex gap-2 ml-4">
//                         <button
//                           onClick={() => handleViewDetails(item)}
//                           className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
//                         >
//                           Details
//                         </button>
//                         <button
//                           onClick={() => handleEdit(item)}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                         >
//                           Edit
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}</>
//         }
//       </div>

//       {/* Content Editor Modal */}
//       {showEditor && (
//         <ContentEditor
//           content={selectedContent} 
//           setContent={setContent}
//           onClose={handleEditorClose}
//           onSuccess={handleEditorSuccess}
//         />
//       )}

//       {/* Content Details Modal */}
//       {showDetails && detailContent && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <div className="bg-neutral-800 rounded-lg max-w-6xl w-full my-8">
//             {/* Header */}
//             <div className="flex items-center justify-between p-6 border-b border-neutral-700">
//               <h2 className="text-2xl font-bold text-white">Content Details</h2>
//               <button
//                 onClick={handleDetailsClose}
//                 className="text-neutral-400 hover:text-white transition-colors"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             {/* Content */}
//             <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
//               {/* Basic Info */}
//               <div>
//                 <h3 className="text-xl font-bold mb-4">{detailContent.title}</h3>
//                 <p className="text-neutral-300">{detailContent.description}</p>
//               </div>

//               {/* Images */}
//               {(detailContent.poster_url || detailContent.banner_url) && (
//                 <div className="grid grid-cols-2 gap-4">
//                   {detailContent.poster_url && (
//                     <div>
//                       <h4 className="text-sm font-semibold text-neutral-400 mb-2">Poster</h4>
//                       <img
//                         src={detailContent.poster_url}
//                         alt="Poster"
//                         className="w-full rounded-lg"
//                       />
//                     </div>
//                   )}
//                   {detailContent.banner_url && (
//                     <div>
//                       <h4 className="text-sm font-semibold text-neutral-400 mb-2">Banner</h4>
//                       <img
//                         src={detailContent.banner_url}
//                         alt="Banner"
//                         className="w-full rounded-lg"
//                       />
//                     </div>
//                   )}
//                 </div>
//               )}
//               {videoUrlLoading && <RoundLoader className='' />}
//               {videoUrl && (
//                 <div>
//                   <h4 className="text-sm font-semibold text-neutral-400 mb-2">Video</h4>
//                   <video
//                     src={videoUrl}
//                     controls
//                     className="w-full rounded-lg"
//                   >
//                     Your browser does not support the video tag.
//                   </video>
//                 </div>
//               )}
//               {/* Renditions */}
//               <div>
//                 <h3 className="text-xl font-bold text-white mb-4">
//                   Available Renditions {renditions.length > 0 && `(${renditions.length})`}
//                 </h3>

//                 {loadingRenditions ? (
//                   <div className="bg-neutral-800 rounded-lg p-8 text-center">
//                     <p className="text-neutral-400">Loading renditions...</p>
//                   </div>
//                 ) : renditions.length === 0 ? (
//                   <div className="bg-neutral-800 rounded-lg p-8 text-center">
//                     <p className="text-neutral-400">No renditions available yet.</p>
//                     <p className="text-sm text-neutral-500 mt-2">
//                       Renditions will appear here once transcoding is complete.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid gap-4">
//                     {renditions.map((rendition) => (
//                       <div
//                         key={rendition.id}
//                         className="bg-neutral-800 rounded-lg p-4 hover:bg-neutral-750 transition-colors"
//                       >
//                         <div className="flex items-start justify-between mb-3">
//                           <div className="flex items-center gap-3">
//                             <span
//                               className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getQualityBadgeColor(rendition.quality_label)}`}
//                             >
//                               {rendition.quality_label}
//                             </span>

//                             <span
//                               className={`px-2 py-1 rounded text-xs font-medium ${rendition.status === 'ready'
//                                   ? 'bg-green-900/50 text-green-300'
//                                   : rendition.status === 'processing'
//                                     ? 'bg-yellow-900/50 text-yellow-300'
//                                     : 'bg-neutral-700 text-neutral-300'
//                                 }`}
//                             >
//                               {rendition.status}
//                             </span>
//                           </div>

//                           {rendition.file_size_bytes && (
//                             <span className="text-sm text-neutral-400">
//                               {(rendition.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
//                             </span>
//                           )}
//                         </div>

//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                           {(rendition.width && rendition.height) && (
//                             <div>
//                               <span className="text-neutral-500">Resolution:</span>
//                               <span className="text-white ml-2">
//                                 {rendition.width}x{rendition.height}
//                               </span>
//                             </div>
//                           )}

//                           {rendition.bitrate && (
//                             <div>
//                               <span className="text-neutral-500">Bitrate:</span>
//                               <span className="text-white ml-2">
//                                 {formatBitrate(rendition.bitrate)}
//                               </span>
//                             </div>
//                           )}

//                           {rendition.format && (
//                             <div>
//                               <span className="text-neutral-500">Format:</span>
//                               <span className="text-white ml-2 uppercase">
//                                 {rendition.format}
//                               </span>
//                             </div>
//                           )}

//                           {rendition.codec && (
//                             <div>
//                               <span className="text-neutral-500">Codec:</span>
//                               <span className="text-white ml-2 uppercase">
//                                 {rendition.codec}
//                               </span>
//                             </div>
//                           )}
//                         </div>

//                         {rendition.url && (
//                           <div className="mt-3 pt-3 border-t border-neutral-700">
//                             <details className="cursor-pointer">
//                               <summary className="text-sm text-neutral-400 hover:text-white">
//                                 View URLs
//                               </summary>
//                               <div className="mt-2 space-y-2">
//                                 <div>
//                                   <span className="text-xs text-neutral-500 block mb-1">
//                                     Playback URL:
//                                   </span>
//                                   <code className="text-xs text-blue-400 bg-neutral-900 px-2 py-1 rounded block overflow-x-auto">
//                                     {rendition.url}
//                                   </code>
//                                 </div>
//                                 {rendition.manifest_url && (
//                                   <div>
//                                     <span className="text-xs text-neutral-500 block mb-1">
//                                       Manifest URL:
//                                     </span>
//                                     <code className="text-xs text-blue-400 bg-neutral-900 px-2 py-1 rounded block overflow-x-auto">
//                                       {rendition.manifest_url}
//                                     </code>
//                                   </div>
//                                 )}
//                               </div>
//                             </details>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
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
export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); 
  const [showAddSeries, setShowAddSeries] = useState(false);
const [creatingSeries, setCreatingSeries] = useState(false);
const [seriesTitle, setSeriesTitle] = useState("");
const [seriesDescription, setSeriesDescription] = useState("");
   const [selectedContent, setSelectedContent] = useState<Content | null>(null);
 
function openAddSeriesModal() {
  setShowAddSeries(true);
}
async function createSeries() {
  try {
    setCreatingSeries(true);
    const token = Cookies.get("access_token"); 

    const res = await fetch(`${API_BASE}api/v1/content/contents/series/`, {
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
             onClose={()=>setShowAddSeries(false)}
             onSuccess={()=>setShowAddSeries(false)}
             contentType={'series'}
           />
         )} </div>
  );
}
