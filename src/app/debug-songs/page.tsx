'use client'

import React, { useState, useEffect } from 'react'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

interface SongData {
  id: string
  firebaseId?: string
  title: string
  category: string
  status: string
  praisenightid?: string | number
  praiseNightId?: string | number
  leadSinger?: string
  writer?: string
  audioFile?: string
  audiofile?: string
  audio_url?: string
  media_url?: string
  mediaId?: string | number
  [key: string]: any
}

interface SongsByCategory {
  [category: string]: SongData[]
}

interface SongsByPage {
  [pageId: string]: SongData[]
}

interface PageInfo {
  id: string | number
  name: string
  description?: string
}

export default function DebugSongsPage() {
  const [allSongs, setAllSongs] = useState<SongData[]>([])
  const [songsByCategory, setSongsByCategory] = useState<SongsByCategory>({})
  const [songsByPage, setSongsByPage] = useState<SongsByPage>({})
  const [pageInfo, setPageInfo] = useState<PageInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<'all' | 'category' | 'page'>('all')
  const [audioAnalysis, setAudioAnalysis] = useState<any>(null)
  const [sampleSongs, setSampleSongs] = useState<SongData[]>([])
  const [countdownAnalysis, setCountdownAnalysis] = useState<any>(null)

  useEffect(() => {
    loadSongsData()
  }, [])

  const loadSongsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching all songs and pages from Firebase...')
      
      // Fetch songs and pages in parallel
      const [songs, pages] = await Promise.all([
        FirebaseDatabaseService.getCollection('songs'),
        FirebaseDatabaseService.getCollection('praise_nights')
      ])
      
      console.log(`📊 Total songs found: ${songs.length}`)
      console.log(`📄 Total pages found: ${pages.length}`)
      
      // Analyze audio files
      console.log('🎵 Analyzing audio files in songs...')
      const audioAnalysis = {
        totalSongs: songs.length,
        songsWithAudioFile: 0,
        songsWithAudiofile: 0,
        songsWithAudioUrl: 0,
        songsWithMediaUrl: 0,
        songsWithMediaId: 0,
        songsWithAnyAudio: 0,
        audioFields: new Set<string>()
      }
      
      songs.forEach(song => {
        // Check all possible audio fields
        const audioFields = Object.keys(song).filter(key => 
          key.toLowerCase().includes('audio') || 
          key.toLowerCase().includes('media') || 
          key.toLowerCase().includes('url') ||
          key.toLowerCase().includes('file')
        )
        
        audioFields.forEach(field => audioAnalysis.audioFields.add(field))
        
        if ((song as any).audioFile) audioAnalysis.songsWithAudioFile++
        if ((song as any).audiofile) audioAnalysis.songsWithAudiofile++
        if ((song as any).audio_url) audioAnalysis.songsWithAudioUrl++
        if ((song as any).media_url) audioAnalysis.songsWithMediaUrl++
        if ((song as any).mediaId) audioAnalysis.songsWithMediaId++
        
        if ((song as any).audioFile || (song as any).audiofile || (song as any).audio_url || (song as any).media_url) {
          audioAnalysis.songsWithAnyAudio++
        }
      })
      
      console.log('🎵 Audio analysis results:', audioAnalysis)
      console.log('🎵 Available audio fields:', Array.from(audioAnalysis.audioFields))
      
      // Store analysis results for UI display
      setAudioAnalysis({
        ...audioAnalysis,
        audioFields: Array.from(audioAnalysis.audioFields)
      })
      
      // Debug: Show first few songs with all their fields
      console.log('🔍 First 3 songs with ALL fields:')
      const sampleSongsData = songs.slice(0, 3).map((song, index) => {
        const songData = {
          ...song,
          allFields: Object.keys(song),
          audioRelatedFields: Object.keys(song).filter(key => 
            key.toLowerCase().includes('audio') || 
            key.toLowerCase().includes('media') || 
            key.toLowerCase().includes('url') ||
            key.toLowerCase().includes('file')
          )
        }
        console.log(`Song ${index + 1}: "${(song as any).title}"`, songData)
        return songData
      })
      
      setSampleSongs(sampleSongsData as any)
      setAllSongs(songs as any)
      setPageInfo(pages as any)
      
      // Analyze countdown data
      console.log('🕐 Analyzing countdown data in pages...')
      const countdownAnalysis = {
        totalPages: pages.length,
        pagesWithCountdown: 0,
        pagesWithCountdownDays: 0,
        pagesWithCountdownHours: 0,
        pagesWithCountdownMinutes: 0,
        pagesWithCountdownSeconds: 0,
        pagesWithCountdownObject: 0,
        countdownFields: new Set<string>(),
        samplePages: [] as any[]
      }
      
      pages.forEach((page, index) => {
        const pageData = page as any
        
        // Check all possible countdown fields
        const countdownFields = Object.keys(pageData).filter(key => 
          key.toLowerCase().includes('countdown') || 
          key.toLowerCase().includes('timer') ||
          key.toLowerCase().includes('time')
        )
        
        countdownFields.forEach(field => countdownAnalysis.countdownFields.add(field))
        
        // Check specific countdown fields
        if (pageData.countdownDays || pageData.countdowndays) countdownAnalysis.pagesWithCountdownDays++
        if (pageData.countdownHours || pageData.countdownhours) countdownAnalysis.pagesWithCountdownHours++
        if (pageData.countdownMinutes || pageData.countdownminutes) countdownAnalysis.pagesWithCountdownMinutes++
        if (pageData.countdownSeconds || pageData.countdownseconds) countdownAnalysis.pagesWithCountdownSeconds++
        if (pageData.countdown) countdownAnalysis.pagesWithCountdownObject++
        
        // Check if page has any countdown data
        if (pageData.countdownDays || pageData.countdownHours || pageData.countdownMinutes || pageData.countdownSeconds ||
            pageData.countdowndays || pageData.countdownhours || pageData.countdownminutes || pageData.countdownseconds ||
            pageData.countdown) {
          countdownAnalysis.pagesWithCountdown++
        }
        
        // Store sample pages (first 3)
        if (index < 3) {
          countdownAnalysis.samplePages.push({
            id: pageData.id || pageData.page_id,
            name: pageData.name || pageData.title,
            countdownFields: countdownFields,
            countdownData: {
              countdownDays: pageData.countdownDays,
              countdownHours: pageData.countdownHours,
              countdownMinutes: pageData.countdownMinutes,
              countdownSeconds: pageData.countdownSeconds,
              countdowndays: pageData.countdowndays,
              countdownhours: pageData.countdownhours,
              countdownminutes: pageData.countdownminutes,
              countdownseconds: pageData.countdownseconds,
              countdown: pageData.countdown
            }
          })
        }
      })
      
      setCountdownAnalysis(countdownAnalysis)
      
      // Group songs by category
      const categoryGroups: SongsByCategory = {}
      const pageGroups: SongsByPage = {}
      
      songs.forEach(song => {
        const category = (song as any).category || 'No Category'
        const pageId = (song as any).praisenightid || (song as any).praiseNightId || 'No Page ID'
        
        // Group by category
        if (!categoryGroups[category]) {
          categoryGroups[category] = []
        }
        categoryGroups[category].push(song as any)
        
        // Group by page
        if (!pageGroups[pageId]) {
          pageGroups[pageId] = []
        }
        pageGroups[pageId].push(song as any)
      })
      
      setSongsByCategory(categoryGroups)
      setSongsByPage(pageGroups)
      
    } catch (err) {
      console.error('❌ Error loading songs:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getIssues = () => {
    const issues = []
    
    const songsWithoutCategory = allSongs.filter(song => !song.category || song.category === '')
    if (songsWithoutCategory.length > 0) {
      issues.push(`${songsWithoutCategory.length} songs without category`)
    }
    
    const songsWithoutPageId = allSongs.filter(song => !song.praisenightid && !song.praiseNightId)
    if (songsWithoutPageId.length > 0) {
      issues.push(`${songsWithoutPageId.length} songs without page ID`)
    }
    
    const duplicateTitles: { [key: string]: number } = {}
    allSongs.forEach(song => {
      duplicateTitles[song.title] = (duplicateTitles[song.title] || 0) + 1
    })
    
    const actualDuplicates = Object.keys(duplicateTitles).filter(title => duplicateTitles[title] > 1)
    if (actualDuplicates.length > 0) {
      issues.push(`${actualDuplicates.length} duplicate song titles`)
    }
    
    return issues
  }

  const getPageName = (pageId: string | number) => {
    if (pageId === 'No Page ID') return 'No Page ID'
    const page = pageInfo.find(p => p.id == pageId)
    return page ? `${page.name} (ID: ${pageId})` : `Unknown Page (ID: ${pageId})`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading songs data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">❌</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Songs</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadSongsData}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const issues = getIssues()

  return (
    <div className="bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Songs Debug Page</h1>
            <button
              onClick={loadSongsData}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Refresh Data
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Total Songs</h3>
              <p className="text-2xl font-bold text-blue-600">{allSongs.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Categories</h3>
              <p className="text-2xl font-bold text-green-600">{Object.keys(songsByCategory).length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Pages</h3>
              <p className="text-2xl font-bold text-purple-600">{Object.keys(songsByPage).length}</p>
            </div>
          </div>
          
          {issues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Issues Found:</h3>
              <ul className="list-disc list-inside text-red-700">
                {issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Audio Analysis Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-4">🎵 Audio File Analysis</h3>
            
            {audioAnalysis && (
              <div className="mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Audio Field Summary:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-2 rounded">
                    <div className="font-medium">Total Songs</div>
                    <div className="text-lg font-bold text-blue-600">{audioAnalysis.totalSongs}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="font-medium">Songs with Audio</div>
                    <div className="text-lg font-bold text-green-600">{audioAnalysis.songsWithAnyAudio}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="font-medium">audioFile Field</div>
                    <div className="text-lg font-bold text-purple-600">{audioAnalysis.songsWithAudioFile}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="font-medium">audiofile Field</div>
                    <div className="text-lg font-bold text-orange-600">{audioAnalysis.songsWithAudiofile}</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="font-medium text-blue-800 mb-1">Available Audio Fields:</div>
                  <div className="text-sm text-blue-700">
                    {audioAnalysis.audioFields.length > 0 ? (
                      <span className="bg-white px-2 py-1 rounded border">
                        {audioAnalysis.audioFields.join(', ')}
                      </span>
                    ) : (
                      <span className="text-red-600">❌ No audio-related fields found</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {sampleSongs.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Sample Songs (First 3):</h4>
                <div className="space-y-3">
                  {sampleSongs.map((song, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="font-medium text-gray-900 mb-2">
                        {index + 1}. {song.title}
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium">All Fields:</span>
                          <span className="ml-2 text-gray-600">
                            {song.allFields?.slice(0, 10).join(', ')}
                            {song.allFields?.length > 10 && '...'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Audio Fields:</span>
                          <span className="ml-2 text-gray-600">
                            {song.audioRelatedFields?.length > 0 ? 
                              song.audioRelatedFields.join(', ') : 
                              'None'
                            }
                          </span>
                        </div>
                        {song.audioFile && (
                          <div>
                            <span className="font-medium text-green-600">audioFile:</span>
                            <span className="ml-2 text-xs font-mono text-gray-600">
                              {song.audioFile.substring(0, 60)}...
                            </span>
                          </div>
                        )}
                        {song.audiofile && (
                          <div>
                            <span className="font-medium text-blue-600">audiofile:</span>
                            <span className="ml-2 text-xs font-mono text-gray-600">
                              {song.audiofile.substring(0, 60)}...
                            </span>
                          </div>
                        )}
                        {song.mediaId && (
                          <div>
                            <span className="font-medium text-purple-600">mediaId:</span>
                            <span className="ml-2 text-gray-600">{song.mediaId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Countdown Analysis Section */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 mb-4">🕐 Countdown Data Analysis</h3>
            
            {countdownAnalysis && (
              <div className="mb-4">
                <h4 className="font-semibold text-orange-800 mb-2">Countdown Field Summary:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-2 rounded">
                    <div className="font-medium">Total Pages</div>
                    <div className="text-lg font-bold text-orange-600">{countdownAnalysis.totalPages}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="font-medium">Pages with Countdown</div>
                    <div className="text-lg font-bold text-green-600">{countdownAnalysis.pagesWithCountdown}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="font-medium">countdownDays Field</div>
                    <div className="text-lg font-bold text-purple-600">{countdownAnalysis.pagesWithCountdownDays}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="font-medium">countdown Object</div>
                    <div className="text-lg font-bold text-blue-600">{countdownAnalysis.pagesWithCountdownObject}</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="font-medium text-orange-800 mb-1">Available Countdown Fields:</div>
                  <div className="text-sm text-orange-700">
                    {countdownAnalysis.countdownFields.size > 0 ? (
                      <span className="bg-white px-2 py-1 rounded border">
                        {Array.from(countdownAnalysis.countdownFields).join(', ')}
                      </span>
                    ) : (
                      <span className="text-red-600">❌ No countdown-related fields found</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {countdownAnalysis && countdownAnalysis.samplePages.length > 0 && (
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">Sample Pages (First 3):</h4>
                <div className="space-y-3">
                  {countdownAnalysis.samplePages.map((page: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="font-medium text-gray-900 mb-2">
                        Page {index + 1}: "{page.name}" (ID: {page.id})
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium text-orange-600">Countdown Fields Found:</span>
                          <span className="ml-2 text-xs font-mono text-gray-600">
                            {page.countdownFields.length > 0 ? page.countdownFields.join(', ') : 'None'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-medium text-blue-600">countdownDays:</span>
                            <span className="ml-1">{page.countdownData.countdownDays || 'null'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-600">countdownHours:</span>
                            <span className="ml-1">{page.countdownData.countdownHours || 'null'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-600">countdownMinutes:</span>
                            <span className="ml-1">{page.countdownData.countdownMinutes || 'null'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-600">countdownSeconds:</span>
                            <span className="ml-1">{page.countdownData.countdownSeconds || 'null'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-green-600">countdowndays:</span>
                            <span className="ml-1">{page.countdownData.countdowndays || 'null'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-green-600">countdownhours:</span>
                            <span className="ml-1">{page.countdownData.countdownhours || 'null'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-green-600">countdownminutes:</span>
                            <span className="ml-1">{page.countdownData.countdownminutes || 'null'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-green-600">countdownseconds:</span>
                            <span className="ml-1">{page.countdownData.countdownseconds || 'null'}</span>
                          </div>
                        </div>
                        {page.countdownData.countdown && (
                          <div>
                            <span className="font-medium text-purple-600">countdown object:</span>
                            <span className="ml-2 text-xs font-mono text-gray-600">
                              {JSON.stringify(page.countdownData.countdown)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedView('all')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Songs ({allSongs.length})
            </button>
            <button
              onClick={() => setSelectedView('category')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'category'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              By Category ({Object.keys(songsByCategory).length})
            </button>
            <button
              onClick={() => setSelectedView('page')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'page'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              By Page ({Object.keys(songsByPage).length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {selectedView === 'all' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">All Songs</h2>
              <div className="overflow-x-auto overflow-y-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firebase ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audio File</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allSongs.map((song, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {song.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {song.category || 'No Category'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {song.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getPageName(song.praisenightid || song.praiseNightId || 'No Page ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {song.firebaseId || song.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {song.audioFile ? (
                            <span className="text-green-600 font-mono text-xs">
                              ✅ {song.audioFile.substring(0, 50)}...
                            </span>
                          ) : song.audiofile ? (
                            <span className="text-blue-600 font-mono text-xs">
                              ✅ {song.audiofile.substring(0, 50)}...
                            </span>
                          ) : song.audio_url ? (
                            <span className="text-purple-600 font-mono text-xs">
                              ✅ {song.audio_url.substring(0, 50)}...
                            </span>
                          ) : song.media_url ? (
                            <span className="text-orange-600 font-mono text-xs">
                              ✅ {song.media_url.substring(0, 50)}...
                            </span>
                          ) : (
                            <span className="text-red-600">❌ No audio</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedView === 'category' && (
            <div className="max-h-screen overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Songs by Category</h2>
              {Object.keys(songsByCategory).sort().map(category => (
                <div key={category} className="mb-8">
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                    <h3 className="text-lg font-bold text-green-900">
                      📁 {category} ({songsByCategory[category].length} songs)
                    </h3>
                    <div className="text-sm text-green-700 mt-1">
                      Pages: {[...new Set(songsByCategory[category].map(song => getPageName(song.praisenightid || song.praiseNightId || 'No Page ID')))].join(', ')}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {songsByCategory[category].map((song, index) => (
                        <div key={index} className="bg-white p-3 rounded border shadow-sm">
                          <div className="font-medium text-sm text-gray-900 mb-1">{song.title}</div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Status: <span className="font-medium">{song.status}</span></div>
                            <div>Page: <span className="font-medium">{getPageName(song.praisenightid || song.praiseNightId || 'No Page ID')}</span></div>
                            <div>Firebase ID: <span className="font-mono text-xs">{song.firebaseId || song.id}</span></div>
                            {song.leadSinger && <div>Lead Singer: {song.leadSinger}</div>}
                            {song.writer && <div>Writer: {song.writer}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedView === 'page' && (
            <div className="max-h-screen overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Songs by Page</h2>
              {Object.keys(songsByPage).sort((a, b) => {
                // Sort pages numerically, with "No Page ID" at the end
                if (a === 'No Page ID') return 1
                if (b === 'No Page ID') return -1
                return Number(a) - Number(b)
              }).map(pageId => (
                <div key={pageId} className="mb-8">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <h3 className="text-lg font-bold text-blue-900">
                      📄 {getPageName(pageId)} ({songsByPage[pageId].length} songs)
                    </h3>
                    <div className="text-sm text-blue-700 mt-1">
                      Categories: {[...new Set(songsByPage[pageId].map(song => song.category))].join(', ')}
                    </div>
                  </div>
                  
                  {/* Group songs by category within each page */}
                  {Object.entries(
                    songsByPage[pageId].reduce((acc, song) => {
                      const category = song.category || 'No Category'
                      if (!acc[category]) acc[category] = []
                      acc[category].push(song)
                      return acc
                    }, {} as SongsByCategory)
                  ).map(([category, songs]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-md font-semibold text-gray-800 mb-2">
                        📁 {category} ({songs.length} songs)
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {songs.map((song, index) => (
                            <div key={index} className="bg-white p-3 rounded border shadow-sm">
                              <div className="font-medium text-sm text-gray-900 mb-1">{song.title}</div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <div>Status: <span className="font-medium">{song.status}</span></div>
                                <div>Firebase ID: <span className="font-mono text-xs">{song.firebaseId || song.id}</span></div>
                                {song.leadSinger && <div>Lead Singer: {song.leadSinger}</div>}
                                {song.writer && <div>Writer: {song.writer}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
