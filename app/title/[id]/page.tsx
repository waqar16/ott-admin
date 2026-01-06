'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import { useAuthMock } from '@/lib/useAuthMock';
import { getPlayPath } from '@/lib/navigation';
// Uncomment these imports when ready to use the video players:
// import { VideoPlayer, VRPlayer } from '@/players';
import type { CatalogTitle } from '../../api/catalog/route';

export default function TitleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuthMock();
  
  const [title, setTitle] = useState<CatalogTitle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPreview, setSelectedPreview] = useState(0);

  useEffect(() => {
    fetchTitle();
  }, [id]);

  const fetchTitle = async () => {
    try {
      const response = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTitle(data);
      }
    } catch (error) {
      console.error('Failed to fetch title:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Title Not Found</h1>
        <Link href="/catalog">
          <Button variant="primary">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative h-[70vh] min-h-[500px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${title.banner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-black/50 to-black/30"></div>
        </div>

        <div className="relative h-full container mx-auto px-4 flex items-end pb-12">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {title.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white mb-6">
              <span className="px-3 py-1 bg-purple-600 rounded font-semibold">
                {title.rating}
              </span>
              <span>{title.year}</span>
              <span>
                {title.type === 'movie'
                  ? `${title.duration} min`
                  : `${title.seasons} ${title.seasons === 1 ? 'Season' : 'Seasons'}`}
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {title.imdbRating}
              </span>
              {title.isImmersive && (
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded font-semibold">
                  Immersive VR
                </span>
              )}
            </div>

            <p className="text-lg text-gray-100 mb-6 max-w-2xl">
              {title.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg" className="px-8" onClick={() => { if (title) router.push(getPlayPath(title, user)); }}>
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Play Now
              </Button>
              <Button variant="secondary" size="lg">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add to Watchlist
              </Button>
              <Button variant="secondary" size="lg">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Preview Images */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Preview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Preview */}
            <div className="lg:col-span-2">
              <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                <img
                  src={title.previewImages[selectedPreview]}
                  alt={`Preview ${selectedPreview + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Preview Thumbnails */}
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-3">
              {title.previewImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPreview(index)}
                  className={`aspect-video rounded-lg overflow-hidden ${
                    selectedPreview === index
                      ? 'ring-4 ring-purple-600'
                      : 'opacity-70 hover:opacity-100'
                  } transition-all`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">About</h3>
              <p className="text-gray-700 leading-relaxed">{title.description}</p>
            </div>

            {/* Cast */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cast</h3>
              <div className="flex flex-wrap gap-2">
                {title.cast.map((actor, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-100 rounded-full text-gray-700"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {title.genre.map((g, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Details</h3>
              <dl className="space-y-3">
                {title.director && (
                  <>
                    <dt className="text-sm text-gray-600">Director</dt>
                    <dd className="font-medium text-gray-900">{title.director}</dd>
                  </>
                )}
                {title.creator && (
                  <>
                    <dt className="text-sm text-gray-600">Creator</dt>
                    <dd className="font-medium text-gray-900">{title.creator}</dd>
                  </>
                )}
                <dt className="text-sm text-gray-600">Release Year</dt>
                <dd className="font-medium text-gray-900">{title.year}</dd>
                <dt className="text-sm text-gray-600">Content Rating</dt>
                <dd className="font-medium text-gray-900">{title.rating}</dd>
                <dt className="text-sm text-gray-600">Type</dt>
                <dd className="font-medium text-gray-900 capitalize">{title.type}</dd>
                {title.type === 'series' && (
                  <>
                    <dt className="text-sm text-gray-600">Episodes</dt>
                    <dd className="font-medium text-gray-900">{title.episodes}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* Available Formats */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Available Formats</h3>
              <div className="space-y-2">
                {title.formats.map((format, index) => (
                  <div
                    key={index}
                    className="flex items-center px-3 py-2 bg-gray-50 rounded"
                  >
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium text-gray-700">{format}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Membership Required */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Membership Required</h3>
              <p className="text-purple-100 mb-4">
                This content requires {title.requiredMembership} membership
              </p>
              <Link href="/plans">
                <Button variant="secondary" className="w-full bg-white text-purple-600 hover:bg-gray-100">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Video Player Example (commented out - uncomment when HLS source available) */}
        {/*
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Watch Now</h2>
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            {title.isImmersive ? (
              // VR Player for immersive content
              <VRPlayer
                src="https://your-cdn.com/video.m3u8"
                poster={title.banner}
                is360={true}
                isStereo={title.formats.includes('Stereo 360')}
                autoPlay={false}
                initialBitrate={-1}
                onQualityChange={(level, bitrate) => {
                  console.log(`Quality changed to level ${level}, bitrate: ${bitrate}`)
                }}
                onError={(error) => {
                  console.error('Playback error:', error)
                }}
                className="aspect-video"
              />
            ) : (
              // Standard Video Player for regular content
              <VideoPlayer
                src="https://your-cdn.com/video.m3u8"
                poster={title.banner}
                autoPlay={false}
                controls={true}
                initialBitrate={-1}
                onQualityChange={(level, bitrate) => {
                  console.log(`Quality changed to level ${level}, bitrate: ${bitrate}`)
                }}
                onError={(error) => {
                  console.error('Playback error:', error)
                }}
                className="aspect-video"
              />
            )}
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> To use the video players, uncomment this section and replace the HLS source URL 
              with your actual video stream endpoint. The player will automatically handle adaptive bitrate streaming 
              and quality selection.
              {title.isImmersive && (
                <span className="block mt-2">
                  This is an immersive title - the VR player allows you to drag to look around in 360°. 
                  {title.formats.includes('Stereo 360') && 
                    ' Stereoscopic 3D mode is enabled for enhanced depth perception.'
                  }
                </span>
              )}
            </p>
          </div>
        </section>
        */}

        {/* Back to Catalog */}
        <div className="text-center">
          <Link href="/catalog">
            <Button variant="secondary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
