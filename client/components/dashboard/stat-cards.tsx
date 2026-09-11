import { Building2, BookOpen, Star, TrendingUp } from 'lucide-react'

interface StatCardsProps {
  bootcampCount: number
  courseCount: number
  reviewCount: number
  avgRating: number | null
}

const statDefs = [
  { key: 'bootcamps', label: 'Bootcamps', icon: Building2, delta: 'total listings' },
  { key: 'courses', label: 'Courses', icon: BookOpen, delta: 'across all bootcamps' },
  { key: 'reviews', label: 'Reviews', icon: Star, delta: 'from students' },
  { key: 'avgRating', label: 'Avg. Rating', icon: TrendingUp, delta: 'across all listings' },
]

export default function StatCards({ bootcampCount, courseCount, reviewCount, avgRating }: StatCardsProps) {
  const values: Record<string, string> = {
    bootcamps: String(bootcampCount),
    courses: String(courseCount),
    reviews: String(reviewCount),
    avgRating: avgRating != null ? avgRating.toFixed(1) : '—',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {statDefs.map(({ key, label, icon: Icon, delta }) => (
        <div key={key} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent">
              <Icon className="size-4 text-accent-foreground" />
            </div>
          </div>
          <p className="text-2xl font-semibold tracking-tight">{values[key]}</p>
          <p className="mt-1 text-xs text-muted-foreground">{delta}</p>
        </div>
      ))}
    </div>
  )
}
