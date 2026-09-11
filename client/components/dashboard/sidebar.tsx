'use client'
import { X, GraduationCap, PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import NavIcon from './nav-icon'
import type { User } from '@/lib/types'

const navSections = [
  {
    title: 'Manage',
    items: [
      { key: 'overview', label: 'Overview', icon: 'grid', active: true },
      { key: 'bootcamps', label: 'Bootcamps', icon: 'building' },
      { key: 'courses', label: 'Courses', icon: 'book' },
      { key: 'reviews', label: 'Reviews', icon: 'star' },
    ],
  },
  {
    title: 'Platform',
    items: [
      { key: 'users', label: 'Users', icon: 'users' },
      { key: 'geospatial', label: 'Geospatial Search', icon: 'map' },
      { key: 'media', label: 'Media Library', icon: 'image' },
      { key: 'api', label: 'API Docs', icon: 'code' },
    ],
  },
  {
    title: 'Account',
    items: [
      { key: 'settings', label: 'Settings', icon: 'settings' },
      { key: 'billing', label: 'Billing', icon: 'card' },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
  user: User | null
  counts: { bootcamps: number; courses: number; reviews: number }
}

export default function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile, user, counts }: SidebarProps) {
  const badgeFor = (key: string): number | null => {
    if (key === 'bootcamps') return counts.bootcamps
    if (key === 'courses') return counts.courses
    if (key === 'reviews') return counts.reviews
    return null
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-3 gap-3 flex-shrink-0">
        <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <GraduationCap className="size-5" />
        </div>
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold">DevCamper</p>
            <p className="truncate text-xs text-muted-foreground">Publisher Console</p>
          </div>
        )}
        {/* Mobile close button */}
        <button onClick={onCloseMobile} className="ml-auto md:hidden rounded p-1 hover:bg-sidebar-accent">
          <X className="size-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navSections.map(section => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(item => {
                const badge = badgeFor(item.key)
                return (
                  <li key={item.key}>
                    <a
                      href="#"
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors',
                        item.active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        collapsed && 'justify-center'
                      )}
                    >
                      <NavIcon name={item.icon} className="size-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {badge != null && (
                            <span className="ml-auto rounded-full bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-medium text-sidebar-accent-foreground">
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 flex items-center gap-3 flex-shrink-0">
        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
          {initials}
        </div>
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user?.name ?? 'Publisher'}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user?.role ?? 'publisher'}</p>
          </div>
        )}
        <button
          onClick={onToggleCollapsed}
          className="hidden md:flex ml-auto rounded p-1 hover:bg-sidebar-accent text-muted-foreground"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 shadow-xl transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          'hidden md:flex flex-col flex-shrink-0 transition-[width] duration-300 overflow-hidden border-r border-sidebar-border',
          collapsed ? 'w-[76px]' : 'w-64'
        )}
      >
        {sidebarContent}
      </div>
    </>
  )
}
