import React from 'react'
import RoundLoader from '../Loader/RoundLoader'
import { publishContent } from '@/lib/contentApi';
import { toast } from 'sonner';
import { Content, Rendition } from '@/lib/types/content';
export interface DetailedContentProps {
  setDetailContent: (value: Content | null) => void;
  setContent: React.Dispatch<React.SetStateAction<Content[]>>;
  handleDetailsClose: () => void;
  detailContent: Content | null;
  videoUrlLoading: boolean;
  videoUrl: string | null;
  loadingRenditions: boolean;
  renditions: Rendition[];
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

function formatBitrate(bitrate: number): string {
  if (bitrate >= 1000000) {
    return `${(bitrate / 1000000).toFixed(1)} Mbps`;
  } else if (bitrate >= 1000) {
    return `${(bitrate / 1000).toFixed(0)} Kbps`;
  }
  return `${bitrate} bps`;
}
const DetailedContent: React.FC<DetailedContentProps> = ({
  setDetailContent,
  setContent,
  handleDetailsClose,
  detailContent,
  videoUrlLoading,
  videoUrl,
  loadingRenditions,
  renditions,
}) => {
  return (
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
            <h3 className="text-xl font-bold mb-4">{detailContent?.title}</h3>
            <p className="text-gray-300">{detailContent?.description}</p>
          </div>

          {/* Images */}
          {(detailContent?.poster_url || detailContent?.banner_url) && (
            <div className="grid grid-cols-2 gap-4">
              {detailContent?.poster_url && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Poster</h4>
                  <img
                    src={detailContent?.poster_url}
                    alt="Poster"
                    className="w-full rounded-lg"
                  />
                </div>
              )}
              {detailContent?.banner_url && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Banner</h4>
                  <img
                    src={detailContent?.banner_url}
                    alt="Banner"
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
          {videoUrlLoading && <RoundLoader className='' />}
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
                          className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getQualityBadgeColor(rendition.label)}`}
                        >
                          {rendition.quality_label}
                        </span>

                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${rendition.status === 'ready'
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
                      {rendition.label && (
                        <div>
                          <span className="text-gray-500">Label:</span>
                          <span className="text-white ml-2 uppercase">
                            {rendition.label}
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

          {detailContent?.ingest_status == 'ready' &&
            <button
              onClick={async () => {
                let publish = await publishContent(detailContent?.id)
                if (publish.status) {
                  setDetailContent(null)
                  setContent(prev => prev.map(item =>
                    item.id === detailContent?.id
                      ? { ...item, status: publish.status } // update fields here
                      : item
                  )
                  );

                  toast.success(`Your Movie is officially published on URView`)
                }
                console.log(publish, "detailContent")
              }}

              type='button' className='p-2 bg-yellow-600 text-white rounded-md'>Publish content</button>}
        </div>
      </div>
    </div>
  )
}

export default DetailedContent
