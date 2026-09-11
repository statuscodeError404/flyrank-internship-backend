# DevCamper — Publisher Dashboard (Front-End Transfer Spec)

A complete specification for reproducing the DevCamper publisher dashboard UI in another
codebase. This describes a **visual mockup** (no real backend). Everything is static/dummy
data with client-side interactivity only (filtering, search, drawer, collapsible sidebar).

Use this document as a prompt: hand it to an AI or a developer and they should be able to
rebuild the exact same UI.

---

## 1. Tech Stack & Dependencies

| Concern            | Choice                                                        |
| ------------------ | ------------------------------------------------------------- |
| Framework          | Next.js 16 (App Router, React Server + Client Components)     |
| Language           | TypeScript                                                    |
| Styling            | Tailwind CSS v4 (CSS-first config via `@theme inline`)        |
| Icons              | `lucide-react`                                                |
| Fonts              | `next/font/google` — Geist (sans) + Geist Mono                |
| Images             | `next/image`                                                  |
| State              | React `useState` / `useMemo` (no external state library)      |
| Utilities          | `cn()` helper (clsx + tailwind-merge) at `lib/utils.ts`       |

No database, no API calls, no auth. All data is hardcoded in `lib/data.ts`.

If porting to a non-Next stack (Vite/CRA/Remix): replace `next/image` with `<img>`,
replace `next/font` with a `<link>` to Geist or any 2-font pairing, and swap the
`"use client"` directives accordingly.

---

## 2. Design System

### 2.1 Aesthetic direction
Clean, professional, developer-facing admin console. Emerald/teal primary accent on a
near-neutral (very slightly teal-tinted) background. Data-dense but breathable. Rounded
corners (0.625rem base radius), soft shadows, subtle borders. Supports light and dark mode.

### 2.2 Color tokens (OKLCH)
Defined as CSS variables on `:root` (light) and `.dark` (dark). Exposed to Tailwind via
`@theme inline` so classes like `bg-background`, `text-muted-foreground`, `border-border`,
`bg-primary`, `bg-sidebar`, etc. all work.

**Light (`:root`)**
```
--background: oklch(0.985 0.003 175);
--foreground: oklch(0.2 0.02 175);
--card: oklch(1 0 0);
--card-foreground: oklch(0.2 0.02 175);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.2 0.02 175);
--primary: oklch(0.58 0.11 173);
--primary-foreground: oklch(0.99 0.01 175);
--secondary: oklch(0.96 0.006 175);
--secondary-foreground: oklch(0.28 0.02 175);
--muted: oklch(0.96 0.006 175);
--muted-foreground: oklch(0.52 0.015 175);
--accent: oklch(0.94 0.02 173);
--accent-foreground: oklch(0.32 0.06 173);
--destructive: oklch(0.577 0.245 27.325);
--border: oklch(0.9 0.008 175);
--input: oklch(0.9 0.008 175);
--ring: oklch(0.58 0.11 173);
--radius: 0.625rem;

/* Career-track accent colors */
--track-web: oklch(0.58 0.11 173);      /* teal/emerald */
--track-mobile: oklch(0.62 0.13 245);   /* blue */
--track-uiux: oklch(0.62 0.19 20);      /* red/coral */
--track-data: oklch(0.72 0.15 75);      /* amber/gold (also used for star rating) */
--track-business: oklch(0.5 0.02 175);  /* neutral slate */

/* Sidebar-specific tokens */
--sidebar: oklch(0.99 0.004 175);
--sidebar-foreground: oklch(0.2 0.02 175);
--sidebar-primary: oklch(0.58 0.11 173);
--sidebar-primary-foreground: oklch(0.99 0.01 175);
--sidebar-accent: oklch(0.94 0.02 173);
--sidebar-accent-foreground: oklch(0.32 0.06 173);
--sidebar-border: oklch(0.9 0.008 175);
--sidebar-ring: oklch(0.58 0.11 173);
```

**Dark (`.dark`)**
```
--background: oklch(0.17 0.012 190);
--foreground: oklch(0.96 0.005 175);
--card: oklch(0.21 0.014 190);
--card-foreground: oklch(0.96 0.005 175);
--popover: oklch(0.21 0.014 190);
--popover-foreground: oklch(0.96 0.005 175);
--primary: oklch(0.7 0.12 173);
--primary-foreground: oklch(0.17 0.012 190);
--secondary: oklch(0.26 0.016 190);
--secondary-foreground: oklch(0.96 0.005 175);
--muted: oklch(0.26 0.016 190);
--muted-foreground: oklch(0.7 0.015 175);
--accent: oklch(0.3 0.03 173);
--accent-foreground: oklch(0.9 0.04 173);
--destructive: oklch(0.704 0.191 22.216);
--border: oklch(1 0 0 / 10%);
--input: oklch(1 0 0 / 15%);
--ring: oklch(0.7 0.12 173);

--track-web: oklch(0.7 0.12 173);
--track-mobile: oklch(0.68 0.13 245);
--track-uiux: oklch(0.68 0.18 20);
--track-data: oklch(0.78 0.15 75);
--track-business: oklch(0.65 0.02 175);

--sidebar: oklch(0.19 0.013 190);
--sidebar-foreground: oklch(0.96 0.005 175);
--sidebar-primary: oklch(0.7 0.12 173);
--sidebar-primary-foreground: oklch(0.17 0.012 190);
--sidebar-accent: oklch(0.3 0.03 173);
--sidebar-accent-foreground: oklch(0.9 0.04 173);
--sidebar-border: oklch(1 0 0 / 10%);
--sidebar-ring: oklch(0.7 0.12 173);
```

In `@theme inline`, map the track vars so utility classes exist:
```
--color-track-web: var(--track-web);
--color-track-mobile: var(--track-mobile);
--color-track-uiux: var(--track-uiux);
--color-track-data: var(--track-data);
--color-track-business: var(--track-business);
```
Track colors are mostly applied inline via `style={{ backgroundColor: "var(--track-x)" }}`
because they're data-driven.

### 2.3 Typography
- **Sans:** Geist (`--font-geist-sans`) → `font-sans`. Used everywhere.
- **Mono:** Geist Mono (`--font-geist-mono`) → `font-mono`. Available, used sparingly.
- Body text `leading-relaxed`. Headings `font-semibold tracking-tight`.
- Titles use `text-balance`; long descriptions use relaxed leading.

### 2.4 Spacing / shape conventions
- Card radius: `rounded-xl`. Pills/badges: `rounded-full`. Buttons/inputs: `rounded-lg`.
- Cards: `border border-border bg-card shadow-sm`, hover `shadow-md`.
- Use Tailwind spacing scale + `gap-*` for layout (flexbox first, grid for the card grid).
- Add background color to `<html>`: `className="bg-background"`.

---

## 3. Data Model (dummy data in `lib/data.ts`)

### 3.1 Types
```ts
type Track = "Web Dev" | "Mobile Dev" | "UI/UX" | "Data Science" | "Business"

type Course = {
  id: string
  title: string
  weeks: number
  tuition: number
  minimumSkill: "beginner" | "intermediate" | "advanced"
  scholarship: boolean
  description: string
}

type Bootcamp = {
  id: string
  name: string
  slug: string
  track: Track
  location: string
  photo: string          // path under /public
  averageRating: number  // 0-5
  reviewCount: number
  averageCost: number     // USD
  published: boolean
  courses: Course[]
}
```

### 3.2 TRACK_META
Maps each track to `{ label, colorVar, short }` where `colorVar` is one of the
`var(--track-*)` values above (short codes: WEB, MOB, UX, DATA, BIZ).

### 3.3 Seed content
6 bootcamps (collections), 12 courses (items) total:

1. **Devworks Bootcamp** — Web Dev — Boston, MA — ★4.7 (128) — avg $11,250 — Published — 3 courses (Full Stack Web Development, Front End Foundations, Backend APIs with Express)
2. **ModernTech Bootcamp** — Mobile Dev — Lowell, MA — ★4.3 (86) — avg $9,800 — Published — 2 courses (iOS Development with Swift, React Native Cross-Platform)
3. **Codemasters Academy** — UI/UX — Providence, RI — ★4.9 (203) — avg $7,500 — Published — 2 courses (Product Design Immersive, UX Writing & Content Design)
4. **Devcentral Bootcamp** — Data Science — Kingston, RI — ★4.1 (54) — avg $14,200 — **Draft** — 2 courses (Applied Machine Learning, Data Analytics Fundamentals)
5. **Founders Institute** — Business — Cambridge, MA — ★3.9 (41) — avg $6,400 — Published — 1 course (Tech Product Management)
6. **Northshore Coding School** — Web Dev — Salem, MA — ★4.5 (97) — avg $10,200 — Published — 2 courses (JavaScript Career Track, Cloud & DevOps Essentials)

Each course has realistic `weeks`, `tuition`, `minimumSkill`, `scholarship`, and a 1–2
sentence `description`.

### 3.4 Stats (overview cards)
Array of `{ label, value, delta, icon }`:
- Bootcamps · 6 · "+1 this month" · building
- Courses · 12 · "+3 this month" · book
- Reviews · 609 · "+48 this week" · star
- Avg. Rating · 4.4 · "across all listings" · trend

### 3.5 navSections (sidebar)
Three sections:
- **Manage:** Overview (active, icon grid), Bootcamps (badge 6), Courses (badge 12), Reviews (badge 609)
- **Platform:** Users, Geospatial Search (map), Media Library (image), API Docs (code)
- **Account:** Settings, Billing (card)

---

## 4. File / Component Structure

```
app/
  layout.tsx                      # fonts, metadata, <html className="bg-background ...">
  page.tsx                        # renders <Dashboard />
  globals.css                     # Tailwind v4 import + theme tokens
lib/
  data.ts                         # types + dummy data (section 3)
  utils.ts                        # cn() helper (pre-existing)
components/dashboard/
  dashboard.tsx                   # top-level shell + state (client)
  sidebar.tsx                     # collapsible + mobile drawer nav (client)
  topbar.tsx                      # search, notifications, New Bootcamp (client)
  stat-cards.tsx                  # 4 overview stat cards
  bootcamp-card.tsx               # collection card w/ nested course list (client)
  course-drawer.tsx               # right-side item detail drawer (client)
  nav-icon.tsx                    # string->lucide icon resolver
  track-badge.tsx                 # TrackBadge + StarRating helpers
public/
  bootcamp-devworks.png           # 6 generated cover photos
  bootcamp-moderntech.png
  bootcamp-codemasters.png
  bootcamp-devcentral.png
  bootcamp-founders.png
  bootcamp-northshore.png
```

---

## 5. Component Specs

### 5.1 `Dashboard` (shell + state)
Client component. Owns all interactive state:
- `collapsed` (bool) — desktop sidebar collapsed
- `mobileNavOpen` (bool) — mobile sidebar drawer open
- `query` (string) — search text
- `activeTrack` (`Track | "All"`) — track filter
- `selected` (`{ course, bootcamp } | null`) — open drawer target

Layout: `flex min-h-dvh bg-background` → `<Sidebar />` + a `flex-1 flex-col` column
containing `<Topbar />` and `<main>`.

`filtered` = `useMemo` over bootcamps matching `activeTrack` AND a case-insensitive query
against bootcamp name, location, or any course title.

`<main>` (px-4 py-6, md:px-6) contains, in order:
1. **Page heading** — "Overview" (`text-xl md:text-2xl font-semibold tracking-tight`) + muted subtitle "Manage your bootcamp listings and their courses."
2. **Stat cards** — `<StatCards />`
3. **Filter bar** — a `SlidersHorizontal` icon + "Track" label, then track chips: `All` + one per track. Right side (desktop only): a grid/list view toggle (visual only, grid active). Chips are `rounded-full border px-3 py-1`; active chip = `bg-primary text-primary-foreground`; inactive shows a small track color dot.
4. **Result count** — "{n} bootcamp(s)".
5. **Card grid** — `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`, one `<BootcampCard>` each. Empty state: dashed-border panel "No bootcamps found".

Renders `<CourseDrawer>` at the end (fixed-position overlay).

**TrackChip** sub-component: props `{ label, color?, active, onClick }`.

### 5.2 `Sidebar`
Client. Props: `{ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }`.
- Fixed slide-in drawer on mobile (`fixed inset-y-0 left-0 w-64`, translate-x based on `mobileOpen`); static on desktop (`md:static`). Width animates `md:w-64` ↔ `md:w-[76px]` when collapsed (`transition-[width] duration-300`).
- Mobile: dark backdrop button (`bg-foreground/40 backdrop-blur-sm md:hidden`) closes it.
- **Brand header** (h-16, border-b): teal rounded square with `GraduationCap` icon + "DevCamper" / "Publisher Console" (hidden when collapsed). Mobile close `X` button.
- **Nav**: iterate `navSections`. Section title (uppercase, tiny, muted) hidden when collapsed. Each item is an `<a href="#">` with `NavIcon`, label, optional count badge. Active item = `bg-sidebar-primary text-sidebar-primary-foreground`; others hover `bg-sidebar-accent`. When collapsed, icons center and labels/badges hide (show `title` tooltip).
- **Footer**: user chip (avatar initials "JD", "Jordan Diaz" / "Publisher") + a desktop-only Collapse/expand toggle button (`PanelLeftClose` / `PanelLeft`).

### 5.3 `Topbar`
Client. Props: `{ query, onQueryChange, onOpenMobileNav }`.
`sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur`.
- Mobile hamburger (`Menu`, `md:hidden`) → opens mobile nav.
- Search input: `flex-1 md:max-w-md`, leading `Search` icon, placeholder "Search bootcamps, courses…", controlled by `query`, `focus:ring-2 focus:ring-ring/50`.
- Right: notifications bell (with a destructive dot) + primary "New Bootcamp" button (`Plus` icon; label hidden on `<sm`). Both visual-only.

### 5.4 `StatCards`
Server component. `grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4`. Each card:
`rounded-xl border bg-card p-4 shadow-sm` with label + icon chip (`bg-accent`), big value
(`text-2xl font-semibold`), muted delta line. Icon resolved from a local `STAT_ICONS` map
(building=Building2, book=BookOpen, star=Star, trend=TrendingUp).

### 5.5 `BootcampCard` (collection)
Client. Props: `{ bootcamp, onSelectCourse(course, bootcamp) }`.
`article` — `flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md`.
- **Cover** (`h-32`): `next/image` fill cover of `bootcamp.photo`. Overlaid top-left `TrackBadge` (with `bg-background/90 backdrop-blur`); top-right status pill — Published = `bg-primary/90 text-primary-foreground`, Draft = `bg-background/90 text-muted-foreground`.
- **Header** (p-4): bootcamp name (truncate, `text-base font-semibold`) + a row with `MapPin` location and `StarRating`. A `MoreHorizontal` actions button (visual only).
- **Meta row**: 2-col grid of muted tiles — "Avg. Cost" (formatted USD) and "Courses" (count).
- **Courses list** (border-t, `mt-auto`): "Courses" label, then each course is a full-width button → calls `onSelectCourse`. Shows title + a `Clock` line "{weeks} weeks · $tuition" and a `ChevronRight` that nudges right on hover.
- `money(n)` helper: `$${n.toLocaleString("en-US")}`.

### 5.6 `CourseDrawer` (item drawer)
Client. Props: `{ course, bootcamp, onClose }`. `open = Boolean(course && bootcamp)`.
- **Overlay**: `fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm`, fades via opacity; click closes.
- **Panel**: `fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-card shadow-xl`, slides via `translate-x-0` / `translate-x-full`, `transition-transform duration-300`. `role="dialog" aria-modal="true"`.
- **Escape key** closes (via `useEffect` keydown listener when open).
- **Header** (border-b p-5): `TrackBadge`, course title (`text-lg font-semibold text-balance`), bootcamp name with `Building2` icon, and a close `X`.
- **Body** (scrollable p-5):
  - 2-col grid of `DetailStat` tiles: Duration (Clock, "{weeks} weeks"), Tuition (DollarSign, USD), Min. Skill (GraduationCap, capitalized), Scholarship (Award, "Available"/"None").
  - **Description** section (relaxed muted paragraph).
  - **Aggregated Metrics** section: bordered, divided list of `MetricRow`s — Bootcamp avg. rating, Bootcamp avg. cost, Total reviews, Location.
- **Footer** (border-t p-4): primary "Edit Course" button (Pencil) + square destructive-hover delete button (Trash2). Visual only.
- Sub-components: `DetailStat({ icon, label, value, capitalize })`, `MetricRow({ label, value })`.

### 5.7 `NavIcon`
Maps a string key → lucide icon component. Keys: grid, building, book, star, users, map,
image, code, settings, card. Falls back to `LayoutGrid`.

### 5.8 `TrackBadge` & `StarRating` (`track-badge.tsx`)
- **TrackBadge**: pill (`rounded-full border bg-card px-2.5 py-0.5 text-xs`) with a colored
  dot (`style backgroundColor: meta.colorVar`) + track label. Accepts `className`.
- **StarRating**: filled `Star` icon colored `var(--track-data)` + bold rating (1 decimal) +
  optional `(count)` in muted text.

---

## 6. Responsiveness

- **Mobile (< md):** sidebar becomes an off-canvas drawer opened by the topbar hamburger,
  closed by backdrop / X / nav choice. Card grid is 1 column. Stat cards 2 columns. Search
  fills width. Drawer is full-width (`w-full max-w-md`).
- **Tablet (sm–lg):** card grid 2 columns; stat cards still 2 (→ 4 at lg).
- **Desktop (md+):** static sidebar (collapsible to 76px icon rail via footer toggle); card
  grid up to 3 columns (`xl:grid-cols-3`); grid/list view toggle visible.
- Use `min-h-dvh` / `h-dvh` for full-height layout. Topbar is sticky.

---

## 7. Interactions (all client-side, no backend)

| Interaction              | Behavior                                                        |
| ------------------------ | --------------------------------------------------------------- |
| Search box               | Live-filters bootcamps by name / location / course title        |
| Track chips              | Filters grid to a single track (or All)                         |
| Click a course row       | Opens the right-side `CourseDrawer` with that course's details  |
| Drawer close             | Backdrop click, X button, or Escape key                         |
| Sidebar collapse (desk.) | Toggles icon-only rail                                           |
| Mobile hamburger         | Opens/closes off-canvas sidebar                                 |
| New Bootcamp / Edit / Delete / More / Notifications / view toggle | **Visual only — no handlers** |

---

## 8. Assets

6 cover photos live in `/public` (see section 4). They are AI-generated architectural /
studio photos, one per bootcamp, referenced by the `photo` field. Replace with any 16:9-ish
imagery; `next/image` renders them `object-cover` in a fixed `h-32` band. If real data is
wired later, these become `bootcamp.photo` URLs from the API.

---

## 9. Rebuild Checklist

1. Scaffold Next.js 16 + Tailwind v4 + TypeScript; install `lucide-react`.
2. Add Geist + Geist Mono via `next/font`; set `--font-sans` / `--font-mono` in `@theme`.
3. Paste the color tokens (section 2.2) into `globals.css`; add `bg-background` to `<html>`.
4. Create `lib/data.ts` with the types + seed data (section 3).
5. Build the 8 components in `components/dashboard/` (section 5).
6. Render `<Dashboard />` from `app/page.tsx`.
7. Drop 6 cover images into `/public`.
8. Verify light/dark, mobile drawer, track filtering, search, and the course drawer.