'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, User, Users, Calendar, QrCode, CheckCircle, Clock, Award, Settings, Edit, Camera, Share2, Download, LogOut, Menu, X, Bell, Music, BarChart3, HelpCircle, Home, Play } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ScreenHeader from '@/components/ScreenHeader'

export default function ProfilePage() {
  const [showQRCode, setShowQRCode] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const router = useRouter()

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('hasCompletedProfile')
    localStorage.removeItem('hasSubscribed')
    
    // Redirect to auth screen
    router.push('/auth')
  }

  // Mock user data - in real app this would come from API/context
  const userProfile = {
    // Personal Information
    firstName: "John",
    middleName: "Michael",
    lastName: "Doe",
    fullName: "John Michael Doe",
    email: "john.doe@loveworld.com",
    phoneNumber: "+234 801 234 5678",
    gender: "Male",
    birthday: "1995-03-15",
    
    // Location Information
    region: "Lagos",
    zone: "Zone 1",
    church: "LoveWorld Central",
    
    // Ministry Information
    designation: "Tenor",
    administration: "Coordinator",
    socialProvider: "Google",
    socialId: "john.doe@gmail.com",
    
    // Additional Profile Data
    groups: ["Main Choir", "Praise Team", "Youth Choir"],
    joinDate: "January 2023",
    totalRehearsals: 45,
    attendanceRate: 92,
    lastCheckIn: "2 hours ago",
    achievements: ["Perfect Attendance - March", "Early Bird - 5x", "Team Player"],
    qrCode: "LW-USER-12345"
  }

  const attendanceHistory = [
    { date: "2024-01-15", event: "Sunday Rehearsal", status: "Present", time: "9:00 AM" },
    { date: "2024-01-12", event: "Friday Practice", status: "Present", time: "6:00 PM" },
    { date: "2024-01-10", event: "Wednesday Rehearsal", status: "Late", time: "7:15 PM" },
    { date: "2024-01-08", event: "Sunday Rehearsal", status: "Present", time: "9:00 AM" },
    { date: "2024-01-05", event: "Friday Practice", status: "Absent", time: "-" },
  ]

  // Generate a new QR code
  const generateQRCode = () => {
    const timestamp = Math.floor(Date.now() / 60000) // Changes every minute
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const newCode = `LW-USER-${timestamp}-${randomCode}`
    setQrCode(newCode)
    setTimeLeft(60)
  }

  // Auto-generate QR code every minute
  useEffect(() => {
    // Generate initial QR code
    generateQRCode()

    // Set up interval to regenerate every minute
    const interval = setInterval(() => {
      generateQRCode()
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const downloadQRCode = () => {
    // In real app, this would download the QR code image
    console.log("Downloading QR code...")
  }

  const features = [
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
      badge: 2,
    },
    {
      icon: Music,
      title: 'AudioLabs',
      href: '#',
      badge: 5,
    },
    {
      icon: Calendar,
      title: 'Rehearsals',
      href: '/pages/praise-night',
      badge: null,
    },
    {
      icon: Play,
      title: 'Media',
      href: '#',
      badge: 3,
    },
    {
      icon: Calendar,
      title: 'Ministy Calendar',
      href: '#',
      badge: null,
    },
    {
      icon: BarChart3,
      title: 'Our Marketplace',
      href: '#',
      badge: null,
    },
    {
      icon: HelpCircle,
      title: 'Support',
      href: '#',
      badge: null,
    },
    {
      icon: LogOut,
      title: 'Logout',
      href: '#',
      badge: null,
      onClick: handleLogout,
    },
  ]

  const rightButtons = null

  return (
    <div className="min-h-screen bg-white">
      {/* Animated Header */}
      <ScreenHeader 
        title="Profile" 
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        rightButtons={rightButtons}
        rightImageSrc="/logo.png"
      />

      {/* Profile Header */}
      <div className="px-4 py-8 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
              <User className="w-12 h-12 text-white" />
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors"
            >
              <Edit className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{userProfile.fullName}</h2>
          <p className="text-sm text-gray-600 mb-1">{userProfile.socialId}</p>
          <p className="text-xs text-gray-500 mb-4">{userProfile.email}</p>
          
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
              {userProfile.designation}
            </span>
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              {userProfile.administration}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{userProfile.totalRehearsals}</div>
            <div className="text-xs text-gray-600">Total Rehearsals</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{userProfile.attendanceRate}%</div>
            <div className="text-xs text-gray-600">Attendance Rate</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{userProfile.groups.length}</div>
            <div className="text-xs text-gray-600">Groups</div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                userProfile.socialProvider === 'google' ? 'bg-blue-500' : 'bg-purple-500'
              }`}>
                {userProfile.socialProvider === 'google' ? (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  </svg>
                ) : (
                  <span className="text-white font-bold text-sm">K</span>
                )}
              </div>
              <div>
                <p className="text-gray-900 text-sm font-medium">
                  {userProfile.socialProvider === 'google' ? 'Google Account' : 'KingsChat Account'}
                </p>
                <p className="text-gray-600 text-xs">{userProfile.socialId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">First Name</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.firstName}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Middle Name</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.middleName}</p>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Last Name</label>
              <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.lastName}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Gender</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.gender}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Birthday</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{new Date(userProfile.birthday).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Region</label>
              <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.region}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Zone</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.zone}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Church</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.church}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ministry Information */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ministry Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Designation</label>
              <div className="mt-1">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {userProfile.designation}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Administration</label>
              <div className="mt-1">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {userProfile.administration}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Groups</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {userProfile.groups.map((group, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {group}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email</label>
              <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.email}</p>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone Number</label>
              <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.phoneNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Check-in */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Attendance Check-in</h3>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Expires in {timeLeft}s</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-black rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-white" />
                </div>
                <p className="text-xs text-gray-600 font-mono">{qrCode || 'Loading...'}</p>
              </div>
            </div>
            
            <div className="flex space-x-2 justify-center">
              <button 
                onClick={downloadQRCode}
                className="flex items-center space-x-1 text-purple-600 text-sm hover:text-purple-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button className="flex items-center space-x-1 text-purple-600 text-sm hover:text-purple-700 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Recent Attendance</h3>
          
          <div className="space-y-3">
            {attendanceHistory.map((record, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    record.status === 'Present' ? 'bg-green-500' : 
                    record.status === 'Late' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{record.event}</p>
                    <p className="text-xs text-gray-500">{record.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium ${
                    record.status === 'Present' ? 'text-green-600' : 
                    record.status === 'Late' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {record.status}
                  </p>
                  <p className="text-xs text-gray-500">{record.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="px-4 py-4 pb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Achievements</h3>
          
          <div className="space-y-2">
            {userProfile.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Drawer */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Drawer Content */}
        <div className="relative w-80 max-w-sm h-full bg-white shadow-xl border-r border-gray-200">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {features.map((feature, index) => {
              const MenuItem = feature.onClick ? 'button' : Link;
              const menuProps = feature.onClick 
                ? { onClick: () => { feature.onClick?.(); setIsMenuOpen(false); } }
                : { href: feature.href, onClick: () => setIsMenuOpen(false) };
              
              return (
                <MenuItem
                  key={index}
                  {...menuProps}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 w-full text-left ${feature.title === 'Logout' ? 'text-red-600 hover:bg-red-50' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${feature.title === 'Logout' ? 'bg-red-100' : 'bg-purple-100'}`}>
                      <feature.icon className={`w-4 h-4 ${feature.title === 'Logout' ? 'text-red-600' : 'text-purple-600'}`} />
                    </div>
                    <span className="text-sm font-medium">{feature.title}</span>
                  </div>
                  {feature.badge && (
                    <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {feature.badge}
                    </div>
                  )}
                </MenuItem>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
