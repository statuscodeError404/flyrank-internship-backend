'use client'
import { useEffect } from 'react'
import { X, Clock, DollarSign, GraduationCap, Award, Building2, Pencil, Trash2 } from 'lucide-react'
import { TrackBadge } from './track-badge'
import { money } from '@/lib/utils'
import type { Course, Bootcamp } from '@/lib/types'

interface CourseDrawerProps {
  course: Course | null
  bootcamp: Bootcamp | null
  onClose: () => void
}

function DetailStat({ icon: Icon, label, value, capitalize }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="size-3.5" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-sm font-semibold ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export default function CourseDrawer({ course, bootcamp, onClose }: CourseDrawerProps) {
  const open = Boolean(course && bootcamp)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const location = bootcamp
    ? [bootcamp.city, bootcamp.state].filter(Boolean).join(', ') || bootcamp.address
    : ''

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {course && bootcamp && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border p-5 gap-4 flex-shrink-0">
              <div className="flex-1 overflow-hidden">
                <TrackBadge careers={bootcamp.careers} className="mb-2" />
                <h2 className="text-lg font-semibold text-balance leading-tight">{course.title}</h2>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="size-3.5 flex-shrink-0" />
                  <span className="truncate">{bootcamp.name}</span>
                </div>
              </div>
              <button onClick={onClose} className="flex-shrink-0 rounded-lg p-1.5 hover:bg-accent text-muted-foreground">
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <DetailStat icon={Clock} label="Duration" value={`${course.weeks} weeks`} />
                <DetailStat icon={DollarSign} label="Tuition" value={money(course.tuition)} />
                <DetailStat icon={GraduationCap} label="Min. Skill" value={course.minimumSkill} capitalize />
                <DetailStat icon={Award} label="Scholarship" value={course.scholarshipAvailable ? 'Available' : 'None'} />
              </div>

              {/* Description */}
              <div>
                <h3 className="mb-2 text-sm font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
              </div>

              {/* Bootcamp metrics */}
              <div>
                <h3 className="mb-2 text-sm font-semibold">Bootcamp Overview</h3>
                <div className="rounded-xl border border-border divide-y divide-border">
                  <div className="px-4">
                    <MetricRow label="Avg. Rating" value={bootcamp.averageRating != null ? `★ ${bootcamp.averageRating.toFixed(1)}` : 'N/A'} />
                    <MetricRow label="Avg. Cost" value={money(bootcamp.averageCost)} />
                    <MetricRow label="Total Courses" value={String(bootcamp.courses.length)} />
                    <MetricRow label="Location" value={location} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 border-t border-border p-4 flex-shrink-0">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                <Pencil className="size-4" />
                Edit Course
              </button>
              <button className="flex size-10 items-center justify-center rounded-lg border border-border hover:bg-destructive hover:text-white hover:border-destructive transition-colors text-muted-foreground">
                <Trash2 className="size-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
