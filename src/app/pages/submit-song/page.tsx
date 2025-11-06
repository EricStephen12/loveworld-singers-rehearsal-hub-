'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Music, Upload, Save, X, FileText, User, Key, Guitar, Drum, Piano, Mic } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

interface SongSubmissionForm {
  title: string
  lyrics: string
  writer: string
  category: string
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
  
  const [formData, setFormData] = useState<SongSubmissionForm>({
    title: '',
    lyrics: '',
    writer: profile?.name || '',
    category: '',
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

  const categories = [
    'Worship',
    'Praise',
    'Hymn',
    'Contemporary',
    'Traditional',
    'Gospel',
    'Inspirational',
    'Other'
  ]

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  useEffect(() => {
    if (profile?.name && !formData.writer) {
      setFormData(prev => ({ ...prev, writer: profile.name }))
    }
  }, [profile])

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
      // Create song document in Firebase
      const songData = {
        title: formData.title.trim(),
        lyrics: formData.lyrics.trim(),
        writer: formData.writer.trim() || profile?.name || 'Unknown',
        category: formData.category || 'Other',
        key: formData.key || '',
        tempo: formData.tempo || '',
        leadSinger: formData.leadSinger.trim() || '',
        conductor: formData.conductor.trim() || '',
        leadKeyboardist: formData.leadKeyboardist.trim() || '',
        leadGuitarist: formData.leadGuitarist.trim() || '',
        drummer: formData.drummer.trim() || '',
        solfas: formData.solfas.trim() || '',
        notes: formData.notes.trim() || '',
        status: 'unheard',
        submittedBy: {
          userId: user.uid,
          userName: profile?.name || user.email || 'Unknown',
          email: user.email || '',
          submittedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rehearsalCount: 0
      }

      await addDoc(collection(db, 'songs'), songData)

      setSubmitStatus('success')
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          title: '',
          lyrics: '',
          writer: profile?.name || '',
          category: '',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Submit a Song</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Share your music with the LoveWorld Singers community
                </p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Submission Status */}
        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div>
              <p className="font-medium text-green-900">Song submitted successfully!</p>
              <p className="text-sm text-green-700">Your song is now under review.</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✗</span>
            </div>
            <p className="font-medium text-red-900">Failed to submit song. Please try again.</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          {/* Song Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Song Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter song title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Lyrics */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lyrics <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.lyrics}
              onChange={(e) => handleInputChange('lyrics', e.target.value)}
              placeholder="Enter full song lyrics..."
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
              required
            />
          </div>

          {/* Song Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Writer */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Writer/Composer
              </label>
              <input
                type="text"
                value={formData.writer}
                onChange={(e) => handleInputChange('writer', e.target.value)}
                placeholder="Song writer or composer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Key */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key className="w-4 h-4 inline mr-1" />
                Key
              </label>
              <select
                value={formData.key}
                onChange={(e) => handleInputChange('key', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select key</option>
                {keys.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>

            {/* Tempo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tempo (BPM)
              </label>
              <input
                type="number"
                value={formData.tempo}
                onChange={(e) => handleInputChange('tempo', e.target.value)}
                placeholder="e.g., 120"
                min="1"
                max="300"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Team Members */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mic className="w-4 h-4 inline mr-1" />
                  Lead Singer
                </label>
                <input
                  type="text"
                  value={formData.leadSinger}
                  onChange={(e) => handleInputChange('leadSinger', e.target.value)}
                  placeholder="Lead singer name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Conductor
                </label>
                <input
                  type="text"
                  value={formData.conductor}
                  onChange={(e) => handleInputChange('conductor', e.target.value)}
                  placeholder="Conductor name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Piano className="w-4 h-4 inline mr-1" />
                  Lead Keyboardist
                </label>
                <input
                  type="text"
                  value={formData.leadKeyboardist}
                  onChange={(e) => handleInputChange('leadKeyboardist', e.target.value)}
                  placeholder="Keyboardist name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Guitar className="w-4 h-4 inline mr-1" />
                  Lead Guitarist
                </label>
                <input
                  type="text"
                  value={formData.leadGuitarist}
                  onChange={(e) => handleInputChange('leadGuitarist', e.target.value)}
                  placeholder="Guitarist name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Drum className="w-4 h-4 inline mr-1" />
                  Drummer
                </label>
                <input
                  type="text"
                  value={formData.drummer}
                  onChange={(e) => handleInputChange('drummer', e.target.value)}
                  placeholder="Drummer name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Solfas */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Solfas (Solfège Notation)
            </label>
            <textarea
              value={formData.solfas}
              onChange={(e) => handleInputChange('solfas', e.target.value)}
              placeholder="Enter solfas notation if available..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
            />
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information, instructions, or notes about the song..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.lyrics.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Submit Song
                </>
              )}
            </button>
          </div>

          {/* User Info Display */}
          {user && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Submitting as: <span className="font-medium text-gray-900">{profile?.name || user.email}</span>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}



