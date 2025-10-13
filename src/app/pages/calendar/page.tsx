'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Users, Music, MapPin, Menu, X, Bell, Home, Play, BarChart3, HelpCircle, User, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  type: 'rehearsal' | 'praise-night' | 'meeting' | 'event'
  description?: string
  location?: string
  attendees?: string[]
  status: 'upcoming' | 'ongoing' | 'completed'
  isSelected?: boolean
}

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { user, profile } = useAuth()
  const router = useRouter()

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }

  // Load events from Firebase
  const loadEvents = async () => {
    try {
      setIsLoading(true)
      // Mock events for the selected date (Feb 28, 2024)
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Sunday Rehearsal',
          date: new Date(2024, 1, 28, 10, 15),
          time: '10:15am',
          type: 'rehearsal',
          description: 'Weekly rehearsal for Sunday service songs and new arrangements',
          location: 'Main Hall',
          attendees: ['Rita Soul', 'Simeon', 'A4', 'Tolu'],
          status: 'upcoming',
          isSelected: true
        },
        {
          id: '2',
          title: 'Out for Lunch',
          date: new Date(2024, 1, 28, 12, 0),
          time: '12:00pm',
          type: 'event',
          description: 'Please don\'t schedule any meetings during this time.',
          status: 'upcoming'
        },
        {
          id: '3',
          title: 'Design Review',
          date: new Date(2024, 1, 28, 13, 45),
          time: '1:45pm',
          type: 'meeting',
          description: 'Sit down with Jess to review designs from the UX project and finalize the new app interface',
          status: 'upcoming'
        },
        {
          id: '4',
          title: 'Q3 Sprint Planning',
          date: new Date(2024, 1, 28, 15, 30),
          time: '3:30pm',
          type: 'meeting',
          description: 'Long term time and resource planning for Q3 and Q4 ministry activities',
          status: 'upcoming'
        },
        {
          id: '5',
          title: 'Team Happy Hour',
          date: new Date(2024, 1, 28, 17, 0),
          time: '5:00pm',
          type: 'event',
          description: 'Monthly team bonding and celebration',
          status: 'upcoming'
        }
      ]
      setEvents(mockEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Generate date pills for the horizontal scroll
  const generateDatePills = () => {
    const dates = []
    const today = new Date(2024, 1, 28) // Feb 28, 2024 (matching the image)
    
    for (let i = -2; i <= 2; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const datePills = generateDatePills()
  const selectedDateEvents = getEventsForDate(selectedDate)

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar - Toggleable */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-purple-600 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-purple-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Welcome Back</h3>
                <p className="text-purple-100 text-sm">{profile?.first_name || 'User'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-white hover:text-purple-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              <li>
                <Link href="/home" className="flex items-center space-x-3 text-white hover:bg-purple-700 px-4 py-3 rounded-lg transition-colors">
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/pages/calendar" className="flex items-center space-x-3 text-white bg-purple-700 px-4 py-3 rounded-lg">
                  <Calendar className="w-5 h-5" />
                  <span>Calendar</span>
                </Link>
              </li>
              <li>
                <Link href="/pages/rehearsals" className="flex items-center space-x-3 text-white hover:bg-purple-700 px-4 py-3 rounded-lg transition-colors">
                  <Music className="w-5 h-5" />
                  <span>Rehearsals</span>
                </Link>
              </li>
              <li>
                <Link href="/pages/praise-night" className="flex items-center space-x-3 text-white hover:bg-purple-700 px-4 py-3 rounded-lg transition-colors">
                  <Play className="w-5 h-5" />
                  <span>Praise Night</span>
                </Link>
              </li>
              <li>
                <Link href="/pages/profile" className="flex items-center space-x-3 text-white hover:bg-purple-700 px-4 py-3 rounded-lg transition-colors">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="flex items-center space-x-3 text-white hover:bg-purple-700 px-4 py-3 rounded-lg transition-colors">
                  <BarChart3 className="w-5 h-5" />
                  <span>Admin</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {/* Header - Exact match to image */}
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
          <div className="w-10 h-10"></div> {/* Empty space to center title */}
        </div>

      {/* Month Navigation - Exact match to image */}
      <div className="px-6 mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">February</h2>
          <h3 className="text-xl text-gray-400">March</h3>
        </div>
      </div>

      {/* Date Pills - Horizontal scrollable dates */}
      <div className="px-6 mb-6">
        <div className="flex space-x-3 overflow-x-auto">
          {datePills.map((date, index) => {
            const isSelected = date.getDate() === 28 // Feb 28 is selected
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-3 rounded-full text-center ${
                  isSelected 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                <div className="text-lg font-semibold">{date.getDate()}</div>
                <div className="text-sm">{dayNames[date.getDay()]}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Header */}
      <div className="px-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          Wednesday - Feb 28, 2024
        </h3>
      </div>

        {/* Timeline Events */}
        <div className="px-6 pb-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-200"></div>
            
            {/* Events */}
            <div className="space-y-6">
              {selectedDateEvents.map((event, index) => (
                <div key={event.id} className="relative flex items-start">
                  {/* Timeline Dot */}
                  <div className="absolute left-3 w-2 h-2 bg-purple-400 rounded-full -mt-1"></div>
                  
                  {/* Event Content */}
                  <div className="ml-8 flex-1">
                    {event.isSelected ? (
                      // Selected Event - Dark purple card (like "Hi-fi Wireframes")
                      <div className="bg-purple-600 text-white p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg">{event.title}</h4>
                          <span className="text-sm">{event.time}</span>
                        </div>
                        <p className="text-sm text-purple-100 mb-3">{event.description}</p>
                        {event.attendees && (
                          <div className="flex space-x-1">
                            {event.attendees.slice(0, 3).map((attendee, i) => (
                              <div key={i} className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-semibold">
                                {attendee.charAt(0)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Regular Event - White card with border (like "Out for Lunch", "Design Review", etc.)
                      <div className="bg-white border border-gray-200 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-800">{event.title}</h4>
                          <span className="text-sm text-gray-600">{event.time}</span>
                        </div>
                        <p className="text-sm text-gray-600">{event.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default CalendarPage
