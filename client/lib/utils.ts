import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const careerToTrack = (careers: string[]): string => {
  if (!careers || careers.length === 0) return 'web'
  const map: Record<string, string> = {
    'Web Development': 'web',
    'Mobile Development': 'mobile',
    'UI/UX': 'uiux',
    'Data Science': 'data',
    'Machine Learning': 'data',
    'Business': 'business',
    'Networking': 'web',
    'Other': 'web',
  }
  return map[careers[0]] ?? 'web'
}

export const trackMeta: Record<string, { label: string; colorVar: string; short: string }> = {
  web:      { label: 'Web Dev',      colorVar: 'var(--track-web)',      short: 'WEB'  },
  mobile:   { label: 'Mobile Dev',   colorVar: 'var(--track-mobile)',   short: 'MOB'  },
  uiux:     { label: 'UI/UX',        colorVar: 'var(--track-uiux)',     short: 'UX'   },
  data:     { label: 'Data Science', colorVar: 'var(--track-data)',     short: 'DATA' },
  business: { label: 'Business',     colorVar: 'var(--track-business)', short: 'BIZ'  },
}

export const money = (n: number | null) =>
  n != null ? `$${n.toLocaleString('en-US')}` : 'N/A'

export const photoUrl = (photo: string) => {
  if (!photo || photo === 'no-photo.jpg') return null
  return `http://localhost:5000/${photo}`
}
