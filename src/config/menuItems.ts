import { Home, User, Bell, Users, Music, Calendar, Play, BarChart3, HelpCircle, LogOut } from 'lucide-react'

export type MenuItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  href?: string
  badge?: number | null
  onClick?: () => void
}

// Shared menu items used across all pages
export const getMenuItems = (onLogout?: () => void): MenuItem[] => [
  {
    icon: Home,
    title: 'Home',
    href: '/home',
    badge: null,
  },
  {
    icon: User,
    title: 'Profile',
    href: '/pages/profile',
    badge: null,
  },
  {
    icon: Bell,
    title: 'Push Notifications',
    href: '#',
    badge: 164,
  },
  {
    icon: Users,
    title: 'Groups',
    href: '#',
    badge: null,
  },
  {
    icon: Music,
    title: 'Submit Song',
    href: '#',
    badge: null,
  },
  {
    icon: Calendar,
    title: 'Rehearsals',
    href: '/pages/rehearsals',
    badge: null,
  },
  {
    icon: Play,
    title: 'Media',
    href: '#',
    badge: null,
  },
  {
    icon: Calendar,
    title: 'Ministry Calendar',
    href: '#',
    badge: null,
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    href: '#',
    badge: null,
  },
  {
    icon: HelpCircle,
    title: 'Admin Support',
    href: '#',
    badge: null,
  },
  {
    icon: LogOut,
    title: 'Logout',
    href: '#',
    badge: null,
    onClick: onLogout,
  },
]

