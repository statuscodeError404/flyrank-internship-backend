'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import Sidebar from './sidebar'
import Topbar from './topbar'
import StatCards from './stat-cards'
import BootcampCard from './bootcamp-card'
import CourseDrawer from './course-drawer'
import { api } from '@/lib/api'
import { careerToTrack, trackMeta, cn } from '@/lib/utils'
import type { Bootcamp, Course, User } from '@/lib/types'

interface Selected { course: Course; bootcamp: Bootcamp }

function TrackChip({ label, color, active, onClick }: { label: string; color?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
      )}
    >
      {!active && color && <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />}
      {label}
    </button>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeTrack, setActiveTrack] = useState<string>('All')
  const [selected, setSelected] = useState<Selected | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([])
  const [courseCount, setCourseCount] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    async function load() {
      try {
        const [userRes, bootcampsRes, coursesRes, reviewsRes] = await Promise.all([
          api.me(),
          api.getBootcamps(),
          api.getCourses(),
          api.getReviews(),
        ])
        setUser(userRes.data)
        setBootcamps(bootcampsRes.data)
        setCourseCount(coursesRes.count)
        setReviewCount(reviewsRes.count)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const availableTracks = useMemo(() => {
    const seen = new Set<string>()
    bootcamps.forEach(b => { if (b.careers?.length) seen.add(careerToTrack(b.careers)) })
    return Array.from(seen)
  }, [bootcamps])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return bootcamps.filter(b => {
      const trackMatch = activeTrack === 'All' || careerToTrack(b.careers) === activeTrack
      const textMatch = !q || [b.name, b.city ?? '', b.state ?? '', b.address, ...b.courses.map(c => c.title)]
        .some(s => s.toLowerCase().includes(q))
      return trackMatch && textMatch
    })
  }, [bootcamps, query, activeTrack])

  const avgRating = useMemo(() => {
    const rated = bootcamps.filter(b => b.averageRating != null)
    if (rated.length === 0) return null
    return rated.reduce((sum, b) => sum + (b.averageRating ?? 0), 0) / rated.length
  }, [bootcamps])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="rounded-xl border border-destructive/50 bg-card p-8 text-center max-w-sm">
          <p className="text-lg font-semibold text-destructive mb-2">Failed to load</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(c => !c)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        user={user}
        counts={{ bootcamps: bootcamps.length, courses: courseCount, reviews: reviewCount }}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Topbar
          query={query}
          onQueryChange={setQuery}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 py-6 md:px-6">
          {/* Page heading */}
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your bootcamp listings and their courses.</p>
          </div>

          {/* Stat cards */}
          <div className="mb-6">
            <StatCards
              bootcampCount={bootcamps.length}
              courseCount={courseCount}
              reviewCount={reviewCount}
              avgRating={avgRating}
            />
          </div>

          {/* Filter bar */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-1">
              <SlidersHorizontal className="size-4" />
              <span>Track</span>
            </div>
            <TrackChip label="All" active={activeTrack === 'All'} onClick={() => setActiveTrack('All')} />
            {availableTracks.map(track => {
              const meta = trackMeta[track]
              return (
                <TrackChip
                  key={track}
                  label={meta?.label ?? track}
                  color={meta?.colorVar}
                  active={activeTrack === track}
                  onClick={() => setActiveTrack(track)}
                />
              )
            })}
          </div>

          {/* Result count */}
          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length} bootcamp{filtered.length !== 1 ? 's' : ''}
          </p>

          {/* Card grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
              <p className="text-base font-medium">No bootcamps found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(bootcamp => (
                <BootcampCard
                  key={bootcamp.id}
                  bootcamp={bootcamp}
                  onSelectCourse={(course, bc) => setSelected({ course, bootcamp: bc })}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <CourseDrawer
        course={selected?.course ?? null}
        bootcamp={selected?.bootcamp ?? null}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
