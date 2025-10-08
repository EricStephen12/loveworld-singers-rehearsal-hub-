"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  MapPin,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Save,
  User,
  Cake,
  Menu
} from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import SharedDrawer from '@/components/SharedDrawer';
import { getMenuItems } from '@/config/menuItems';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseDatabaseService } from '@/lib/firebase-database';

// Calendar Event Types
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  location?: string;
  type: 'event' | 'birthday' | 'meeting' | 'rehearsal' | 'service';
  color: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface BirthdayEvent {
  id: string;
  title: string;
  date: string;
  type: 'birthday';
  color: string;
  userId: string;
  userName: string;
  age?: number;
}

// Calendar View Types
type CalendarView = 'month' | 'week' | 'day';

export default function MinistryCalendarPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [birthdays, setBirthdays] = useState<BirthdayEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    type: 'event' as CalendarEvent['type'],
    color: '#8B5CF6'
  });

  // Menu items
  const menuItems = getMenuItems(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  });

  // Color options for events
  const eventColors = [
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' }
  ];

  // Load events and birthdays
  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    setIsLoading(true);
    try {
      // Load calendar events
      const eventsData = await FirebaseDatabaseService.getCollection('calendar_events');
      const formattedEvents = (eventsData || []).map((event: any) => ({
        id: event.id || event.firebaseId,
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        location: event.location || '',
        type: event.type || 'event',
        color: event.color || '#8B5CF6',
        createdBy: event.createdBy || '',
        createdAt: event.createdAt || new Date().toISOString(),
        updatedAt: event.updatedAt || new Date().toISOString()
      }));
      setEvents(formattedEvents);

      // Load user profiles for birthdays
      const profilesData = await FirebaseDatabaseService.getCollection('profiles');
      const birthdayEvents: BirthdayEvent[] = [];
      
      if (profilesData) {
        profilesData.forEach((profile: any) => {
          if (profile.birthday) {
            const birthdayDate = new Date(profile.birthday);
            const currentYear = new Date().getFullYear();
            const thisYearBirthday = new Date(currentYear, birthdayDate.getMonth(), birthdayDate.getDate());
            
            // Calculate age
            const age = currentYear - birthdayDate.getFullYear();
            
            birthdayEvents.push({
              id: `birthday-${profile.id}`,
              title: `${profile.first_name || 'User'}'s Birthday`,
              date: thisYearBirthday.toISOString().split('T')[0],
              type: 'birthday',
              color: '#EC4899',
              userId: profile.id,
              userName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
              age
            });
          }
        });
      }
      
      setBirthdays(birthdayEvents);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get all events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = events.filter(event => event.date === dateStr);
    const dayBirthdays = birthdays.filter(birthday => birthday.date === dateStr);
    return [...dayEvents, ...dayBirthdays];
  };

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventModal(true);
  };

  // Handle event form submission
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventData: CalendarEvent = {
        id: editingEvent?.id || `event-${Date.now()}`,
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
        location: eventForm.location,
        type: eventForm.type,
        color: eventForm.color,
        createdBy: 'current-user', // You can get this from auth context
        createdAt: editingEvent?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingEvent) {
        // Update existing event
        await FirebaseDatabaseService.updateDocument('calendar_events', eventData.id, eventData);
        setEvents(prev => prev.map(e => e.id === eventData.id ? eventData : e));
      } else {
        // Create new event
        await FirebaseDatabaseService.createDocument('calendar_events', eventData.id, eventData);
        setEvents(prev => [...prev, eventData]);
      }

      // Reset form
      setEventForm({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        type: 'event',
        color: '#8B5CF6'
      });
      setShowEventForm(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  // Handle event edit
  const handleEditEvent = (event: CalendarEvent) => {
    setEventForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || '',
      type: event.type,
      color: event.color
    });
    setEditingEvent(event);
    setShowEventForm(true);
    setShowEventModal(false);
  };

  // Handle event delete
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await FirebaseDatabaseService.deleteDocument('calendar_events', eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get event type icon
  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'birthday': return <Cake className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'rehearsal': return <CalendarIcon className="w-4 h-4" />;
      case 'service': return <CalendarIcon className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex">
      {/* Left Sidebar - Google Calendar Style */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Ministry Calendar</h2>
              <p className="text-sm text-gray-500">General events & birthdays</p>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Calendar Navigation */}
        <div className="px-4 pb-4">
          <div className="space-y-2">
            <button
              onClick={() => setView('month')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                view === 'month' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                view === 'week' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                view === 'day' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Today Button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="w-full text-left px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Today
          </button>
        </div>

        {/* Calendar Legend */}
        <div className="px-4 pb-4 flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Event Types</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">General Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span className="text-sm text-gray-600">Birthdays</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Ministry Events</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            All events are visible to everyone in the ministry
          </p>
        </div>
      </div>

      {/* Main Calendar Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Ministry Calendar</h1>
            </div>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            {/* Month Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (view === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1);
                  } else if (view === 'week') {
                    newDate.setDate(newDate.getDate() - 7);
                  } else {
                    newDate.setDate(newDate.getDate() - 1);
                  }
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h1 className="text-xl font-semibold text-gray-900">
                {view === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {view === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                {view === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h1>
              
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (view === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1);
                  } else if (view === 'week') {
                    newDate.setDate(newDate.getDate() + 7);
                  } else {
                    newDate.setDate(newDate.getDate() + 1);
                  }
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* View Toggle - Hidden on mobile since it's in sidebar */}
            <div className="hidden md:flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  view === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  view === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-hidden">
          {/* Calendar Content Area */}

          {/* Calendar Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            {view === 'month' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
                {/* Day Headers - Horizontal Scrollable with Navigation */}
                <div className="flex items-center border-b border-gray-200/50">
                  {/* Previous Day Arrow */}
                  <button
                    onClick={() => {
                      const prevDay = new Date(currentDate);
                      prevDay.setDate(prevDay.getDate() - 1);
                      setCurrentDate(prevDay);
                      // If we're in month view, switch to day view to show the specific day
                      if (view === 'month') {
                        setView('day');
                      }
                    }}
                    className="flex-shrink-0 p-2 hover:bg-gray-100/70 rounded-full transition-all duration-200 active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {/* Scrollable Day Headers */}
                  <div className="flex-1 flex overflow-x-auto scrollbar-hide">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="flex-shrink-0 w-full min-w-[80px] p-3 text-center text-sm font-medium text-gray-500 bg-gray-50/50">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Next Day Arrow */}
                  <button
                    onClick={() => {
                      const nextDay = new Date(currentDate);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setCurrentDate(nextDay);
                      // If we're in month view, switch to day view to show the specific day
                      if (view === 'month') {
                        setView('day');
                      }
                    }}
                    className="flex-shrink-0 p-2 hover:bg-gray-100/70 rounded-full transition-all duration-200 active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Calendar Days - Proper 7-column grid */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dayEvents = getEventsForDate(day);
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[80px] border-r border-b border-gray-200/30 p-2 cursor-pointer hover:bg-gray-50/50 transition-all duration-200 active:scale-95 ${
                          !isCurrentMonth ? 'bg-gray-50/30 text-gray-400' : 'bg-white/50'
                        }`}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                        }`}>
                          {day.getDate()}
                        </div>
                        
                        {/* Events */}
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="text-xs p-1 rounded-lg truncate shadow-sm"
                              style={{ 
                                backgroundColor: event.type === 'birthday' ? '#EC4899' : event.color,
                                color: 'white',
                                fontSize: '10px'
                              }}
                            >
                              <div className="flex items-center gap-1">
                                {getEventTypeIcon(event.type)}
                                <span className="truncate">
                                  {event.type === 'birthday' ? '🎂 ' : ''}{event.title}
                                </span>
                              </div>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Day View */}
            {view === 'day' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
                {/* Day Header */}
                <div className="p-4 border-b border-gray-200/50 bg-gray-50/50">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                </div>

                {/* Day Events */}
                <div className="p-4">
                  {(() => {
                    const dayEvents = getEventsForDate(currentDate);
                    return dayEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">No events scheduled for this day</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className="p-4 rounded-lg border border-gray-200/50"
                            style={{ 
                              backgroundColor: event.type === 'birthday' ? '#EC4899' : event.color,
                              color: 'white'
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {getEventTypeIcon(event.type)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-white">{event.title}</h4>
                                {event.type !== 'birthday' && (event as CalendarEvent).startTime && (
                                  <p className="text-sm text-white/80 mt-1">
                                    {(event as CalendarEvent).startTime}
                                    {(event as CalendarEvent).endTime && ` - ${(event as CalendarEvent).endTime}`}
                                  </p>
                                )}
                                {event.type !== 'birthday' && (event as CalendarEvent).location && (
                                  <p className="text-sm text-white/80 mt-1">📍 {(event as CalendarEvent).location}</p>
                                )}
                                {event.type !== 'birthday' && (event as CalendarEvent).description && (
                                  <p className="text-sm text-white/80 mt-2">{(event as CalendarEvent).description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Week View */}
            {view === 'week' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
                <div className="p-4 text-center">
                  <p className="text-gray-500">Week view coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatDate(selectedDate)}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border border-gray-200"
                    style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getEventTypeIcon(event.type)}
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                        </div>
                        {event.type !== 'birthday' && (
                          <>
                            {event.startTime && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.startTime} {event.endTime && `- ${event.endTime}`}
                              </p>
                            )}
                            {event.location && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </p>
                            )}
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            )}
                          </>
                        )}
                        {event.type === 'birthday' && (event as BirthdayEvent).age && (
                          <p className="text-sm text-gray-600">
                            Turning {(event as BirthdayEvent).age! + 1} years old
                          </p>
                        )}
                      </div>
                      
                      {event.type !== 'birthday' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditEvent(event as CalendarEvent)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {getEventsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No events scheduled</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setEventForm(prev => ({ ...prev, date: selectedDate.toISOString().split('T')[0] }));
                    setShowEventForm(true);
                    setShowEventModal(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Add Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                  >
                    <option value="event">General Event</option>
                    <option value="meeting">Meeting</option>
                    <option value="rehearsal">Rehearsal</option>
                    <option value="service">Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {eventColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setEventForm(prev => ({ ...prev, color: color.value }))}
                        className={`w-full h-10 rounded-lg border-2 transition-all ${
                          eventForm.color === color.value ? 'border-gray-400 scale-105' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                    rows={3}
                    placeholder="Optional"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventForm(false);
                      setEditingEvent(null);
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingEvent ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Menu Drawer */}
      <SharedDrawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title="Menu"
        items={menuItems}
      />
    </div>
  );
}
