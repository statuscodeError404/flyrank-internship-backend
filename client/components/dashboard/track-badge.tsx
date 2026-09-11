import { Star } from 'lucide-react'
import { careerToTrack, trackMeta, cn } from '@/lib/utils'

interface TrackBadgeProps {
  careers: string[]
  className?: string
}

export function TrackBadge({ careers, className }: TrackBadgeProps) {
  const track = careerToTrack(careers)
  const meta = trackMeta[track]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-0.5 text-xs font-medium text-card-foreground', className)}>
      <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.colorVar }} />
      {meta.label}
    </span>
  )
}

interface StarRatingProps {
  rating: number | null
  count?: number
}

export function StarRating({ rating, count }: StarRatingProps) {
  if (rating == null) return <span className="text-xs text-muted-foreground">No ratings</span>
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Star className="size-3.5 fill-current" style={{ color: 'var(--track-data)' }} />
      <span className="font-semibold">{rating.toFixed(1)}</span>
      {count != null && <span className="text-muted-foreground">({count})</span>}
    </span>
  )
}
