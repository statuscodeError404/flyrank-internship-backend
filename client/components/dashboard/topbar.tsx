'use client'
import { Menu, Search, Bell, Plus } from 'lucide-react'

interface TopbarProps {
  query: string
  onQueryChange: (q: string) => void
  onOpenMobileNav: () => void
}

export default function Topbar({ query, onQueryChange, onOpenMobileNav }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4 md:px-6">
      <button
        onClick={onOpenMobileNav}
        className="md:hidden rounded-lg p-2 hover:bg-accent"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative flex-1 md:max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search bootcamps, courses…"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="relative rounded-lg p-2 hover:bg-accent" aria-label="Notifications">
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
        </button>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus className="size-4" />
          <span className="hidden sm:inline">New Bootcamp</span>
        </button>
      </div>
    </header>
  )
}
