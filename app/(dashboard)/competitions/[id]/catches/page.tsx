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
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container form-container">
        <div className="skeleton h-8 w-48 mb-6 rounded-lg"></div>
        <div className="card p-8">
          <div className="skeleton h-10 w-2/3 mb-8 rounded-xl"></div>
          <div className="space-y-6">
            <div className="skeleton h-24 rounded-xl"></div>
            <div className="skeleton h-40 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="page-container form-container">
        <div className="card p-12">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">
              Compétition introuvable
            </h3>
            <Link href="/competitions" className="btn-primary">
              Retour aux compétitions
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="page-container form-container">
        <div className="card p-12">
          <div className="text-center animate-bounce-in">
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">
              Capture enregistrée !
            </h2>
            <p className="text-navy-500">
              {fishCount} poisson{fishCount > 1 ? 's' : ''} ajouté{fishCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container form-container pb-24">
      {/* Back link */}
      <Link href={`/competitions/${competitionId}`} className="back-link">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-forest-100 rounded-3xl mb-4 animate-float">
          <span className="text-4xl">🎣</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">
          Nouvelle capture
        </h1>
        <p className="text-navy-500">{competition.name}</p>
      </div>

      {error && (
        <div className="alert alert-error mb-6 animate-scale-in">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fish Count - Large touch targets */}
        <div className="card p-6">
          <label className="label text-lg mb-4">
            Combien de poissons ?
          </label>

          {/* Quick select buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {quickCounts.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handleFishCountChange(count)}
                className={`py-4 rounded-xl font-display font-bold text-lg transition-all duration-200 ${
                  fishCount === count
                    ? 'bg-water-700 text-white shadow-water'
                    : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-3">
            <span className="text-navy-500 text-sm">Autre :</span>
            <input
              type="number"
              min="1"
              max="50"
              value={fishCount}
              onChange={(e) => handleFishCountChange(parseInt(e.target.value) || 1)}
              className="input flex-1 text-center text-xl font-display font-bold"
            />
            <span className="text-2xl">🐟</span>
          </div>
        </div>

        {/* Optional Details Toggle */}
        <div className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-4 flex items-center justify-between hover:bg-navy-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                📏
              </div>
              <div className="text-left">
                <div className="font-display font-semibold text-navy-900">
                  Détails des poissons
                </div>
                <div className="text-sm text-navy-500">
                  Tailles et leurres (optionnel)
                </div>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-navy-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDetails && (
            <div className="p-4 border-t border-navy-100 space-y-4 animate-slide-up">
              <p className="text-sm text-navy-500">
                Renseignez uniquement les poissons dont vous voulez enregistrer les détails
              </p>
              {Array.from({ length: fishCount }).map((_, index) => (
                <div key={index} className="p-4 bg-navy-50 rounded-xl">
                  <div className="font-display font-semibold text-navy-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-water-600 text-white text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    Poisson {index + 1}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-navy-600 mb-1 block">Taille (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={fishSizes[index] || ''}
                        onChange={(e) => handleSizeChange(index, e.target.value)}
                        className="input text-center"
                        placeholder="85.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-navy-600 mb-1 block">Leurre</label>
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
          )}
        </div>

        {/* Photo Upload */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-water-100 flex items-center justify-center">
              📸
            </div>
            <div>
              <div className="font-display font-semibold text-navy-900">
                Photo de la session
              </div>
              <div className="text-sm text-navy-500">
                Optionnel - pour immortaliser vos prises
              </div>
            </div>
          </div>

          <label className="block cursor-pointer">
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
              formData.photo
                ? 'border-forest-400 bg-forest-50'
                : 'border-navy-200 hover:border-water-400 hover:bg-water-50'
            }`}>
              {formData.photo ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium text-forest-700">{formData.photo.name}</span>
                </div>
              ) : (
                <>
                  <div className="text-3xl mb-2">📷</div>
                  <div className="text-navy-600 font-medium">Ajouter une photo</div>
                  <div className="text-sm text-navy-400">Tap pour sélectionner</div>
                </>
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

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-navy-100 sm:relative sm:p-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-none">
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
              className="btn-success flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Enregistrement...
                </>
              ) : (
                <>
                  <span className="text-lg">✓</span>
                  Enregistrer {fishCount} poisson{fishCount > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
