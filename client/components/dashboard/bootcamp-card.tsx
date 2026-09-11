'use client'
import { MapPin, MoreHorizontal, Clock, ChevronRight } from 'lucide-react'
import { TrackBadge, StarRating } from './track-badge'
import { money, photoUrl } from '@/lib/utils'
import type { Bootcamp, Course } from '@/lib/types'

interface BootcampCardProps {
  bootcamp: Bootcamp
  onSelectCourse: (course: Course, bootcamp: Bootcamp) => void
}

export default function BootcampCard({ bootcamp, onSelectCourse }: BootcampCardProps) {
  const location = [bootcamp.city, bootcamp.state].filter(Boolean).join(', ') || bootcamp.address
  const url = photoUrl(bootcamp.photo)

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      {/* Cover */}
      <div className="relative h-32 bg-accent flex-shrink-0">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={bootcamp.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <span className="text-4xl font-bold opacity-20">{bootcamp.name[0]}</span>
          </div>
        )}
        <div className="absolute left-2 top-2">
          <TrackBadge careers={bootcamp.careers} className="bg-background/90 backdrop-blur" />
        </div>
      </div>

      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-base font-semibold">{bootcamp.name}</h3>
          <button className="flex-shrink-0 rounded p-1 hover:bg-accent text-muted-foreground">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            <span className="truncate max-w-[120px]">{location}</span>
          </div>
          <StarRating rating={bootcamp.averageRating} />
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-px bg-border mx-4 rounded-lg overflow-hidden mb-2">
        <div className="bg-card px-3 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg. Cost</p>
          <p className="text-sm font-semibold">{money(bootcamp.averageCost)}</p>
        </div>
        <div className="bg-card px-3 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Courses</p>
          <p className="text-sm font-semibold">{bootcamp.courses.length}</p>
        </div>
      </div>

      {/* Courses list */}
      {bootcamp.courses.length > 0 && (
        <div className="mt-auto border-t border-border">
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Courses
          </p>
          {bootcamp.courses.map(course => (
            <button
              key={course.id}
              onClick={() => onSelectCourse(course, bootcamp)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-accent group transition-colors"
            >
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium">{course.title}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3 flex-shrink-0" />
                  {course.weeks} weeks · {money(course.tuition)}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      )}
    </article>
  )
}
