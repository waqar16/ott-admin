"use client";
import { useEffect, useState } from 'react';
import { featuredTrailers } from '@/lib/featuredTrailers';
import { VideoPlayer } from '@/players/VideoPlayer';
import Link from 'next/link';

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);

  // Auto advance every 7s
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % featuredTrailers.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const goTo = (i: number) => setIndex(i);
  const next = () => setIndex((i) => (i + 1) % featuredTrailers.length);
  const prev = () => setIndex((i) => (i - 1 + featuredTrailers.length) % featuredTrailers.length);

  const active = featuredTrailers[index];

  return (
    <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden bg-black">
      {/* Slides */}
      {featuredTrailers.map((t, i) => (
        <div
          key={t.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: `url(${t.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden={i !== index}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 max-w-5xl">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">{active.title}</h1>
        <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mb-6">{active.logline}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {active.badges.map((b) => (
            <span key={b} className="px-3 py-1 text-xs md:text-sm rounded-full bg-white/10 backdrop-blur border border-white/20 text-white">
              {b}
            </span>
          ))}
          {active.isImmersive && (
            <span className="px-3 py-1 text-xs md:text-sm rounded-full bg-pink-600 text-white">Immersive</span>
          )}
        </div>
        <div className="flex gap-4">
          <Link
            href="/signup?plan=full"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:scale-[1.02] transition"
          >
            Start Watching
          </Link>
          <Link
            href="/demo"
            className="px-6 py-3 rounded-lg bg-white/10 text-white font-semibold backdrop-blur border border-white/30 hover:bg-white/20 transition"
          >
            Watch Free Demo
          </Link>
          <button
            onClick={() => setShowTrailer(true)}
            className="px-6 py-3 rounded-lg bg-black/50 text-white font-semibold border border-white/40 hover:bg-black/70 transition"
            aria-label="Play trailer"
          >
            ▶ Play Trailer
          </button>
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
        aria-label="Previous featured title"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
        aria-label="Next featured title"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {featuredTrailers.map((t, i) => (
          <button
            key={t.id}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-3 h-3 rounded-full ${i === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'} transition`}
          />
        ))}
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 right-0 text-white text-2xl"
              aria-label="Close trailer"
            >
              ✕
            </button>
            {/* Use VideoPlayer for HLS playlist; fallback to native video */}
            {active.trailerHlsUrl ? (
              <VideoPlayer src={active.trailerHlsUrl} autoPlay controls className="aspect-video" />
            ) : (
              <video src={active.poster} controls autoPlay className="w-full aspect-video" />
            )}
            <div className="mt-4 text-center text-gray-200 text-sm">
              Trailer quality selectable. Full feature requires signup.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
