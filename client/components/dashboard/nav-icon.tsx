import {
  LayoutGrid, Building2, BookOpen, Star, Users, Map, Image,
  Code, Settings, CreditCard, type LucideProps,
} from 'lucide-react'

const icons: Record<string, React.ComponentType<LucideProps>> = {
  grid: LayoutGrid,
  building: Building2,
  book: BookOpen,
  star: Star,
  users: Users,
  map: Map,
  image: Image,
  code: Code,
  settings: Settings,
  card: CreditCard,
}

export default function NavIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name] ?? LayoutGrid
  return <Icon {...props} />
}
