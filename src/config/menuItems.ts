import { Home, User, Bell, Users, Music, Calendar, Play, BarChart3, HelpCircle, LogOut, Headphones, MessageCircle, RefreshCw, RotateCcw, RotateCw, Mic } from 'lucide-react'

export type MenuItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  href?: string
  badge?: boolean | null
  onClick?: () => void
}

// Shared menu items used across all pages
export const getMenuItems = (onLogout?: () => void, onRefresh?: () => void): MenuItem[] => [
 
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
    icon: Mic,
    title: 'Audio Lab',
    href: '/pages/audio-lab',
    badge: null,
  },
  {
    icon: Calendar,
    title: 'Ministry Calendar',
    href: '/pages/calendar',
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
    icon: RotateCw,
    title: 'Refresh App',
    href: '#',
    badge: null,
    onClick: onRefresh,
  },
  {
    icon: LogOut,
    title: 'Logout',
    href: '#',
    badge: null,
    onClick: onLogout,
  },
]
// bro ha laoding program daa is o slow ver slow wh i hough is mean o be insan and a;lso he song card is no showing he rehearsal coun updae i is working bu is no showing he updae check if i is geing he rehearsal coun well from he meadaa spli or rimem
