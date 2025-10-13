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

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }

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
      // Mock events for now - you can replace with real Firebase data
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Sunday Rehearsal',
          date: new Date(2024, 11, 15, 10, 0),
          time: '10:00 AM',
          type: 'rehearsal',
          description: 'Weekly rehearsal for Sunday service songs',
          location: 'Main Hall',
          attendees: ['Rita Soul', 'Simeon', 'A4', 'Tolu'],
          status: 'upcoming'
        },
        {
          id: '2',
          title: 'Praise Night - December Special',
          date: new Date(2024, 11, 20, 18, 0),
          time: '6:00 PM',
          type: 'praise-night',
          description: 'Special December praise night with Christmas songs',
          location: 'Auditorium',
          attendees: ['Rita Soul', 'Simeon', 'A4', 'Tolu', 'Ivan'],
          status: 'upcoming'
        },
        {
          id: '3',
          title: 'Team Meeting',
          date: new Date(2024, 11, 18, 14, 0),
          time: '2:00 PM',
          type: 'meeting',
          description: 'Monthly team meeting to discuss upcoming events',
          location: 'Conference Room',
          attendees: ['Rita Soul', 'Simeon'],
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

  const calendarDays = generateCalendarDays()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'rehearsal': return 'bg-blue-500'
      case 'praise-night': return 'bg-purple-500'
      case 'meeting': return 'bg-green-500'
      case 'event': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'rehearsal': return <Music className="w-3 h-3" />
      case 'praise-night': return <Play className="w-3 h-3" />
      case 'meeting': return <Users className="w-3 h-3" />
      case 'event': return <Calendar className="w-3 h-3" />
      default: return <Calendar className="w-3 h-3" />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-green-600 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-green-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Welcome Back</h3>
                <p className="text-green-100 text-sm">{profile?.first_name || 'User'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-white hover:text-green-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              <li>
                <Link href="/home" className="flex items-center space-x-3 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition-colors">
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/pages/calendar" className="flex items-center space-x-3 text-white bg-green-700 px-4 py-3 rounded-lg">
                  <Calendar className="w-5 h-5" />
                  <span>Calendar</span>
                </Link>
              </li>
              <li>
                <Link href="/pages/rehearsals" className="flex items-center space-x-3 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition-colors">
                  <Music className="w-5 h-5" />
                  <span>Rehearsals</span>
                </Link>
              </li>
              <li>
                <Link href="/pages/praise-night" className="flex items-center space-x-3 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition-colors">
                  <Play className="w-5 h-5" />
                  <span>Praise Night</span>
                </Link>
              </li>
              <li>
                <Link href="/pages/profile" className="flex items-center space-x-3 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition-colors">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="flex items-center space-x-3 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition-colors">
                  <BarChart3 className="w-5 h-5" />
                  <span>Admin</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-white hover:text-green-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold">Calendar</h1>
          </div>
          <button className="bg-green-500 hover:bg-green-400 p-2 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50">
              {dayNames.map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const isToday = day.toDateString() === new Date().toDateString()
                const isSelected = day.toDateString() === selectedDate.toDateString()
                const dayEvents = getEventsForDate(day)

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-r border-b border-gray-200 last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    } ${isToday ? 'bg-green-50' : ''} ${isSelected ? 'bg-green-100' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-green-600' : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded text-white ${getEventTypeColor(event.type)} flex items-center space-x-1`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEvent(event)
                          }}
                        >
                          {getEventTypeIcon(event.type)}
                          <span className="truncate">{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map(event => (
                  <div
                    key={event.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`p-1 rounded text-white ${getEventTypeColor(event.type)}`}>
                            {getEventTypeIcon(event.type)}
                          </div>
                          <h4 className="font-semibold text-gray-800">{event.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                            event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {getEventsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No events scheduled for this day</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded text-white ${getEventTypeColor(selectedEvent.type)}`}>
                    {getEventTypeIcon(selectedEvent.type)}
                  </div>
                  <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{selectedEvent.time}</span>
                </div>
                
                {selectedEvent.location && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.description && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Attendees</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.attendees.map((attendee, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {attendee}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
