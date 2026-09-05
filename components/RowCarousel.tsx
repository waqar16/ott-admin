'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { CatalogTitle, CatalogResponse } from '@/app/api/catalog/route'

interface RowCarouselProps {
  title: string
  filter: (t: CatalogTitle) => boolean
  badgeExtractor?: (t: CatalogTitle) => string[]
  limit?: number
}

export function RowCarousel({ title, filter, badgeExtractor, limit = 20 }: RowCarouselProps) {
  const [items, setItems] = useState<CatalogTitle[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/catalog?pageSize=100')
      const data: CatalogResponse = await res.json()
      const filtered = data.titles.filter(filter).slice(0, limit)
      setItems(filtered)
    })()
  }, [filter, limit])

  const scrollBy = (dir: number) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir * 600, behavior: 'smooth' })
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3 px-2">
        <h2 className="text-xl md:text-2xl font-semibold text-white">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="px-2 py-1 rounded bg-white/10 text-white hover:bg-white/20"
          >
            ◂
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="px-2 py-1 rounded bg-white/10 text-white hover:bg-white/20"
          >
            ▸
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide px-2 pb-2">
        {items.map((t) => (
          <Link
            key={t.id}
            href={`/title/${t.id}`}
            className="group relative flex-shrink-0 w-40 md:w-48"
          >
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
              <img
                src={t.thumbnail}
                alt={t.title}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <div className="mt-2 text-xs text-gray-300 line-clamp-2 group-hover:text-white">
              {t.title}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-60 transition" />
            {/* Badges */}
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition">
              {(badgeExtractor ? badgeExtractor(t) : defaultBadges(t)).slice(0, 3).map((b) => (
                <span key={b} className="px-2 py-0.5 text-[10px] rounded bg-black/70 text-white">
                  {b}
                </span>
              ))}
            </div>
            {t.visibleWithoutSignup && (
              <span className="absolute top-2 left-2 bg-green-600 text-[10px] font-bold px-2 py-1 rounded">
                FREE
              </span>
            )}
          </Link>
        ))}
        {items.length === 0 && <div className="text-gray-400 text-sm px-2">No items</div>}
      </div>
    </div>
  )
}

function defaultBadges(t: CatalogTitle): string[] {
  const arr: string[] = []
  if (t.isImmersive) arr.push('Immersive')
  if (t.projection) arr.push(t.projection === 'flat' ? 'Flat' : `${t.projection}`)
  if (t.dimension) arr.push(t.dimension)
  if (t.resolutionClass) arr.push(t.resolutionClass)
  if (t.requiredMembership === 'FREE') arr.push('Free')
  return arr
}
