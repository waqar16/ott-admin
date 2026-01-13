import { cinzel, titan_one, varela_round } from "@/app/layout"
import { retryTranscoding } from "@/lib/contentApi"
import { Content, ContentStatus } from "@/lib/types/content"
import { BiEdit, BiLoaderAlt } from "react-icons/bi"
import { FiChevronDown, FiInfo, FiLoader, FiRotateCw, FiTablet } from "react-icons/fi"
import { toast } from "sonner"

 interface ContentCardProps {
  item: Content
  handleViewDetails: (item: Content) => void
  handleEdit: (item: Content) => void
  publishContent: (id: string) => Promise<{ status: ContentStatus }>
  fetchContent: () => void
  getStatusBadge: (status: string) => string
}
const ContentCard: React.FC<ContentCardProps> = ({
  item,
  handleViewDetails,
  handleEdit,
  publishContent,
  fetchContent,
  getStatusBadge,
}) => {
  return (
   <div
                       key={item.id}
                       className="bg-neutral-900 rounded-xl shadow-lg p-4 md:p-3 flex flex-col  gap-4 hover:shadow-2xl transition-all duration-300 border border-neutral-700"
                     >
                       {/* Left: Thumbnail / Type */}
                       <div className='flex flex-row justify-between items-start w-full'>
                         <div className="flex-shrink-0 w-full md:w-32 h-0 md:h-32 relative rounded-lg overflow-hidden shadow-lg">
                        {item.poster_url || item.banner_url ? (
    <>
      <img
        src={item.poster_url || item.banner_url}
        alt={item.title}
        className="w-full h-full object-cover"
      />
      {/* Optional gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
    </>
  ) : (
    // Fallback UI when no image
    <div className="flex flex-col items-center justify-center text-gray-400 p-2 h-full w-full bg-neutral-800">
      {/* Example SVG */}
       
      <span className="text-xs text-center">{'No Poster Available'}</span>
    </div>
  )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                       </div>
   <div className="flex flex-col gap-2 justify-end   ">
         <div className='flex flex-row items-center  w-full justify-end '>
         <button
           onClick={() => handleViewDetails(item)}
            className="mx-[2px] flex flex-row items-center justify-center   p-2 bg-neutral-950 text-white rounded-lg hover:bg-black transition-colors duration-300"
       >
           <FiInfo  />
         </button>
    <button
           onClick={() => handleEdit(item)}
            className="mx-[2px] flex flex-row items-center justify-center  p-2 bg-neutral-950 text-white rounded-lg hover:bg-black transition-colors duration-300"
         >
            <BiEdit  />
         </button></div>
         {(item.ingest_status === 'ready' && item.status !== 'published' && item.status !== 'inactive') && (
           <button
             onClick={async () => {
               const res = await publishContent(item.id);
               if (res.status === 'published') {
                 toast.success(`Published ${item.title}`);
                 fetchContent();
               } else {
                 toast.error('Publishing failed');
               }
             }}
              className="text-sm flex flex-row items-center px-2 py-2 bg-yellow-700 text-white rounded-lg hover:bg-black hover:text-yellow-700 transition-colors duration-300"
           >
             Publish
           </button>
         )}
   
        
       </div>
                       </div>
                       {/* Middle: Content Info */}
                       <div className="flex-1 flex flex-col gap-2">
                        <div className="flex flex-col items-start w-full">
                         <div className="flex flex-wrap items-start justify-start gap-x-2 gap-y-1 w-full min-h-[70px]">
                        
                           {item.status !== 'published' && (
                             <span className={`  px-2 py-1 rounded-full font-semibold text-[8px] ${getStatusBadge(item.status)}`}>
                               Upload: {item.status}
                             </span>
                           )}
   
                          {item.ingest_status!='failed' &&  <span className={`  px-2 py-1 rounded-full font-semibold text-[8px] ${getStatusBadge(item.ingest_status)}`}>
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
           onClick={async() => {
              // Retry Transcoding Logic Here
              let retry = await retryTranscoding(item.id)
              if(retry){
                toast.success("Transcoding Retry Initiated")
                fetchContent()
              }else{
                toast.error("Transcoding Retry Failed")
              }


           }}
            className="text-[8px] flex flex-row items-center bg-neutral-800   p-1 rounded-lg  text-white rounded-lg  "
       >
          Transcoding Failed. Retry? <FiRotateCw size={10} className="ml-1"/>
         </button></div>}
                         </div>
   
                              <h3 className={`text-xl font-bold text-white capitalize w-full ${cinzel.className}`}>{item.title}</h3>
                         <p className={`text-gray-400 text-sm line-clamp-3 capitalize w-full`}>{item.description}</p>
   
   </div>
                         {/* Metadata Cards */}
                         
   
                         {/* Collapsible Extra Details */}
                         <details className="mt-2 w-full">
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
                         </details>
                       </div>
   
                       {/* Right: Actions */}
   
                     </div>
  )
}

export default ContentCard