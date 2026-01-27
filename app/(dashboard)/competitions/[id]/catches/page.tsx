'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function RecordCatchPage() {
  const router = useRouter()
  const params = useParams()
  const competitionId = params.id as string

  const [competition, setCompetition] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    photo: null as File | null,
  })

  const [fishCount, setFishCount] = useState(1)
  const [fishSizes, setFishSizes] = useState<{[key: number]: string}>({})
  const [fishLures, setFishLures] = useState<{[key: number]: string}>({})
  const [showDetails, setShowDetails] = useState(false)

  const quickCounts = [1, 2, 3, 5, 10]

  const handleFishCountChange = (count: number) => {
    setFishCount(count)
    const newSizes: {[key: number]: string} = {}
    const newLures: {[key: number]: string} = {}
    for (let i = 0; i < count; i++) {
      if (fishSizes[i]) newSizes[i] = fishSizes[i]
      if (fishLures[i]) newLures[i] = fishLures[i]
    }
    setFishSizes(newSizes)
    setFishLures(newLures)
  }

  const handleSizeChange = (index: number, value: string) => {
    setFishSizes({ ...fishSizes, [index]: value })
  }

  const handleLureChange = (index: number, value: string) => {
    setFishLures({ ...fishLures, [index]: value })
  }

  useEffect(() => {
    loadCompetition()
  }, [])

  const loadCompetition = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single()

      if (error) throw error
      setCompetition(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        setSubmitting(false)
        return
      }

      let photoUrl = null

      if (formData.photo) {
        const fileExt = formData.photo.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `${competitionId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('catches-photos')
          .upload(filePath, formData.photo)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('catches-photos')
          .getPublicUrl(filePath)

        photoUrl = publicUrl
      }

      const catchRecords = []
      for (let i = 0; i < fishCount; i++) {
        catchRecords.push({
          competition_id: competitionId,
          user_id: user.id,
          count: 1,
          size: fishSizes[i] ? parseFloat(fishSizes[i]) : null,
          lure: fishLures[i] || null,
          photo_url: photoUrl,
          recorded_at: new Date().toISOString(),
        })
      }

      const { error: insertError } = await supabase
        .from('catches')
        .insert(catchRecords)

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push(`/competitions/${competitionId}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container-narrow">
        <div className="skeleton h-5 w-24 mb-6"></div>
        <div className="skeleton h-20 w-20 mx-auto rounded-xl mb-4"></div>
        <div className="skeleton h-8 w-48 mx-auto mb-8"></div>
        <div className="space-y-4">
          <div className="skeleton h-40 rounded-xl"></div>
          <div className="skeleton h-20 rounded-xl"></div>
          <div className="skeleton h-32 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="page-container-narrow">
        <div className="card p-8">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="empty-state-title">Competition not found</h3>
            <Link href="/competitions" className="btn-primary mt-4">
              Go back
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="page-container-narrow flex items-center justify-center min-h-[70vh]">
        <div className="card p-10 text-center max-w-sm w-full animate-scale-in">
          <div className="w-20 h-20 mx-auto rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Catch logged!
          </h2>
          <p className="text-slate-600 mb-4">
            <span className="text-2xl font-semibold text-emerald-600">{fishCount}</span>
            <span className="block text-sm mt-1">fish recorded</span>
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className="spinner"></span>
            Redirecting...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container-narrow pb-28">
      {/* Back button */}
      <Link href={`/competitions/${competitionId}`} className="back-btn">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-emerald-100 mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          Log catch
        </h1>
        <p className="text-slate-500 text-sm">{competition.name}</p>
      </div>

      {error && (
        <div className="alert alert-error mb-6 animate-slide-up">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fish Count */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">How many fish?</h2>
              <p className="text-xs text-slate-500">Tap to select</p>
            </div>
          </div>

          {/* Quick select buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {quickCounts.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handleFishCountChange(count)}
                className={`relative py-4 rounded-xl font-semibold text-lg transition-all duration-150 ${
                  fishCount === count
                    ? 'bg-teal-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {count}
                {fishCount === count && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500 text-sm font-medium">Other:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={fishCount}
              onChange={(e) => handleFishCountChange(parseInt(e.target.value) || 1)}
              className="input flex-1 text-center text-lg font-semibold py-2"
            />
          </div>
        </div>

        {/* Optional Details Toggle */}
        <div className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-slate-900">Fish details</h2>
                <p className="text-xs text-slate-500">Sizes and lures (optional)</p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center transition-transform ${showDetails ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showDetails && (
            <div className="p-5 border-t border-slate-100 animate-slide-up">
              <p className="text-sm text-slate-500 mb-4">
                Only fill in details for fish you want to track
              </p>
              <div className="space-y-3">
                {Array.from({ length: fishCount }).map((_, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-lg bg-teal-700 text-white text-sm font-semibold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-700">Fish {index + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1.5 block">Size (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={fishSizes[index] || ''}
                          onChange={(e) => handleSizeChange(index, e.target.value)}
                          className="input text-center font-semibold"
                          placeholder="85.5"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1.5 block">Lure</label>
                        <input
                          type="text"
                          value={fishLures[index] || ''}
                          onChange={(e) => handleLureChange(index, e.target.value)}
                          className="input"
                          placeholder="Spinner"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Photo Upload */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Photo</h2>
              <p className="text-xs text-slate-500">Optional - capture your catches</p>
            </div>
          </div>

          <label className="block cursor-pointer group">
            <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-150 ${
              formData.photo
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-slate-200 group-hover:border-teal-400 group-hover:bg-teal-50'
            }`}>
              {formData.photo ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-emerald-700 truncate max-w-[200px]">{formData.photo.name}</p>
                    <p className="text-xs text-emerald-600 mt-1">Tap to change</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                    <svg className="w-6 h-6 text-slate-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-600 group-hover:text-teal-700 transition-colors">Add photo</p>
                    <p className="text-xs text-slate-400">Tap to select</p>
                  </div>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200 sm:relative sm:p-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-none sm:mt-6">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => router.push(`/competitions/${competitionId}`)}
              className="btn-ghost flex-1 sm:flex-initial"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-success flex-[2] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="spinner-light"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save {fishCount} fish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
