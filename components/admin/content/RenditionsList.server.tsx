import { getRenditions } from '@/lib/contentApi'
import { Rendition } from '@/lib/types/content'

interface RenditionsListProps {
  contentId: string
}

function formatBitrate(bitrate: number): string {
  if (bitrate >= 1000000) {
    return `${(bitrate / 1000000).toFixed(1)} Mbps`
  } else if (bitrate >= 1000) {
    return `${(bitrate / 1000).toFixed(0)} Kbps`
  }
  return `${bitrate} bps`
}

function getQualityBadgeColor(quality: string): string {
  switch (quality.toLowerCase()) {
    case '4k':
    case 'uhd':
      return 'bg-purple-600'
    case '1080p':
    case 'fhd':
      return 'bg-blue-600'
    case '720p':
    case 'hd':
      return 'bg-green-600'
    case '480p':
    case 'sd':
      return 'bg-yellow-600'
    default:
      return 'bg-gray-600'
  }
}

export default async function RenditionsList({ contentId }: RenditionsListProps) {
  try {
    const renditions = await getRenditions(contentId)

    if (!renditions || renditions.length === 0) {
      return (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">No renditions available yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Renditions will appear here once transcoding is complete.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-4">
          Available Renditions ({renditions.length})
        </h3>

        <div className="grid gap-4">
          {renditions.map((rendition: Rendition) => (
            <div
              key={rendition.id}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Quality Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getQualityBadgeColor(rendition.quality_label)}`}
                  >
                    {rendition.quality_label}
                  </span>

                  {/* Status Badge */}
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

                {/* File Size */}
                {rendition.file_size_bytes && (
                  <span className="text-sm text-gray-400">
                    {(rendition.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {/* Resolution */}
                {rendition.width && rendition.height && (
                  <div>
                    <span className="text-gray-500">Resolution:</span>
                    <span className="text-white ml-2">
                      {rendition.width}x{rendition.height}
                    </span>
                  </div>
                )}

                {/* Bitrate */}
                {rendition.bitrate && (
                  <div>
                    <span className="text-gray-500">Bitrate:</span>
                    <span className="text-white ml-2">{formatBitrate(rendition.bitrate)}</span>
                  </div>
                )}

                {/* Format */}
                {rendition.format && (
                  <div>
                    <span className="text-gray-500">Format:</span>
                    <span className="text-white ml-2 uppercase">{rendition.format}</span>
                  </div>
                )}

                {/* Codec */}
                {rendition.codec && (
                  <div>
                    <span className="text-gray-500">Codec:</span>
                    <span className="text-white ml-2 uppercase">{rendition.codec}</span>
                  </div>
                )}
              </div>

              {/* URLs (if available) */}
              {rendition.url && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <details className="cursor-pointer">
                    <summary className="text-sm text-gray-400 hover:text-white">View URLs</summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Playback URL:</span>
                        <code className="text-xs text-blue-400 bg-gray-900 px-2 py-1 rounded block overflow-x-auto">
                          {rendition.url}
                        </code>
                      </div>
                      {rendition.manifest_url && (
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Manifest URL:</span>
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
      </div>
    )
  } catch (error) {
    console.error('Error fetching renditions:', error)
    return (
      <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
        <p className="text-red-400">Failed to load renditions</p>
        <p className="text-sm text-red-300 mt-1">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }
}
