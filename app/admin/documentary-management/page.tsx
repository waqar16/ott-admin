'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Content, ContentFilters, ApiError, Rendition } from '@/lib/types/content';
import { listContent, getContent, getRenditions, getStreamingUrl } from '@/lib/contentApi';
import ContentEditor from '@/components/admin/content/ContentEditor.client';
import RoundLoader from '@/components/Loader/RoundLoader';
import SkeletonLoader from '@/components/Loader/SkeletonLoader';

export default function ContentManagementPage() {
  // TODO: Add proper authentication check when NextAuth is ready
  // For now, allow access to admin pages
  const pathname = usePathname()
  console.log("pathname",pathname)
  const router = useRouter();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [detailContent, setDetailContent] = useState<Content | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [renditions, setRenditions] = useState<Rendition[]>([]);
  const [videoUrl ,  setVideoUrl] = useState<string | null>(null);
  const [videoUrlLoading ,  setVideoUrlLoading] = useState<boolean>(false);
  const [loadingRenditions, setLoadingRenditions] = useState(false);

  // Filter state
 const [filters, setFilters] = useState<ContentFilters>({
    status: undefined,
    content_type: undefined, 
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
    <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className='m-4'>
              <h1 className="text-3xl font-bold">
            {pathname.includes("movie-management") ? "Movie" : pathname.includes("show-management") ? "Show" : pathname.includes("trailer-management") ? "Trailer" : pathname.includes("documentary-management") ? "Documentary" : "Content"}  Management</h1>
              <p className="text-gray-400 mt-1">
                Create, upload, and manage video content {pathname}
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              + Create New {pathname.includes("movie-management") ? "Movie" : pathname.includes("show-management") ? "Show" : pathname.includes("trailer-management") ? "Trailer" : pathname.includes("documentary-management") ? "Documentary" : "Content"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading Spinner */}
        

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
{loading ? (
          <div className="  rounded-lg  w-full flex flex-col items-start ">
           <div className="mb-4 bg-gray-800 rounded-lg p-4 w-full">
            
          <SkeletonLoader className='w-[70px] h-[20px] bg-gray-400 mb-4 mt-2'/>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
             {Array.from({ length: 5 }).map((_, index) => (
                            <SkeletonLoader key={index} className='w-full col-span-1 h-[40px] bg-gray-400 '/>
      
            ))}
          </div>

        </div>
        {Array.from({ length: 2 }).map((_, index) => ( 
             
                           <div className='p-4 py-6 bg-gray-800 w-full h-auto rounded-md mt-2 flex flex-col items-start w-full'> 
                           <div className='flex flex-row items-center justify-between w-full'>
                             <div className='flex flex-row items-center w-6/12'>
                             <SkeletonLoader key={index} className='w-[300px] mx-1 h-[25px] bg-gray-400 '/>
                             <SkeletonLoader key={index} className='w-[50px] mx-1 h-[20px] bg-gray-400 rounded-full '/>
</div>
  <div className='flex flex-row items-center justify-end w-6/12'>
                             <SkeletonLoader key={index} className='w-[100px] mx-1 h-[35px] bg-gray-400 '/>
                             <SkeletonLoader key={index} className='w-[100px] mx-1 h-[35px] bg-gray-400 '/>
</div>
                           </div>
                            <div className='flex flex-row items-center w-full justify-start'>
                            <SkeletonLoader key={index} className='ml-1 w-3/12 mt-2 h-[20px] bg-gray-500 '/>

                            </div>
                            <div className='flex flex-row items-center w-full justify-start mt-4'>
                            <SkeletonLoader key={index} className='ml-1 w-2/12 h-[15px] bg-gray-500 '/>
                            <SkeletonLoader key={index} className='ml-4 w-2/12 h-[15px] bg-gray-500 '/>
                            <SkeletonLoader key={index} className='ml-4 w-3/12 h-[15px] bg-gray-500 '/>

                            </div>
                           </div>
          
            ))}
          </div>

        ) 
        :
        <><div className="mb-6 bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="processing">Processing</option>
              <option value="published">Published</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* <select
              value={filters.content_type || ''}
              onChange={(e) => setFilters({ ...filters, content_type: e.target.value as any || undefined })}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Content Types</option>
              <option value="movie">movie</option>
              <option value="series">series</option>
              <option value="episode">episode</option>
              <option value="trailer">trailer</option>
              <option value="documentary">documentary</option>
            </select> */}

            <select
              value={filters.media_type || ''}
              onChange={(e) => setFilters({ ...filters, media_type: e.target.value as any || undefined })}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Media Types</option>
              <option value="flat">flat</option>
              <option value="vr_360_mono">vr_360_mono</option>
              <option value="vr_360_sbs">vr_360_sbs</option>
              <option value="vr_360_tb">vr_360_tb</option>
              <option value="vr_180_mono">vr_180_mono</option>
              <option value="vr_180_sbs">vr_180_sbs</option>
              <option value="vr_180_tb">vr_180_tb</option>
            </select>

            <select
              value={filters.is_kid_safe === undefined ? '' : filters.is_kid_safe.toString()}
              onChange={(e) => setFilters({ ...filters, is_kid_safe: e.target.value === '' ? undefined : e.target.value === 'true' })}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Content</option>
              <option value="true">Kid Safe Only</option>
              <option value="false">Not Kid Safe</option>
            </select>

            <select
              value={filters.is_ppv === undefined ? '' : filters.is_ppv.toString()}
              onChange={(e) => setFilters({ ...filters, is_ppv: e.target.value === '' ? undefined : e.target.value === 'true' })}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Content</option>
              <option value="true">PPV Only</option>
              <option value="false">Non-PPV</option>
            </select>
          </div>
        </div>

        {/* Content List */}
        {!loading && (!content || content.length === 0) ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">No content found</p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Content
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {content && content.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <div className={`flex flex-row items-center ${getStatusBadge(item.status)} rounded-full px-2 py-[2px]`}>
                        <span
                        className={` py-1 rounded-full text-xs font-bold text-white capitalize`}
                      >
                        {item.ingest_status as string}
                      </span> 
                       {/* <span
                        className={` py-1 rounded-full text-xs font-bold text-white capitalize`}
                      >
                        {item.transcoding_progress  != null && item.status === 'processing'
                          ? ` - ${item.transcoding_progress}%`
                          : ''}
                      </span> */}
                      </div>
                      {item.is_kid_safe && (
                        <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">
                          Kid Safe
                        </span>
                      )}
                      {item.is_ppv && (
                        <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">
                          PPV ${(item.price_cents / 100).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 mb-3 line-clamp-2">{item.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Type: {item.content_type}</span>
                      <span>•</span>
                      <span>Media: {item.media_type}</span>
                      <span>•</span>
                      <span>ID: {item.id}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
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
        />
      )}

      {/* Content Details Modal */}
      {showDetails && detailContent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg max-w-6xl w-full my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Content Details</h2>
              <button
                onClick={handleDetailsClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-xl font-bold mb-4">{detailContent.title}</h3>
                <p className="text-gray-300">{detailContent.description}</p>
              </div>

              {/* Images */}
              {(detailContent.poster_url || detailContent.banner_url) && (
                <div className="grid grid-cols-2 gap-4">
                  {detailContent.poster_url && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Poster</h4>
                      <img
                        src={detailContent.poster_url}
                        alt="Poster"
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                  {detailContent.banner_url && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Banner</h4>
                      <img
                        src={detailContent.banner_url}
                        alt="Banner"
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
 {videoUrlLoading && <RoundLoader className=''/> }
 {videoUrl && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Video</h4>
                      <video
                        src={videoUrl}
                        controls
                        className="w-full rounded-lg"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
              {/* Renditions */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Available Renditions {renditions.length > 0 && `(${renditions.length})`}
                </h3>

                {loadingRenditions ? (
                  <div className="bg-gray-800 rounded-lg p-8 text-center">
                    <p className="text-gray-400">Loading renditions...</p>
                  </div>
                ) : renditions.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-8 text-center">
                    <p className="text-gray-400">No renditions available yet.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Renditions will appear here once transcoding is complete.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {renditions.map((rendition) => (
                      <div 
                        key={rendition.id} 
                        className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span 
                              className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getQualityBadgeColor(rendition.quality_label)}`}
                            >
                              {rendition.quality_label}
                            </span>
                            
                            <span 
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                rendition.status === 'ready' 
                                  ? 'bg-green-900/50 text-green-300' 
                                  : rendition.status === 'processing'
                                  ? 'bg-yellow-900/50 text-yellow-300'
                                  : 'bg-gray-700 text-gray-300'
                              }`}
                            >
                              {rendition.status}
                            </span>
                          </div>

                          {rendition.file_size_bytes && (
                            <span className="text-sm text-gray-400">
                              {(rendition.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {(rendition.width && rendition.height) && (
                            <div>
                              <span className="text-gray-500">Resolution:</span>
                              <span className="text-white ml-2">
                                {rendition.width}x{rendition.height}
                              </span>
                            </div>
                          )}

                          {rendition.bitrate && (
                            <div>
                              <span className="text-gray-500">Bitrate:</span>
                              <span className="text-white ml-2">
                                {formatBitrate(rendition.bitrate)}
                              </span>
                            </div>
                          )}

                          {rendition.format && (
                            <div>
                              <span className="text-gray-500">Format:</span>
                              <span className="text-white ml-2 uppercase">
                                {rendition.format}
                              </span>
                            </div>
                          )}

                          {rendition.codec && (
                            <div>
                              <span className="text-gray-500">Codec:</span>
                              <span className="text-white ml-2 uppercase">
                                {rendition.codec}
                              </span>
                            </div>
                          )}
                        </div>

                        {rendition.url && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <details className="cursor-pointer">
                              <summary className="text-sm text-gray-400 hover:text-white">
                                View URLs
                              </summary>
                              <div className="mt-2 space-y-2">
                                <div>
                                  <span className="text-xs text-gray-500 block mb-1">
                                    Playback URL:
                                  </span>
                                  <code className="text-xs text-blue-400 bg-gray-900 px-2 py-1 rounded block overflow-x-auto">
                                    {rendition.url}
                                  </code>
                                </div>
                                {rendition.manifest_url && (
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-1">
                                      Manifest URL:
                                    </span>
                                    <code className="text-xs text-blue-400 bg-gray-900 px-2 py-1 rounded block overflow-x-auto">
                                      {rendition.manifest_url}
                                    </code>
                                  </div>
                                )}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
