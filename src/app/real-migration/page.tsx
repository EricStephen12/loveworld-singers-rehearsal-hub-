'use client'

import { useState } from 'react'
import { RealDataMigration } from '@/lib/real-data-migration'

export default function RealMigrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMigration = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🚀 Starting real data migration...')
      const result = await RealDataMigration.migrateAllData()
      
      if (result.success) {
        setResult(result)
        console.log('✅ Migration completed successfully!')
      } else {
        setError(result.error || 'Migration failed')
        console.error('❌ Migration failed:', result.error)
      }
    } catch (error: any) {
      setError(error.message)
      console.error('❌ Migration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemainingTablesMigration = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🚀 Starting remaining tables migration...')
      const result = await RealDataMigration.migrateRemainingTables()
      
      if (result.success) {
        setResult(result)
        console.log('✅ Remaining tables migration completed successfully!')
      } else {
        setError(result.error || 'Remaining tables migration failed')
        console.error('❌ Remaining tables migration failed:', result.error)
      }
    } catch (error: any) {
      setError(error.message)
      console.error('❌ Remaining tables migration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔄 Real Data Migration
          </h1>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              This will migrate your real Supabase data to Firebase, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>All praise nights from your Supabase database</li>
              <li>All songs associated with those praise nights</li>
              <li>Preserves all original data and relationships</li>
            </ul>
          </div>

          <div className="mb-8 space-y-4">
            <button
              onClick={handleMigration}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Migrating...
                </>
              ) : (
                '🚀 Migrate Pages (Praise Nights)'
              )}
            </button>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Essential Tables Migration</h3>
              <p className="text-gray-600 mb-4">
                Migrate essential tables (comments, song_history) and skip user-generated tables that will be created fresh in Firebase
              </p>
              <button
                onClick={handleRemainingTablesMigration}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Migrating...
                  </>
                ) : (
                  '🔄 Migrate Essential Tables'
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-semibold mb-2">Migration Failed</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-green-800 font-semibold mb-2">Migration Successful!</h3>
              <div className="text-green-600">
                <p>✅ Praise Nights: {result.praiseNights}</p>
                <p>✅ Songs: {result.songs}</p>
                <p className="mt-2 text-sm">
                  Your real Supabase data has been successfully migrated to Firebase!
                </p>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-yellow-800 font-semibold mb-2">⚠️ Important Notes</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• This migration will add your real data to Firebase</li>
              <li>• Your original Supabase data will remain unchanged</li>
              <li>• After migration, your app will use Firebase data</li>
              <li>• Make sure your Firebase project is properly configured</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
