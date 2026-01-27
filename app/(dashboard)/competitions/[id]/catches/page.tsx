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
      console.error('Erreur:', error)
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
        setError('Vous devez être connecté')
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
      <div className="page-container">
        <div className="skeleton h-5 w-24 mb-6"></div>
        <div className="skeleton h-24 w-24 mx-auto rounded-3xl mb-4"></div>
        <div className="skeleton h-8 w-48 mx-auto mb-8"></div>
        <div className="space-y-5">
          <div className="skeleton h-40 rounded-3xl"></div>
          <div className="skeleton h-20 rounded-3xl"></div>
          <div className="skeleton h-32 rounded-3xl"></div>
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="page-container">
        <div className="card p-8">
          <div className="empty-state">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="empty-state-title">Compétition introuvable</h3>
            <Link href="/competitions" className="btn-primary mt-4">
              Retour
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="page-container flex items-center justify-center min-h-[70vh]">
        <div className="card p-10 text-center max-w-sm w-full animate-bounce-in">
          {/* Success animation container */}
          <div className="relative mb-6">
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center shadow-lg shadow-forest-500/30">
              <svg className="w-14 h-14 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationDelay: '0.2s' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {/* Celebration particles */}
            <div className="absolute -top-2 -left-2 text-2xl animate-float" style={{ animationDelay: '0.1s' }}>*</div>
            <div className="absolute -top-4 right-0 text-xl animate-float" style={{ animationDelay: '0.3s' }}>*</div>
            <div className="absolute top-0 -right-4 text-lg animate-float" style={{ animationDelay: '0.5s' }}>*</div>
          </div>

          <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">
            Bien joué !
          </h2>
          <p className="text-navy-600 mb-4">
            <span className="text-3xl font-display font-bold text-forest-600">{fishCount}</span>
            <span className="block text-sm mt-1">poisson{fishCount > 1 ? 's' : ''} enregistré{fishCount > 1 ? 's' : ''}</span>
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-navy-500">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Redirection...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container pb-28">
      {/* Back button */}
      <Link href={`/competitions/${competitionId}`} className="back-btn">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-forest-400 to-forest-600 shadow-lg shadow-forest-500/30 mb-4 animate-float">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">
          Nouvelle capture
        </h1>
        <p className="text-navy-500 text-sm">{competition.name}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-800 font-medium text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Fish Count - Large touch targets */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-water-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-water-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-bold text-navy-900">Combien de poissons ?</h2>
              <p className="text-xs text-navy-500">Touchez pour sélectionner</p>
            </div>
          </div>

          {/* Quick select buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {quickCounts.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handleFishCountChange(count)}
                className={`relative py-5 rounded-2xl font-display font-bold text-xl transition-all duration-200 ${
                  fishCount === count
                    ? 'bg-gradient-to-br from-water-500 to-water-700 text-white shadow-lg shadow-water-500/30 scale-105'
                    : 'bg-navy-100 text-navy-700 hover:bg-navy-200 active:scale-95'
                }`}
              >
                {count}
                {fishCount === count && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-forest-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-3 p-3 bg-navy-50 rounded-xl">
            <span className="text-navy-500 text-sm font-medium">Autre :</span>
            <input
              type="number"
              min="1"
              max="50"
              value={fishCount}
              onChange={(e) => handleFishCountChange(parseInt(e.target.value) || 1)}
              className="input flex-1 text-center text-xl font-display font-bold py-3"
            />
            <div className="w-10 h-10 rounded-xl bg-water-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-water-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Optional Details Toggle */}
        <div className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-5 flex items-center justify-between hover:bg-navy-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gold-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="font-display font-bold text-navy-900">
                  Détails des poissons
                </h2>
                <p className="text-xs text-navy-500">
                  Tailles et leurres (optionnel)
                </p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center transition-transform ${showDetails ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showDetails && (
            <div className="p-5 border-t border-navy-100 animate-slide-up">
              <p className="text-sm text-navy-500 mb-4">
                Renseignez uniquement les poissons dont vous voulez garder les détails
              </p>
              <div className="space-y-3">
                {Array.from({ length: fishCount }).map((_, index) => (
                  <div key={index} className="p-4 bg-navy-50 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-water-500 to-water-600 text-white text-sm font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-display font-semibold text-navy-700">Poisson {index + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-navy-600 mb-1.5 block">Taille (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={fishSizes[index] || ''}
                          onChange={(e) => handleSizeChange(index, e.target.value)}
                          className="input text-center font-display font-semibold"
                          placeholder="85.5"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-navy-600 mb-1.5 block">Leurre</label>
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
            <div className="w-11 h-11 rounded-xl bg-water-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-water-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-bold text-navy-900">
                Photo de la session
              </h2>
              <p className="text-xs text-navy-500">
                Optionnel - immortalisez vos prises
              </p>
            </div>
          </div>

          <label className="block cursor-pointer group">
            <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              formData.photo
                ? 'border-forest-400 bg-forest-50'
                : 'border-navy-200 group-hover:border-water-400 group-hover:bg-water-50'
            }`}>
              {formData.photo ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-forest-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-forest-700 truncate max-w-[200px]">{formData.photo.name}</p>
                    <p className="text-xs text-forest-600 mt-1">Touchez pour changer</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-navy-100 group-hover:bg-water-100 flex items-center justify-center transition-colors">
                    <svg className="w-7 h-7 text-navy-400 group-hover:text-water-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-navy-600 group-hover:text-water-700 transition-colors">Ajouter une photo</p>
                    <p className="text-xs text-navy-400">Touchez pour sélectionner</p>
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

        {/* Action Buttons - Fixed at bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-navy-100 sm:relative sm:p-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-none sm:mt-6">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <button
              type="button"
              onClick={() => router.push(`/competitions/${competitionId}`)}
              className="btn-secondary flex-1 sm:flex-initial"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-success flex-[2] flex items-center justify-center gap-2 shadow-lg shadow-forest-500/30"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Enregistrer {fishCount} poisson{fishCount > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
