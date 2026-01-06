'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Content, ContentFilters, ApiError, Rendition } from '@/lib/types/content';
import { listContent, getContent, getRenditions, getStreamingUrl, publishContent } from '@/lib/contentApi';
import ContentEditor from '@/components/admin/content/ContentEditor.client';
import RoundLoader from '@/components/Loader/RoundLoader';
import SkeletonLoader from '@/components/Loader/SkeletonLoader';
import ContentHeaderComponent from '@/components/Content/ContentHeader';
import ContentLoading from '@/components/Content/ContentLoading';
import ContentFilter from '@/components/Content/ContentFilter';
import { toast } from 'sonner';
import { BiEdit, BiRefresh } from 'react-icons/bi';
import ContentDetailsModal from '@/components/Content/ContentDetailsModal';
import { FiTablet } from 'react-icons/fi';

export default function ContentManagementPage() {
  // TODO: Add proper authentication check when NextAuth is ready
  // For now, allow access to admin pages
  const pathname = usePathname()
  console.log("pathname", pathname)
  const router = useRouter();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [detailContent, setDetailContent] = useState<Content | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [renditions, setRenditions] = useState<Rendition[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoUrlLoading, setVideoUrlLoading] = useState<boolean>(false);
  const [loadingRenditions, setLoadingRenditions] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<ContentFilters>({
    status: undefined,
    content_type:pathname.includes('movie')?'movie':
            pathname.includes('document')?'documentary':
            pathname.includes('trailer')?'trailer':
            pathname.includes('series')?'series':
            pathname.includes('episode')?'episode':"movie"
          ,
    is_kid_safe: undefined,
    is_ppv: undefined,
    media_type: pathname.includes("movie-management") ? "movies"
      : pathname.includes("trailer-management") ? "trailers"
        : pathname.includes("documentary-management") ? "documentaries"
          : pathname.includes("demo-content-management") ? "democontents"
            : ""
  });

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result: any = await listContent(filters as any);
      const items = Array.isArray(result)
        ? result
        : (result?.results ?? result?.content ?? []);
      setContent(items as Content[]);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load content');
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Always fetch content on mount and filter changes
    fetchContent();
  }, [fetchContent]);

  function handleCreateNew() {
    setSelectedContent(null);
    setShowEditor(true);
  }

  function handleEdit(item: Content) {
    setSelectedContent(item);
    setShowEditor(true);
  }

  async function handleViewDetails(item: Content) {
    try {
      setVideoUrlLoading(true);
      setLoadingRenditions(true);
      setRenditions([]);
      const details = await getContent(item.id);
      setDetailContent(details);
      setShowDetails(true);

      // Fetch renditions
      try {
        const urlPayload = await getStreamingUrl(item.id);
        setVideoUrlLoading(false);

        setVideoUrl(urlPayload.playback_url);
      } catch (rendErr) {
        console.error('Error fetching renditions:', rendErr);
        // Don't fail the whole operation if renditions fail
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load content details');
    } finally {
      setLoadingRenditions(false);
    }
  }

  function handleEditorClose() {
    setShowEditor(false);
    setSelectedContent(null);
  }

  function handleEditorSuccess(updatedContent: Content) {
    // Refresh list
    fetchContent();
    // Close editor after a short delay to show success message
    setTimeout(() => {
      handleEditorClose();
    }, 2000);
  }

  function handleDetailsClose() {
    setShowDetails(false);
    setDetailContent(null);
  }

  function getStatusBadge(status: string) {
    const colors = {
      draft: 'bg-gray-600',
      processing: 'bg-yellow-600',
      published: 'bg-green-600',
      inactive: 'bg-gray-700',
    } as const;
    return (colors as any)[status] || 'bg-gray-600';
  }

  function formatBitrate(bitrate: number): string {
    if (bitrate >= 1000000) {
      return `${(bitrate / 1000000).toFixed(1)} Mbps`;
    } else if (bitrate >= 1000) {
      return `${(bitrate / 1000).toFixed(0)} Kbps`;
    }
    return `${bitrate} bps`;
  }

  function getQualityBadgeColor(quality: string): string {
    switch (quality.toLowerCase()) {
      case '4k':
      case 'uhd':
        return 'bg-purple-600';
      case '1080p':
      case 'fhd':
        return 'bg-blue-600';
      case '720p':
      case 'hd':
        return 'bg-green-600';
      case '480p':
      case 'sd':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  }

  return (
    <div className="min-h-screen   text-white">
      {/* Header */}
      <ContentHeaderComponent handleCreateNew={handleCreateNew} />


      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading Spinner */}


        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {loading ?
            <>
            <ContentFilter filters={filters} setFilters={setFilters} />
<div className='flex flex-row items-center w-full justify-end p-2'>
              <button className='p-2 rounded-md bg-neutral-800 flex flex-row items-center' onClick={() => {
                fetchContent()
              }}>Refresh <BiRefresh className='ml-1' /> </button>
            </div>
          <ContentLoading /></>

          :
          <> 
            <ContentFilter filters={filters} setFilters={setFilters} />
            <div className='flex flex-row items-center w-full justify-end p-2'>
              <button className='p-2 rounded-md bg-neutral-800 flex flex-row items-center' onClick={() => {
                fetchContent()
              }}>Refresh <BiRefresh className='ml-1' /> </button>
            </div>
            {/* Content List */}
            {!loading && (!content || content.length === 0) ? (
             <div className="bg-neutral-900 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-lg mb-4">No content found</p>
                <button
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Content
                </button>
              </div>
            ) : (
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                  {content && content.map((item) => (
                                  <div
                                    key={item.id}
                                    className="bg-neutral-900 rounded-xl shadow-lg p-4 md:p-3 flex flex-col  gap-4 hover:shadow-2xl transition-all duration-300 border border-neutral-700"
                                  >
                                    {/* Left: Thumbnail / Type */}
                                    <div className='flex flex-row justify-between items-start w-full'>
                                      <div className="flex-shrink-0 w-full md:w-32 h-0 md:h-32 relative rounded-lg overflow-hidden shadow-lg">
                                      {(item.poster_url || item.banner_url) ?<img
                                        src={item.poster_url || item.banner_url || '/placeholder.png'}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                      />:
                                      <div className='flex flex-col items-center justify-center w-full h-full text-neutral-400 text-xs bg-neutral-900 text-center'>No Poster Uploaded yet</div>}
                                      {/* Optional gradient overlay */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                    </div>
                <div className="flex flex-col gap-2 justify-end   ">
                      <div className='flex flex-row items-center  w-full justify-end '>
                      <button
                        onClick={() => handleViewDetails(item)}
                         className="mx-[2px] flex flex-row items-center justify-center   p-2 bg-neutral-950 text-white rounded-lg hover:bg-black transition-colors duration-300"
                    >
                        <FiTablet />
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
                                      <div className="flex flex-wrap items-center gap-2">
                                     
                                        {item.status !== 'published' && (
                                          <span className={`  px-2 py-1 rounded-full font-semibold text-[8px] ${getStatusBadge(item.status)}`}>
                                            Upload: {item.status}
                                          </span>
                                        )}
                
                                        <span className={`  px-2 py-1 rounded-full font-semibold text-[8px] ${getStatusBadge(item.ingest_status)}`}>
                                          Transcoding: {item.ingest_status}
                                        </span>
                
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
                                           <h3 className="text-xl font-bold text-white capitalize w-full">{item.title}</h3>
                                      <p className="text-gray-400 text-sm line-clamp-3 capitalize w-full">{item.description}</p>
                
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
                                ))}
              </div>
            )}</>
        }
      </div>

      {/* Content Editor Modal */}
       {showEditor && (
        <ContentEditor
          content={selectedContent}
          setContent={setContent}
          onClose={handleEditorClose}
          onSuccess={handleEditorSuccess}
           contentType={pathname.includes('movie')?'movie':
            pathname.includes('document')?'documentary':
            pathname.includes('trailer')?'trailer':
            pathname.includes('series')?'series':
            pathname.includes('episode')?'episode':"movie"
          }
        />
      )}

      {/* Content Details Modal */}
      {showDetails && detailContent && <ContentDetailsModal
  open={showDetails}
  detailContent={detailContent}
  onClose={() => {
    setShowDetails(false);
    setDetailContent(null);
    fetchContent()
  }}
  videoUrl={videoUrl}
  videoUrlLoading={videoUrlLoading}
  renditions={renditions}
  loadingRenditions={loadingRenditions}
  publishContent={publishContent}
  getQualityBadgeColor={getQualityBadgeColor}
  formatBitrate={formatBitrate}
/>}
    </div>
  );
}
