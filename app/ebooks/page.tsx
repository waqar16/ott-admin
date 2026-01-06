export default function EbooksComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex items-center justify-center px-6 py-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-extrabold mb-6">Ebooks Library</h1>
        <p className="text-lg text-purple-200 mb-8">
          Interactive and immersive educational & entertainment ebooks are coming soon.
          You will be able to explore rich media, embedded 360° stills, and integrated VR teaser clips.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 opacity-40">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-[3/4] rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs">
              Placeholder {i}
            </div>
          ))}
        </div>
        <div className="space-y-2 text-sm text-purple-300">
          <p>Roadmap highlights:</p>
          <p>• EPUB & WebReader integration</p>
          <p>• VR image + short clip embeds</p>
          <p>• Multi-device sync & bookmarks</p>
        </div>
        <div className="mt-10 text-xs text-gray-400">
          TODO: Integrate real ebook catalog + DRM pipeline.
        </div>
      </div>
    </div>
  );
}
