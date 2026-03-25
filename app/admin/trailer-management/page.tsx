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
import ContentCard from '@/components/Content/ContentCard';
import AdminContentHelpPanel from '@/components/admin/content/AdminContentHelpPanel';

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
    search: undefined,
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
const [page, setPage] = useState(1); 
const [totalCount, setTotalCount] = useState(0);
const [hasNext, setHasNext] = useState(false);
const [hasPrev, setHasPrev] = useState(false);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result: any = await listContent(filters as any);
      const items = Array.isArray(result)
        ? result
        : (result?.results ?? result?.content ?? []);
      setContent(items as Content[]);
       
    setTotalCount(result?.count ?? 0);
    setHasNext(Boolean(result?.next));
    setHasPrev(Boolean(result?.previous));
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
        
      const details = await getContent(item.id); 
      setDetailContent(details);
      setShowDetails(true);  
      
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load content details');
    } finally { 
    }
  }

  function handleEditorClose() {
    setShowEditor(false);
    setSelectedContent(null);
    fetchContent();
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
        <AdminContentHelpPanel />

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
                          <> <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                  {content && content.map((item) => (
                                   <ContentCard
                    key={item.id}
                    item={item}
                    handleViewDetails={handleViewDetails}
                    handleEdit={handleEdit}
                    publishContent={publishContent}
                    fetchContent={fetchContent}
                   
                  />
                                ))}
              </div>
              <div className="flex items-center justify-between mt-6">
  <p className="text-sm text-gray-400">
    Page {page} 
  </p>

  <div className="flex gap-2">
    <button
      disabled={!hasPrev}
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      className="px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-40"
    >
      Previous
    </button>

    <button
      disabled={!hasNext}
      onClick={() => setPage((p) => p + 1)}
      className="px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-40"
    >
      Next
    </button>
  </div>
</div>
              </>
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
  
   
  publishContent={publishContent} 
/>}
    </div>
  );
}
