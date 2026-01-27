'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function RecordCatchPage() {
  const router = useRouter()
  const params = useParams()
  const competitionId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [competition, setCompetition] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    photo: null as File | null,
    photoPreview: null as string | null,
  })

  const [fishCount, setFishCount] = useState(1)
  const [fishSizes, setFishSizes] = useState<{[key: number]: string}>({})
  const [fishLures, setFishLures] = useState<{[key: number]: string}>({})
  const [showDetails, setShowDetails] = useState(false)

  const quickCounts = [1, 2, 3, 5, 10]

  // Grain texture for premium background
  const grainTexture = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E\")"

  // Entrance animation
  const entranceAnimation = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes checkBounce {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
  `

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
      const file = e.target.files[0]
      setFormData({
        ...formData,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      })
    }
  }

  const removePhoto = () => {
    if (formData.photoPreview) {
      URL.revokeObjectURL(formData.photoPreview)
    }
    setFormData({ ...formData, photo: null, photoPreview: null })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
      <>
        <style dangerouslySetInnerHTML={{ __html: entranceAnimation }} />
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-[#E6F2F1] to-slate-100" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: grainTexture }} />
        </div>
        <div className="min-h-screen px-4 py-6">
          <div className="max-w-lg mx-auto">
            <div className="h-8 w-32 bg-slate-200 rounded-lg mb-6 animate-pulse" />
            <div className="h-20 w-20 mx-auto bg-slate-200 rounded-2xl mb-4 animate-pulse" />
            <div className="h-8 w-48 mx-auto bg-slate-200 rounded-lg mb-8 animate-pulse" />
            <div className="space-y-4">
              <div className="h-48 bg-white/80 rounded-2xl animate-pulse" />
              <div className="h-32 bg-white/80 rounded-2xl animate-pulse" />
              <div className="h-40 bg-white/80 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!competition) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: entranceAnimation }} />
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-[#E6F2F1] to-slate-100" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: grainTexture }} />
        </div>
        <div className="min-h-screen px-4 py-6 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-lg p-8 text-center max-w-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Compétition introuvable</h3>
            <Link
              href="/competitions"
              className="inline-flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-[#0A4F4C] to-[#065F46] text-white rounded-xl font-semibold shadow-lg shadow-[#0A4F4C]/25"
            >
              Retour
            </Link>
          </div>
        </div>
      </>
    )
  }

  // Success State
  if (success) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: entranceAnimation }} />
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-[#E6F2F1] to-teal-50" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: grainTexture }} />
        </div>
        <div className="min-h-screen px-4 flex items-center justify-center">
          <div
            className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-emerald-200 shadow-2xl shadow-emerald-500/20 p-8 md:p-10 text-center max-w-sm w-full"
            style={{ animation: 'scaleIn 0.4s ease-out forwards' }}
          >
            {/* Success Icon */}
            <div
              className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
              style={{ animation: 'checkBounce 0.5s ease-out 0.2s forwards', transform: 'scale(0)' }}
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Capture enregistrée !
            </h2>

            <div className="my-6 py-4 px-6 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-4xl font-bold text-emerald-600">{fishCount}</span>
              <span className="block text-sm text-emerald-700 mt-1 font-medium">
                {fishCount === 1 ? 'poisson enregistré' : 'poissons enregistrés'}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-500">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium">Redirection...</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: entranceAnimation }} />

      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-[#E6F2F1] to-slate-100" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: grainTexture }}
        />
      </div>

      <div className="min-h-screen px-4 py-6 pb-32 sm:pb-6">
        <div className="max-w-lg mx-auto">
          {/* Back button */}
          <Link
            href={`/competitions/${competitionId}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#0A4F4C] mb-6 group transition-colors duration-200"
            style={{ animation: 'slideInUp 0.4s ease-out forwards' }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/80 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-[#0A4F4C]/30 transition-all duration-200">
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-sm font-medium">Retour</span>
          </Link>

          {/* Header */}
          <div
            className="text-center mb-8"
            style={{ animation: 'slideInUp 0.4s ease-out 0.1s forwards', opacity: 0 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-[#0A4F4C] rounded-2xl mb-4 shadow-xl shadow-emerald-500/25">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Nouvelle capture
            </h1>
            <p className="text-slate-500">{competition.name}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              style={{ animation: 'slideInUp 0.3s ease-out forwards' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo Upload - PRIORITY SECTION */}
            <div
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/5 overflow-hidden"
              style={{ animation: 'slideInUp 0.4s ease-out 0.15s forwards', opacity: 0 }}
            >
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D9488]/20 to-[#0A4F4C]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#0A4F4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">Photo</h2>
                    <p className="text-xs text-slate-500">Immortalisez votre prise</p>
                  </div>
                  <span className="ml-auto px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                    Optionnel
                  </span>
                </div>
              </div>

              <div className="p-5">
                {formData.photoPreview ? (
                  // Photo Preview
                  <div className="relative rounded-xl overflow-hidden group">
                    <img
                      src={formData.photoPreview}
                      alt="Aperçu"
                      className="w-full aspect-[4/3] object-cover"
                    />
                    {/* Overlay with controls */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 bg-white/90 text-slate-900 rounded-xl font-medium text-sm hover:bg-white transition-colors"
                      >
                        Changer
                      </button>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="px-4 py-2.5 bg-red-500/90 text-white rounded-xl font-medium text-sm hover:bg-red-500 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                    {/* Mobile: Always visible controls */}
                    <div className="absolute bottom-3 right-3 flex gap-2 sm:hidden">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="w-10 h-10 bg-red-500/90 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Upload Area
                  <label className="block cursor-pointer group">
                    <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-[#0A4F4C] hover:bg-[#E6F2F1]/30 transition-all duration-200">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#E6F2F1] to-[#0A4F4C]/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                          <svg className="w-8 h-8 text-[#0A4F4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-base font-semibold text-slate-900 group-hover:text-[#0A4F4C] transition-colors">
                            Ajouter une photo
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            Appuyez pour prendre ou choisir
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/heic,image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Fish Count */}
            <div
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/5 overflow-hidden"
              style={{ animation: 'slideInUp 0.4s ease-out 0.2s forwards', opacity: 0 }}
            >
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">Nombre de prises</h2>
                    <p className="text-xs text-slate-500">Combien de poissons ?</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Quick select buttons - Large touch targets */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {quickCounts.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleFishCountChange(count)}
                      className={`relative min-h-[56px] rounded-xl font-bold text-xl transition-all duration-150 active:scale-95 ${
                        fishCount === count
                          ? 'bg-gradient-to-br from-[#0A4F4C] to-[#065F46] text-white shadow-lg shadow-[#0A4F4C]/30'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {count}
                      {fishCount === count && (
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 text-sm font-medium">Autre :</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="50"
                    value={fishCount}
                    onChange={(e) => handleFishCountChange(parseInt(e.target.value) || 1)}
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-center text-xl font-bold text-slate-900 focus:outline-none focus:border-[#0A4F4C] focus:ring-2 focus:ring-[#0A4F4C]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Optional Details Toggle */}
            <div
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/5 overflow-hidden"
              style={{ animation: 'slideInUp 0.4s ease-out 0.25s forwards', opacity: 0 }}
            >
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors active:bg-slate-100/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h2 className="font-semibold text-slate-900">Détails des poissons</h2>
                    <p className="text-xs text-slate-500">Tailles et leurres (optionnel)</p>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {showDetails && (
                <div className="p-5 border-t border-slate-100" style={{ animation: 'slideInUp 0.3s ease-out forwards' }}>
                  <p className="text-sm text-slate-500 mb-4">
                    Remplissez uniquement les poissons que vous souhaitez détailler
                  </p>
                  <div className="space-y-3">
                    {Array.from({ length: fishCount }).map((_, index) => (
                      <div key={index} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A4F4C] to-[#065F46] text-white text-sm font-bold flex items-center justify-center shadow-sm">
                            {index + 1}
                          </span>
                          <span className="font-medium text-slate-700">Poisson {index + 1}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Taille</label>
                            <div className="relative">
                              <input
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                min="0"
                                value={fishSizes[index] || ''}
                                onChange={(e) => handleSizeChange(index, e.target.value)}
                                className="w-full px-4 py-3 pr-12 bg-white border border-slate-200 rounded-xl text-center font-semibold text-slate-900 focus:outline-none focus:border-[#0A4F4C] focus:ring-2 focus:ring-[#0A4F4C]/20 transition-all"
                                placeholder="85"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                                cm
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Leurre</label>
                            <input
                              type="text"
                              value={fishLures[index] || ''}
                              onChange={(e) => handleLureChange(index, e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#0A4F4C] focus:ring-2 focus:ring-[#0A4F4C]/20 transition-all"
                              placeholder="Cuillère"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Submit */}
            <div
              className="hidden sm:flex gap-3 pt-2"
              style={{ animation: 'slideInUp 0.4s ease-out 0.3s forwards', opacity: 0 }}
            >
              <button
                type="button"
                onClick={() => router.push(`/competitions/${competitionId}`)}
                className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-[#0A4F4C] text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Enregistrer {fishCount} {fishCount === 1 ? 'poisson' : 'poissons'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => router.push(`/competitions/${competitionId}`)}
            className="min-h-[52px] px-5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 min-h-[52px] flex items-center justify-center gap-2 px-6 bg-gradient-to-r from-emerald-500 to-[#0A4F4C] text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{fishCount} {fishCount === 1 ? 'poisson' : 'poissons'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
