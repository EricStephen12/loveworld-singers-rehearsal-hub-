'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Music, Upload, ArrowLeft, FileText, User, Key, Guitar, Drum, Piano, Mic, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { submitSong } from '@/lib/song-submission-service'
import ScreenHeader from '@/components/ScreenHeader'

interface SongSubmissionForm {
  title: string
  lyrics: string
  writer: string
  key: string
  tempo: string
  leadSinger: string
  conductor: string
  leadKeyboardist: string
  leadGuitarist: string
  drummer: string
  solfas: string
  notes: string
}

export default function SubmitSongPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  // Helper function to get user's display name
  const getUserName = () => {
    if (!profile) return ''
    const parts = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean)
    return parts.join(' ') || user?.email || ''
  }

  const [formData, setFormData] = useState<SongSubmissionForm>({
    title: '',
    lyrics: '',
    writer: getUserName(),
    key: '',
    tempo: '',
    leadSinger: '',
    conductor: '',
    leadKeyboardist: '',
    leadGuitarist: '',
    drummer: '',
    solfas: '',
    notes: ''
  })

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  useEffect(() => {
    const userName = getUserName()
    if (userName && !formData.writer) {
      setFormData(prev => ({ ...prev, writer: userName }))
    }
  }, [profile, user])

  const handleInputChange = (field: keyof SongSubmissionForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please log in to submit a song')
      return
    }

    if (!formData.title.trim() || !formData.lyrics.trim()) {
      alert('Please fill in at least the song title and lyrics')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Submit song for review
      const result = await submitSong({
        title: formData.title.trim(),
        lyrics: formData.lyrics.trim(),
        writer: formData.writer.trim() || getUserName() || 'Unknown',
        category: 'Other', // Default category
        key: formData.key || '',
        tempo: formData.tempo || '',
        leadSinger: formData.leadSinger.trim() || '',
        conductor: formData.conductor.trim() || '',
        leadKeyboardist: formData.leadKeyboardist.trim() || '',
        leadGuitarist: formData.leadGuitarist.trim() || '',
        drummer: formData.drummer.trim() || '',
        solfas: formData.solfas.trim() || '',
        notes: formData.notes.trim() || '',
        submittedBy: {
          userId: user.uid,
          userName: getUserName() || user.email || 'Unknown',
          email: user.email || '',
          submittedAt: new Date().toISOString()
        }
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit song')
      }

      setSubmitStatus('success')
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          title: '',
          lyrics: '',
          writer: getUserName(),
          key: '',
          tempo: '',
          leadSinger: '',
          conductor: '',
          leadKeyboardist: '',
          leadGuitarist: '',
          drummer: '',
          solfas: '',
          notes: ''
        })
        setSubmitStatus('idle')
      }, 3000)

    } catch (error) {
      console.error('Error submitting song:', error)
      setSubmitStatus('error')
      alert('Failed to submit song. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Mobile App Header */}
      <ScreenHeader
        title="Submit Song"
        subtitle={user ? `Submitting as: ${(getUserName() || user.email || '').slice(0, 40)}` : undefined}
        leftButtons={
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all touch-optimized"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        }
        rightButtons={
          <button
            onClick={() => router.push('/pages/support')}
            className="px-3 py-1.5 bg-white/80 rounded-lg text-xs font-outfit-medium text-gray-700 hover:bg-white active:scale-95 ring-1 ring-black/5 shadow-sm"
          >
            Help
          </button>
        }
        onTitleClick={() => {
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
        showMenuButton={false}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin" style={{ WebkitOverflowScrolling: 'touch', overflowY: 'auto' }}>
        <div className="px-4 py-4 space-y-4 pb-8">
          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="bg-green-50 border-0 rounded-2xl shadow-sm p-4 flex items-start gap-3 ring-1 ring-green-200/50 animate-fadeIn">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-outfit-semibold text-green-900 mb-1">Song submitted successfully!</p>
                <p className="text-sm text-green-700">Your song is now under review by the admin team.</p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-50 border-0 rounded-2xl shadow-sm p-4 flex items-start gap-3 ring-1 ring-red-200/50 animate-fadeIn">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-outfit-semibold text-red-900 mb-1">Submission failed</p>
                <p className="text-sm text-red-700">Please check your connection and try again.</p>
              </div>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Song Information Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 ring-1 ring-black/5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm">
                  <Music className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-lg font-outfit-semibold text-gray-800">Song Information</h2>
              </div>

              {/* Song Title */}
              <div>
                <label className="block text-sm font-outfit-medium text-gray-700 mb-2">
                  Song Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter song title"
                  className="w-full px-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 ring-1 ring-black/5 text-gray-800 placeholder-gray-400 text-base"
                  required
                />
              </div>

              {/* Lyrics */}
              <div>
                <label className="block text-sm font-outfit-medium text-gray-700 mb-2">
                  Lyrics <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.lyrics}
                  onChange={(e) => handleInputChange('lyrics', e.target.value)}
                  placeholder="Enter full song lyrics..."
                  rows={10}
                  className="w-full px-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 ring-1 ring-black/5 text-gray-800 placeholder-gray-400 text-base resize-none font-mono text-sm"
                  required
                />
              </div>
            </div>

            {/* Song Details Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 ring-1 ring-black/5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-sm">
                  <Key className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-outfit-semibold text-gray-800">Song Details</h2>
              </div>

              <div className="space-y-4">
                {/* Writer */}
                <div>
                  <label className="block text-sm font-outfit-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Writer/Composer
                  </label>
                  <input
                    type="text"
                    value={formData.writer}
                    onChange={(e) => handleInputChange('writer', e.target.value)}
                    placeholder="Song writer or composer"
                    className="w-full px-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 ring-1 ring-black/5 text-gray-800 placeholder-gray-400 text-base"
                  />
                </div>

                {/* Key and Tempo Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-outfit-medium text-gray-700 mb-2">
                      Key
                    </label>
                    <select
                      value={formData.key}
                      onChange={(e) => handleInputChange('key', e.target.value)}
                      className="w-full px-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 ring-1 ring-black/5 text-gray-800 text-base"
                    >
                      <option value="">Select</option>
                      {keys.map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-outfit-medium text-gray-700 mb-2">
                      Tempo (BPM)
                    </label>
                    <input
                      type="number"
                      value={formData.tempo}
                      onChange={(e) => handleInputChange('tempo', e.target.value)}
                      placeholder="120"
                      min="1"
                      max="300"
                      className="w-full px-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 ring-1 ring-black/5 text-gray-800 placeholder-gray-400 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 ring-1 ring-black/5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-lg font-outfit-semibold text-gray-800">Team Members</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-outfit-medium text-gray-700 mb-2">
                    <Mic className="w-4 h-4 inline mr-1" />
                    Lead Singer
                  </label>
                  <input
                    type="text"
                    value={formData.leadSinger}
                    onChange={(e) => handleInputChange('leadSinger', e.target.value)}
                    placeholder="Lead singer name"
                    className="w-full px-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 ring-1 ring-black/5 text-gray-800 placeholder-gray-400 text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-outfit-medium text-gray-700 mb-2">
                    Conductor
                  </label>
                  <input
                    type="text"
                    value={formData.conductor}
                    onChange={(e) => handleInputChange('conductor', e.target.value)}
                    placeholder="Conductor name"
                    className="w-full px-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 ring-1 ring-black/5 text-gray-800 placeholder-gray-400 text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-outfit-medium text-gray-700 mb-2">
                      <Piano className="w-4 h-4 inline mr-1" />
                      Keyboardist
                    </label>
                    <input
                      type="text"
                      value={formData.leadKeyboardist}
                      onChange={(e) => handleInputChange('leadKeyboardist', e.target.value)}
                      placeholder="Name"
                      className="w-full px-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 ring-1 ring-black/5 text-gray-800 placeholder-gray-400 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-outfit-medium text-gray-700 mb-2">
                      <Guitar className="w-4 h-4 inline mr-1" />
                      Guitarist
                    </label>
                    <input
                      type="text"
                      value={formData.leadGuitarist}
                      onChange={(e) => handleInputChange('leadGuitarist', e.target.value)}
                      placeholder="Name"
                      className="w-full px-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 ring-1 ring-black/5 text-gray-800 placeholder-gray-400 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-outfit-medium text-gray-700 mb-2">
                    <Drum className="w-4 h-4 inline mr-1" />
                    Drummer
                  </label>
                  <input
                    type="text"
                    value={formData.drummer}
                    onChange={(e) => handleInputChange('drummer', e.target.value)}
                    placeholder="Drummer name"
                    className="w-full px-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 ring-1 ring-black/5 text-gray-800 placeholder-gray-400 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 ring-1 ring-black/5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center shadow-sm">
                  <FileText className="w-4 h-4 text-orange-600" />
                </div>
                <h2 className="text-lg font-outfit-semibold text-gray-800">Additional Information</h2>
              </div>

              <div className="space-y-4">
                {/* Solfas */}
                <div>
                  <label className="block text-sm font-outfit-medium text-gray-700 mb-2">
                    Solfas (Solfège Notation)
                  </label>
                  <textarea
                    value={formData.solfas}
                    onChange={(e) => handleInputChange('solfas', e.target.value)}
                    placeholder="Enter solfas notation if available..."
                    rows={5}
                    className="w-full px-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 ring-1 ring-black/5 text-gray-800 placeholder-gray-400 text-base resize-none font-mono text-sm"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-outfit-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information or instructions..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 ring-1 ring-black/5 text-gray-800 placeholder-gray-400 text-base resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 pb-6">
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim() || !formData.lyrics.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-colors font-outfit-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg active:scale-95 touch-optimized text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Submit Song</span>
                  </>
                )}
              </button>

              {/* User Info */}
              {user && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Submitting as: <span className="font-outfit-medium text-gray-700">{getUserName() || user.email}</span>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
