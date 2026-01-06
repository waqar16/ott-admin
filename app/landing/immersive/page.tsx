"use client";
import { RowCarousel } from "@/components/RowCarousel";
import { HeroCarousel } from "@/components/HeroCarousel";
import type { CatalogTitle } from "@/app/api/catalog/route";

export default function ImmersiveLandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <HeroCarousel />
      <section className="px-6 py-12 bg-gradient-to-b from-black via-gray-900 to-black">
        <h2 className="text-3xl font-bold mb-6">Immersive VR Showcase</h2>
        <p className="max-w-2xl text-gray-300 mb-10">
          Dive deeper into 360° and 180° cinematic experiences. This curated selection highlights
          spatial storytelling, stereoscopic depth and ultra-high resolutions up to 14K (mock).
        </p>
        <div className="space-y-10">
          <RowCarousel title="Featured Immersive" filter={(t: CatalogTitle) => t.isImmersive} />
          <RowCarousel title="360° Experiences" filter={(t: CatalogTitle) => t.projection === '360'} />
          <RowCarousel title="180° Close-Ups" filter={(t: CatalogTitle) => t.projection === '180'} />
          <RowCarousel title="Stereoscopic 3D" filter={(t: CatalogTitle) => t.dimension === '3D'} />
          <RowCarousel title="Ultra Resolution" filter={(t: CatalogTitle) => ['13K','14K'].includes(t.resolutionClass)} />
          <RowCarousel title="Try Before You Join" filter={(t: CatalogTitle) => t.visibleWithoutSignup || t.isDemoContent} />
        </div>
      </section>
    </div>
  );
}
