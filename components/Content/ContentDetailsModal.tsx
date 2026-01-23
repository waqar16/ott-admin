'use client';
import React from 'react';
import { toast } from 'sonner';
import RoundLoader from '../Loader/RoundLoader';
import { Content } from '@/lib/types/content';

type Rendition = {
  id: string;
  label: string;
  width?: number;
  height?: number;
  bitrate?: number;
  stream_url?: string;
};

 

interface ContentDetailsModalProps {
  open: boolean;
  detailContent: Content | null;

  onClose: () => void;

  videoUrl?: string | null;
  videoUrlLoading?: boolean;

  renditions: Rendition[];
  loadingRenditions: boolean;

  publishContent: (id: string,status?:string) => Promise<{ status: string }>;

  getQualityBadgeColor: (label: string) => string;
  formatBitrate: (bitrate: number) => string;
}

const ContentDetailsModal: React.FC<ContentDetailsModalProps> = ({
  open,
  detailContent,
  onClose,
  videoUrl,
  videoUrlLoading,
  renditions,
  loadingRenditions,
  publishContent,
  getQualityBadgeColor,
  formatBitrate,
}) => {
  if (!open || !detailContent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-neutral-800 rounded-lg max-w-6xl w-full my-8">
 
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
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">

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
              <div className='h-full col-span-5 w-full flex flex-col items-center justify-center'>No Poster Uploaded Yet</div>
              }
              {detailContent.banner_url ? (
                <img
                  src={detailContent.banner_url}
                  alt="Banner"
                  className="rounded-lg col-span-5 w-auto h-[70vh] object-cover"
                />):
                            <div className='h-full col-span-5 w-full flex flex-col items-center justify-center'>No Banner Uploaded Yet</div>


              }
            </div>
          )}

          {/* Video */}
          {videoUrlLoading && <RoundLoader />}
        
          {videoUrl && (
            <video src={videoUrl} controls className=" w-full rounded-lg" />
          )}
{!videoUrl && (
            <div className='  w-full p-8 flex flex-col items-center justify-center bg-neutral-700'> No VIdeo to show</div>         )}
          {/* Renditions */}
          

          {/* Publish Button */}
          {detailContent.ingest_status === 'ready' && detailContent.status != 'published' && (
            <button 
              className="bg-yellow-600 px-4 py-2 rounded-md text-black"
              onClick={async () => {
                const res = await publishContent(detailContent.id);
                if (res.status === 'published') {
                  toast.success(`Published ${detailContent.title}`);
                  onClose();
                } else {
                  toast.error('Publishing failed');
                }
              }}
            >
              {'Publish Content'}
            </button>
            
          )}
          {detailContent.status == 'published' && (
            <button 
              className="bg-yellow-600 px-4 py-2 rounded-md text-black"
              onClick={async () => {
                const res = await publishContent(detailContent.id,'inactive');
                if (res.status == 'inactive') {
                  toast.success(`${detailContent.title} is UnPublished`);
                  onClose();
                } else {
                  toast.error('Publishing failed');
                }
              }}
            >
              {'Inactivate Content'}
            </button>
            
          )}
        </div>
      </div>
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
