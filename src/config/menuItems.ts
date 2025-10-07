import { Home, User, Bell, Users, Music, Calendar, Play, BarChart3, HelpCircle, LogOut, Headphones, MessageCircle } from 'lucide-react'

export type MenuItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  href?: string
  badge?: boolean | null
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
    title: 'Notifications',
    href: '/pages/notifications',
    badge: true,
  },
  {
    icon: Users,
    title: 'Groups',
    href: '/pages/groups',
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
    href: '/pages/ministry-calendar',
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
    href: '/pages/support',
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

