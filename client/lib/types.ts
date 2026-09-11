export type Course = {
  id: string
  title: string
  description: string
  weeks: string
  tuition: number
  minimumSkill: string
  scholarshipAvailable: boolean
  bootcampId: string
  userId: string
  createdAt: string
}

export type Bootcamp = {
  id: string
  name: string
  slug: string | null
  description: string
  website: string | null
  phone: string | null
  email: string
  address: string
  formattedAddress: string | null
  city: string | null
  state: string | null
  zipcode: string | null
  country: string | null
  careers: string[]
  averageRating: number | null
  averageCost: number | null
  photo: string
  housing: boolean
  jobAssistance: boolean
  jobGuarantee: boolean
  acceptGi: boolean
  createdAt: string
  userId: string
  courses: Course[]
}

export type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export type Review = {
  id: string
  title: string
  text: string
  rating: number
  bootcampId: string
  userId: string
  createdAt: string
}
