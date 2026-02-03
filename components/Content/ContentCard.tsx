
import { deleteContent, retryTranscoding } from "@/lib/contentApi"
import { Content, ContentStatus } from "@/lib/types/content"
import { BiCheck, BiEdit, BiLink, BiLoaderAlt, BiTrash } from "react-icons/bi"
import { FiChevronDown, FiInfo, FiLoader, FiRotateCw, FiTablet } from "react-icons/fi"
import { toast } from "sonner"
import { getStatusBadge } from "@/utils/statusBadge"
import React from "react"
import UploadTrailerClient from "../admin/content/UploadTrailerClient"
interface ContentCardProps {
  item: Content
  handleViewDetails: (item: Content) => void
  handleEdit: (item: Content) => void
  publishContent: (id: string) => Promise<{ status: ContentStatus }>
  fetchContent: () => void 
}
const ContentCard: React.FC<ContentCardProps> = ({
  item,
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
  const [trailerOpen,setTrailerOpen] = React.useState(false)
  
  return (

    
    <div
      key={item.id}
      className="w-full bg-neutral-900 rounded-xs shadow-lg rounded-md flex flex-col  hover:shadow-2xl transition-all duration-300 border border-neutral-700"
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
  <div className="relative group">
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
      group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
    >
      Delete
    </span>
  </div>
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
  </div>
  {(item.ingest_status === 'ready' &&
                item.status !== 'published' &&
                item.status !== 'inactive') &&
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

          <div className="flex flex-wrap items-start justify-start gap-2 w-full  mt-2">

            {item.status !== 'published' && (
              <span className={`  px-2 py-1 rounded-full  text-[8px] ${getStatusBadge(item.status)}`}>
                Upload: {item.status}
              </span>
            )}

            {item.ingest_status != 'failed' && <span className={`  px-2 py-1 rounded-full  text-[8px] ${getStatusBadge(item.ingest_status)}`}>
              Transcoding: {item.ingest_status}
            </span>}

            {item.is_kid_safe && (
              <span className="px-1 py-1 bg-green-900/50 text-green-300 text-[8px] rounded  flex items-center gap-1">
                🧒 Kid Safe
              </span>
            )}

            {item.is_ppv && (
              <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-[8px]">
                PPV ${((item?.price_cents || 0) / 100).toFixed(2)}
              </span>
            )}
            {item.ingest_status === 'failed' &&
              <div className="w-full flex flex-row items-center">

                <button
                  onClick={async () => {
                    // Retry Transcoding Logic Here
                    let retry = await retryTranscoding(item.id)
                    if (retry) {
                      toast.success("Transcoding Retry Initiated")
                      fetchContent()
                    } else {
                      toast.error("Transcoding Retry Failed")
                    }


                  }}
                  className="text-[8px] flex flex-row items-center bg-neutral-800   p-1 rounded-lg  text-white rounded-lg  "
                >
                  Transcoding Failed. Retry? <FiRotateCw size={10} className="ml-1" />
                </button></div>}
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


/>}

    </div>
  )
}

export default ContentCard