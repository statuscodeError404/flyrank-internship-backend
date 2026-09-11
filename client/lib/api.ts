import type { Bootcamp, Course, Review, User } from './types'

const BASE = 'http://localhost:5000/api/v1'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> | undefined) },
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || data.message || 'API error')
  return data as T
}

export const api = {
  login: (email: string, password: string) =>
    apiFetch<{ success: boolean; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () =>
    apiFetch<{ success: boolean; data: User }>('/auth/me'),

  getBootcamps: () =>
    apiFetch<{ success: boolean; count: number; data: Bootcamp[] }>('/bootcamps'),

  getCourses: () =>
    apiFetch<{ success: boolean; count: number; data: Course[] }>('/courses'),

  getReviews: () =>
    apiFetch<{ success: boolean; count: number; data: Review[] }>('/reviews'),
}
