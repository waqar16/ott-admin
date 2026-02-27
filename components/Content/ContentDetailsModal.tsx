'use client';
import React, { useEffect, useState } from 'react'; 
import RoundLoader from '../Loader/RoundLoader';
import { Content } from '@/lib/types/content';
import { getStreamingUrl } from '@/lib/contentApi';
import dynamic from 'next/dynamic';

const ShakaPlayer = dynamic(
  () => import('../ShakaPlayer/ShakaPlayer'),
  { ssr: false }
);

const VRAframePlayer = dynamic(
  () => import('../VrAframePlayer/VRAframePlayer'),
  { ssr: false }
);

// sonner MUST also be client-only
const toastPromise = dynamic(
  () => import('sonner').then(m => m.toast),
  { ssr: false }
);

import "../ShakaPlayer/shaka.css"
import Link from 'next/link';
import { FRONTEND_BASE } from '@/lib/config';
import { FiExternalLink } from 'react-icons/fi';
import { toast } from 'sonner';
 
 

interface ContentDetailsModalProps {
  open: boolean;
  detailContent: Content | null;

  onClose: () => void;

  videoUrl?: string | null;
  videoUrlLoading?: boolean;
 

  publishContent: (id: string,status?:string) => Promise<{ status: string }>;
 
}

const ContentDetailsModal: React.FC<ContentDetailsModalProps> = ({
  open,
  detailContent,
  onClose, 
  publishContent, 
}) => {
  
   
 
  const [confirmText, setConfirmText] = React.useState("");  
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [publishLoading, setPublishLoading] = React.useState(false);
  const [inactivateLoading, setInactivateLoading] = React.useState(false);
 
 
 useEffect(() => {
    // Disable background scroll when modal opens
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }

    return () => {
      // Restore scroll when modal closes
      if (typeof document !== "undefined") {
        document.body.style.overflow = "auto";
      }
    };
  }, []);
 
  if (!open || !detailContent) return null;
  return (
   <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ">

      <div className="bg-neutral-800 rounded-lg   w-full my-8">
 
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Content Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className=" p-6 max-h-[calc(100vh-100px)] overflow-y-auto minimal-scrollbar space-y-6">

          {/* Basic Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">
              {detailContent.title}
            </h3>
            <p className="text-gray-300">
              {detailContent.description}
            </p>
            {detailContent.content_metadata && (
  <div className="  rounded-lg space-y-4 mt-4">
    <h3 className="text-lg font-semibold text-white">
      Content Metadata
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetaRow
        label="Directors"
        value={detailContent.content_metadata.directors}
      />
      <MetaRow
        label="Producers"
        value={detailContent.content_metadata.producers}
      />
      <MetaRow
        label="Cast"
        value={detailContent.content_metadata.cast}
      />
      <MetaRow
        label="Genres"
        value={detailContent.content_metadata.genres}
      />
      <MetaRow
        label="Awards"
        value={detailContent.content_metadata.awards}
      />
      <MetaRow
        label="Subtitles"
        value={detailContent.content_metadata.subtitles_available}
      />

      <MetaRow
        label="Release Year"
        value={
          detailContent.content_metadata.release_year
            ? String(detailContent.content_metadata.release_year)
            : undefined
        }
      />
      <MetaRow
        label="Age Rating"
        value={detailContent.content_metadata.age_rating}
      />
      <MetaRow
        label="Language"
        value={detailContent.content_metadata.language}
      />
      <MetaRow
        label="Production Company"
        value={detailContent.content_metadata.production_company}
      />
      <MetaRow
        label="Country"
        value={detailContent.content_metadata.country}
      />
    </div>
  </div>
)}

          </div>

          {/* Images */}
          {  (
            <div className="  grid grid-cols-7 gap-4 h-[70vh]">
              {detailContent.poster_url ? (
                <img
                  src={detailContent.poster_url}
                  alt="Poster"
                  className="rounded-lg col-span-2 w-auto h-[70vh] object-cover"
                />
              ):
              <div className='h-full col-span-2 w-full flex flex-col items-center justify-center bg-neutral-950 rounded-lg '>No Poster Uploaded Yet</div>
              }
              {detailContent.banner_url ? (
                <img
                  src={detailContent.banner_url}
                  alt="Banner"
                  className="rounded-lg col-span-5 w-full h-[70vh] object-cover "
                />):
                            <div className='h-full col-span-5 w-full flex flex-col items-center justify-center bg-neutral-950 rounded-lg'>No Banner Uploaded Yet</div>


              }
            </div>
          )}
  <div className='flex flex-col items-start w-full '>
     <h2 className='mt-2 mb-1 text-sm text-neutral-300'>Video Preview</h2>
                              {detailContent.ingest_status == 'ready' ?
                              <Link
                              href={`${FRONTEND_BASE}admin/watch/${detailContent.id}?media_type=${detailContent.media_type}`}
                               target="_blank"
                               className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
    
                               >Watch Video
                                <FiExternalLink size={16} className="opacity-80" />
                               </Link>:
                               detailContent.ingest_status == 'processing'?
                               <p>Video not ready yet</p>:
                               <p>Video not provided yet</p>
                               }
  </div>
 
          {detailContent.ingest_status === 'ready' && detailContent.status != 'published' && (
            <button 
              className="bg-yellow-600 px-4 py-2 rounded-md text-black"
              onClick={()=>setPublishOpen(true)}
            >
              {'Publish Content'}
            </button>
            
          )}
          {detailContent.status == 'published' && (
            <button 
              className="bg-yellow-600 px-4 py-2 rounded-md text-black disabled:bg-neutral-700 disabled:text-gray-400"
              disabled={inactivateLoading}
              onClick={async () => {
                setInactivateLoading(true);
                const res = await publishContent(detailContent.id,'archived');
                console.log('object',res);
                if (res.status == 'archived') {
                  toast.success(`${detailContent.title} is UnPublished`);
                  onClose();
                } else {
                  toast.error('UnPublishing failed');
                }
                setInactivateLoading(false);
              }}
            >
              {inactivateLoading ? 'Inactivating...' : 'Inactivate Content'}
            </button>
            
          )}
        </div>
      </div>
        {publishOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-white mb-2">
        Confirm Publish Action 
      </h2>

      <p className="text-sm text-gray-400 mb-4">
        Type <span className="text-white font-medium">"{detailContent.title}"</span> to continue. 
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
          disabled={confirmText !== detailContent.title || publishLoading}
          onClick={async () => {
            setPublishLoading(true)
                      const res = await publishContent(detailContent.id);
                      if (res.status === 'published') {
                        toast.success(`Published ${detailContent.title}`);
                        setPublishOpen(false)
                        onClose();
                      } else {
                        toast.error('Publishing failed');
                      }
                      setConfirmText("")
            setPublishLoading(false)

                    }}
          className={`px-4 py-2 rounded-md font-semibold transition
            ${
              confirmText === detailContent.title
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
    </div>
  );
};
const MetaRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | string[];
}) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  return (
    <div>
      <span className="text-gray-400 text-sm block mb-1">{label}</span>
      {Array.isArray(value) ? (
        <div className="flex flex-wrap gap-2">
          {value.map((v) => (
            <span
              key={v}
              className="px-2 py-1 bg-gray-700 rounded text-xs text-white"
            >
              {v}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-white text-sm">{value}</p>
      )}
    </div>
  );
};

export default ContentDetailsModal;
