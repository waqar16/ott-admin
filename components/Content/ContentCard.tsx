
import { deleteContent, retryTranscoding } from "@/lib/contentApi"
import { Content, ContentStatus } from "@/lib/types/content"
import { BiCheck, BiEdit, BiLink, BiLoaderAlt, BiTrash } from "react-icons/bi"
import { FiChevronDown, FiInfo, FiLoader, FiRotateCw, FiTablet,FiEyeOff,FiUpload } from "react-icons/fi"
import { toast } from "sonner"
// import { getStatusBadge } from "@/utils/statusBadge"
 import { TranscodingProgress } from "@/app/admin/movie-management/page"
import React from "react"
import UploadTrailerClient from "../admin/content/UploadTrailerClient"
interface ContentCardProps {
  item: Content
  transcodingProgress?: TranscodingProgress
  handleViewDetails: (item: Content) => void
  handleEdit: (item: Content) => void
  publishContent: (id: string) => Promise<{ status: ContentStatus }>
  fetchContent: () => void 
}
export const getStatusBadge = (status?: string) => {
  switch (status) {
    case "draft":
      return "bg-gray-500/20 text-gray-300 border border-gray-500/30";

    case "uploaded":
      return "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30";

    case "ready":
      return "bg-green-500/20 text-green-300 border border-green-500/30";

    case "published":
      return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";

    case "inactive":
      return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";

    case "failed":
      return "bg-red-500/20 text-red-300 border border-red-500/30";

    case "archived":
      return "bg-purple-500/20 text-purple-300 border border-purple-500/30";

    default:
      return "bg-neutral-700 text-neutral-300 border border-neutral-600";
  }
};
const getTranscodingTextColor = (
  phase?: string,
  status?: string
) => {
  if (status === "FAILED") {
    return "text-red-400";
  }

  if (status === "COMPLETE") {
    return "text-green-400";
  }

  switch (phase) {
    case "PROBING":
      return "text-yellow-400";

    case "TRANSCODING":
      return "text-blue-400";

    case "UPLOADING":
      return "text-purple-400";

    default:
      return "text-orange-400";
  }
};
const getTranscodingColor = (
  phase?: string,
  status?: string
) => {
  if (status === "FAILED") {
    return "bg-red-500";
  }

  if (status === "COMPLETE") {
    return "bg-green-500";
  }

  switch (phase) {
    case "UPLOADING FILE":
      return "bg-cyan-500";

    case "PROBING":
      return "bg-yellow-500";

    case "TRANSCODING":
      return "bg-blue-500";

    case "UPLOADING":
      return "bg-purple-500";

    case "COMPLETE":
      return "bg-green-500";

    case "FAILED":
      return "bg-red-500";

    default:
      return "bg-orange-500";
  }
};
const ContentCard: React.FC<ContentCardProps> = ({
  item,
  transcodingProgress,  
  handleViewDetails,
  handleEdit,
  publishContent,
  fetchContent, 
}) => {
  const [confirmText, setConfirmText] = React.useState("");
  const [deleteOpen,setDeleteOpen] = React.useState(false)
  const [deleteLoading,setDeleteLoading] = React.useState(false)
    const [publishOpen,setPublishOpen] = React.useState(false)
  const [publishLoading,setPublishLoading] = React.useState(false)
    const [archiveOpen,setArchiveOpen] = React.useState(false)
  const [archiveLoading,setArchiveLoading] = React.useState(false)
  const [trailerOpen,setTrailerOpen] = React.useState(false)
  
  return (

    
    <div
      key={item.id}
      className="w-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 shadow-lg rounded-2xl flex flex-col hover:shadow-2xl transition-all duration-300 border border-white/10 "
    >
      {/* Left: Thumbnail / Type */}
      <div className=" relative   z-0 w-full h-48 sm:h-32 md:h-36  rounded-t-md   shadow-xl bg-neutral-900  ">

        {/* ===== BACKGROUND IMAGE (FULL CARD) ===== */}
        {  item.banner_url ? (
          <>
            <img
              src={ item.banner_url}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black opacity-60 z-0"></div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-gray-400 z-0">
            No Banner Available
          </div>
        )}

        {/* ===== CONTENT + ACTIONS OVER IMAGE ===== */}
        <div className="absolute inset-0 flex flex-col justify-between p-3">

          {/* Top Row — Title + status (optional) */}
       
          {/* Bottom Row — Buttons */}
          <div className="flex justify-between items-end">
           <div className="flex gap-1">
  {/* View Details */}
  <div className="relative group">
    <button
      onClick={() => handleViewDetails(item)}
      className="p-2 bg-black/70 backdrop-blur-sm text-white 
      rounded-lg hover:bg-black transition"
    >
      <FiInfo size={18} />
    </button>

    <span
      className="text-center w-[100px] pointer-events-none absolute  -top-9 left-1/2 -translate-x-1/2
      rounded-md bg-neutral-600 px-2 py-1 text-xs text-white
      opacity-0 scale-95 translate-y-1
      transition-all duration-200 ease-out
      group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
    >
      View details
    </span>
  </div>

  {/* Edit */}
  {item.content_type !== 'trailer' && (
    <div className="relative group">
      <button
        onClick={() => handleEdit(item)}
        className="p-2 bg-black/70 backdrop-blur-sm text-white 
        rounded-lg hover:bg-black transition"
      >
        <BiEdit size={18} />
      </button>

      <span
        className="text-center w-[100px] pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
        rounded-md bg-neutral-600 px-2 py-1 text-xs text-white
        opacity-0 scale-95 translate-y-1
        transition-all duration-200 ease-out
        group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
      >
        Edit
      </span>
    </div>
  )}

  {/* Delete */}
  <div className="relative group  ">
    <button
      onClick={() => setDeleteOpen(true)}
      className="p-2 bg-black/70 backdrop-blur-sm text-white 
      rounded-lg hover:bg-black transition"
    >
      <BiTrash size={18} />
    </button>

    <span
      className="text-center w-[100px] pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
      rounded-md bg-red-600 px-2 py-1 text-xs text-white
      opacity-0 scale-95 translate-y-1
      transition-all duration-200 ease-out
      group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 "
    >
      Delete
    </span>
  </div>
  {item.content_type !== 'trailer' && 
  <div className="relative group">
    <button
      onClick={() => setTrailerOpen(true)}
      className="p-2 bg-black/70 backdrop-blur-sm text-white 
      rounded-lg hover:bg-black transition"
    >
      <BiLink size={18} />
    </button>

    <span
      className=" text-center w-[100px] pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
      rounded-md bg-neutral-600 px-2 py-1 text-xs text-white
      opacity-0 scale-95 translate-y-1
      transition-all duration-200 ease-out
      group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
    >
      Attach Trailer
    </span>
  </div>}
  {(item.ingest_status == 'ready' &&
  
                 
                (item.status == "ready" || item.status == "archived")) &&
   <div className="relative group">
    <button
          onClick={()=>setPublishOpen(true)}
      className="p-2 bg-black/70 backdrop-blur-sm text-white 
      rounded-lg hover:bg-black transition"
    >
      <BiCheck size={18} />
    </button>

    <span
      className=" text-center w-[100px] pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
      rounded-md bg-neutral-600 px-2 py-1 text-xs text-white
      opacity-0 scale-95 translate-y-1
      transition-all duration-200 ease-out
      group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
    >
      Publish Content
    </span>
  </div>
  }
   {(item.ingest_status == 'ready' && item.status == 'published'  ) &&
   <div className="relative group">
    <button
          onClick={()=>setArchiveOpen(true)}
      className="p-2 bg-black/70 backdrop-blur-sm text-white 
      rounded-lg hover:bg-black transition"
    >
      <FiEyeOff size={18} />
    </button>

    <span
      className=" text-center w-[100px] pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
      rounded-md bg-neutral-600 px-2 py-1 text-xs text-white
      opacity-0 scale-95 translate-y-1
      transition-all duration-200 ease-out
      group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
    >
      Archive Content
    </span>
  </div>
  }
</div>

           

            {/* Right side — Icon buttons */}


          </div>
        </div>
      </div>

      {/* Middle: Content Info */}
      <div className="flex-1 flex flex-col gap-2 p-4 md:p-3 ">
        <div className="flex flex-col items-start w-full ">
           <h3 className={`text-xl font-bold text-white capitalize w-full font-bold line-clamp-1`}>{item.title}</h3>
          <p className={`text-gray-400 text-sm line-clamp-2 capitalize w-full min-h-[40px]`}>{item.description}</p>

          <div className="w-full mt-4 space-y-3">

  {/* TRANSCODING CARD */}
  {transcodingProgress && (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/70 p-4 backdrop-blur-md">

      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 font-semibold">
            Transcoding
          </span>

          <span
            className={`text-sm font-bold ${getTranscodingTextColor(
              transcodingProgress.phase,
              transcodingProgress.status
            )}`}
          >
            {transcodingProgress.phase}
          </span>
        </div>

        {/* <div
          className={`px-3 py-1 rounded-full text-[11px] font-bold border
          ${
            transcodingProgress.status === "COMPLETE"
              ? "bg-green-500/15 text-green-300 border-green-500/30"
              : transcodingProgress.status === "FAILED"
              ? "bg-red-500/15 text-red-300 border-red-500/30"
              : "bg-blue-500/15 text-blue-300 border-blue-500/30"
          }`}
        >
          {transcodingProgress.status}
        </div> */}
      </div>

      <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${getTranscodingColor(
            transcodingProgress.phase,
            transcodingProgress.status
          )}`}
          style={{
            width: `${transcodingProgress.progress}%`,
          }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs">
        <span className="text-neutral-400">
          Processing Video
        </span>

        <span className="font-semibold text-white">
          {transcodingProgress.progress}%
        </span>
      </div>
    </div>
  )}

  {/* STATUS GRID */}
  <div className="grid grid-cols-2 gap-3">

  {/* Upload Status */}
  {item.status !== "published" && (
    <div className="rounded-2xl bg-neutral-900/80 border border-white/5 p-4 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500 mb-2">
        Upload
      </p>

      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset ${getStatusBadge(
          item.status
        )}`}
      >
 
        {item.status}
      </div>
    </div>
  )}

  {/* Visibility */}
  {item.visibility_mode && (
    <div className="rounded-2xl bg-neutral-900/80 border border-white/5 p-4 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500 mb-2">
        Visibility
      </p>

      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset ${getStatusBadge(
          item.visibility_mode
        )}`}
      >
        {item.visibility_mode}
      </div>
    </div>
  )}

  {/* Kid Safe */}
  {item.is_kid_safe && (
    <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-green-200/60 mb-2">
        Audience
      </p>

      <div className="inline-flex items-center gap-2 rounded-full bg-green-500/15 px-3 py-1.5 text-sm font-medium text-green-300 ring-1 ring-green-400/20">
        <div className="h-1.5 w-1.5 rounded-full bg-green-300" />
        Kid Safe
      </div>
    </div>
  )}

  {/* PPV */}
  {item.is_ppv && (
    <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-purple-200/60 mb-2">
        Monetization
      </p>

      <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 px-3 py-1.5 text-sm font-medium text-purple-300 ring-1 ring-purple-400/20">
        <div className="h-1.5 w-1.5 rounded-full bg-purple-300" />
        PPV • ${item?.price || 0}
      </div>
    </div>
  )}
</div>

  {/* FAILED RETRY */}
  {item.ingest_status === "failed" && (
    <button
      onClick={async () => {
        let retry = await retryTranscoding(item.id);

        if (retry) {
          toast.success("Transcoding Retry Initiated");
          fetchContent();
        } else {
          toast.error("Transcoding Retry Failed");
        }
      }}
      className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition"
    >
      <FiRotateCw size={16} />
      Retry Transcoding
    </button>
  )}
</div>

        
        </div>
        {/* Metadata Cards */}


        {/* Collapsible Extra Details */}
        {/* <details className="mt-2 w-full">
          <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">More Details </summary>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bg-neutral-800 px-2 py-1 rounded-md text-gray-300 text-xs font-medium">Type: {item.content_type}</span>
            <span className="bg-neutral-800 px-2 py-1 rounded-md text-gray-300 text-xs font-medium">Media: {item.media_type}</span>
            <span className="bg-neutral-800 px-2 py-1 rounded-md text-gray-300 text-xs font-medium">ID: {item.id}</span>
            {item.content_metadata?.release_year && <span className="bg-neutral-800 px-2 py-1 rounded-md text-gray-300 text-xs font-medium">Year: {item.content_metadata.release_year}</span>}
            {item.content_metadata?.language && <span className="bg-neutral-800 px-2 py-1 rounded-md text-gray-300 text-xs font-medium">Language: {item.content_metadata.language}</span>}
            {Array.isArray(item.genres) && item.genres.length > 0 && <span className="bg-neutral-800 px-2 py-1 rounded-md text-gray-300 text-xs font-medium">Genres: {item.genres.join(', ')}</span>}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-300">
            {Array.isArray(item.content_metadata?.directors) && item.content_metadata?.directors.length > 0 &&

              <span className="bg-neutral-800 px-2 py-1 rounded-md text-gray-300 text-xs font-medium"><strong>Director:</strong> {item.content_metadata.directors.join(', ')}</span>
            }
            {Array.isArray(item.content_metadata?.producers) && item.content_metadata?.producers.length > 0 &&
              <span className="bg-neutral-800 px-2 py-1 rounded-md text-gray-300 text-xs font-medium"><strong>Producer:</strong> {item.content_metadata.producers.join(', ')}</span>

            }
            {Array.isArray(item.content_metadata?.awards) && item.content_metadata?.awards.length > 0 &&
              <span className="bg-neutral-800 px-2 py-1 rounded-md text-gray-300 text-xs font-medium"><strong>Awards:</strong> {item.content_metadata.awards.join(', ')}</span>

            }
          </div>
        </details> */}
      </div>
 {archiveOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-white mb-2">
        Confirm Archive Action 
      </h2>

      <p className="text-sm text-gray-400 mb-4">
        Type <span className="text-white font-medium">"{item.title}"</span> to continue. 
      </p>

      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="Type content name..."
        className="w-full px-4 py-2 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-blue-500"
      />

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => {
            setArchiveOpen(false);
            setConfirmText("");
          }}
          className="px-4 py-2 rounded-md bg-neutral-700 text-white hover:bg-neutral-600"
        >
          Cancel
        </button>

        <button
          disabled={confirmText !== item.title || archiveLoading}
          onClick={async () => {
            setArchiveLoading(true)
                      const res = await publishContent(item.id,'archived');
                      if (res.status === 'archived') {
                        toast.success(`Archived ${item.title}`);
                        setArchiveOpen(false)
                        fetchContent();
                      } else {
                        toast.error('Archiving failed');
                      }
                      setConfirmText("")
            setArchiveLoading(false)

                    }}
          className={`px-4 py-2 rounded-md font-semibold transition
            ${
              confirmText === item.title
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "bg-neutral-700 text-gray-400 cursor-not-allowed"
            }`}
        >
          {archiveLoading ? "Archiving..." : "Archive"}
        </button>
      </div>
    </div>
  </div>
)}
                     {publishOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-white mb-2">
        Confirm Publish Action 
      </h2>

      <p className="text-sm text-gray-400 mb-4">
        Type <span className="text-white font-medium">"{item.title}"</span> to continue. 
      </p>

      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="Type content name..."
        className="w-full px-4 py-2 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-blue-500"
      />

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => {
            setPublishOpen(false);
            setConfirmText("");
          }}
          className="px-4 py-2 rounded-md bg-neutral-700 text-white hover:bg-neutral-600"
        >
          Cancel
        </button>

        <button
          disabled={confirmText !== item.title || publishLoading}
          onClick={async () => {
            setPublishLoading(true)
                      const res = await publishContent(item.id);
                      if (res.status === 'published') {
                        toast.success(`Published ${item.title}`);
                        setPublishOpen(false)
                        fetchContent();
                      } else {
                        toast.error('Publishing failed');
                      }
                      setConfirmText("")
            setPublishLoading(false)

                    }}
          className={`px-4 py-2 rounded-md font-semibold transition
            ${
              confirmText === item.title
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "bg-neutral-700 text-gray-400 cursor-not-allowed"
            }`}
        >
          {publishLoading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  </div>
)}
     {deleteOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-white mb-2">
        Confirm Delete Action 
      </h2>

      <p className="text-sm text-gray-400 mb-4">
        Type <span className="text-white font-medium">"{item.title}"</span> to continue. (Cannot be undone)
      </p>

      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="Type content name..."
        className="w-full px-4 py-2 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-blue-500"
      />

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => {
            setDeleteOpen(false);
            setConfirmText("");
          }}
          className="px-4 py-2 rounded-md bg-neutral-700 text-white hover:bg-neutral-600"
        >
          Cancel
        </button>

        <button
          disabled={confirmText !== item.title || deleteLoading}
          onClick={async() => {
            setDeleteLoading(true)
            const delItem = await deleteContent(item.id)
            if(delItem == 204){
setDeleteOpen(false);
            fetchContent()
            setConfirmText("");
            toast.success(`${item.title} Deleted ✔`);
            }
            else{
            toast.error("Error Ocurred. Try Later :)");

            }
            setDeleteLoading(false)

          }}
          className={`px-4 py-2 rounded-md font-semibold transition
            ${
              confirmText === item.title
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-neutral-700 text-gray-400 cursor-not-allowed"
            }`}
        >
          {deleteLoading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
)}
{trailerOpen && 
<UploadTrailerClient trailer_id={item.trailer_id}
content={item}
trailer_url={item.trailer_url || ""}
setOpen={setTrailerOpen}
refreshContent={fetchContent}

/>}

    </div>
  )
}

export default ContentCard