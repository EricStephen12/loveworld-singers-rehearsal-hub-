'use client'

import { useState } from 'react'
import { ArrowLeft, User, Users, Calendar, QrCode, CheckCircle, Clock, Award, Settings, Edit, Camera, Share2, Download } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [showQRCode, setShowQRCode] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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

  const generateQRCode = () => {
    setShowQRCode(true)
  }

  const downloadQRCode = () => {
    // In real app, this would download the QR code image
    console.log("Downloading QR code...")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
          <span className="text-gray-600">Back</span>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Profile</h1>
        <button onClick={() => setIsEditing(!isEditing)} className="p-2">
          <Edit className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="px-4 py-8 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
              <User className="w-12 h-12 text-white" />
            </div>
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
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
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Attendance Check-in</h3>
          
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              {showQRCode ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-black rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-xs text-gray-600">{userProfile.qrCode}</p>
                </div>
              ) : (
                <QrCode className="w-16 h-16 text-gray-400" />
              )}
            </div>
            
            <button 
              onClick={generateQRCode}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium mb-2"
            >
              {showQRCode ? 'Hide QR Code' : 'Generate QR Code'}
            </button>
            
            {showQRCode && (
              <div className="flex space-x-2 justify-center">
                <button 
                  onClick={downloadQRCode}
                  className="flex items-center space-x-1 text-purple-600 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button className="flex items-center space-x-1 text-purple-600 text-sm">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            )}
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
    </div>
  )
}
