'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [punchline, setPunchline] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setName(profileData.name || '')
        setPunchline(profileData.punchline || '')
        setAvatarUrl(profileData.avatar_url)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploadingAvatar(true)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      setProfile({ ...profile, avatar_url: publicUrl })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name,
          punchline,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile({ ...profile, name, punchline })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 relative">
        {/* Grain texture */}
        <div className="fixed inset-0 opacity-[0.025] pointer-events-none" style={{ zIndex: 1 }}>
          <svg width="100%" height="100%">
            <filter id="grain-loading">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-loading)" />
          </svg>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6 relative" style={{ zIndex: 2 }}>
          <div className="h-5 w-28 bg-slate-200 rounded animate-pulse mb-6"></div>
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-2xl bg-slate-200 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-32 mx-auto bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 mx-auto bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-6 shadow-lg">
            <div className="space-y-4">
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 relative">
      {/* Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-slide-in-up { animation: slideInUp 0.4s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
      `}} />

      {/* Grain texture */}
      <div className="fixed inset-0 opacity-[0.025] pointer-events-none" style={{ zIndex: 1 }}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 relative" style={{ zIndex: 2 }}>
        {/* Back link */}
        <Link
          href="/competitions"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0A4F4C] transition-colors mb-6 group animate-slide-in-up"
          style={{ animationDelay: '0ms' }}
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Compétitions
        </Link>

        {/* Header with Avatar */}
        <div
          className="text-center mb-8 animate-slide-in-up"
          style={{ animationDelay: '50ms' }}
        >
          <div className="relative inline-block group mb-4">
            {/* Avatar glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-[#0A4F4C]/20 to-emerald-500/20 rounded-2xl blur-lg opacity-60"></div>

            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="relative w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-xl"
              />
            ) : (
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0A4F4C] to-[#0D6963] flex items-center justify-center text-2xl text-white font-bold ring-4 ring-white shadow-xl">
                {getInitials(name)}
              </div>
            )}

            {/* Upload overlay */}
            <label className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm text-white rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200">
              {uploadingAvatar ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-medium">Modifier</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            {name || 'Votre profil'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
          {punchline && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#0A4F4C]/5 rounded-full">
              <svg className="w-4 h-4 text-[#0A4F4C]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <p className="text-[#0A4F4C] text-sm font-medium italic">"{punchline}"</p>
            </div>
          )}
        </div>

        {/* Alerts */}
        {success && (
          <div
            className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-scale-in"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-emerald-800">Profil enregistré</p>
              <p className="text-sm text-emerald-600">Vos modifications ont été sauvegardées</p>
            </div>
          </div>
        )}

        {error && (
          <div
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-scale-in"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-red-800">Erreur</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit}>
          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-lg overflow-hidden mb-6 animate-slide-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {/* Card header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A4F4C] to-[#0D6963] flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Informations du compte</h2>
                  <p className="text-xs text-slate-500">Gérez vos informations personnelles</p>
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nom d'affichage
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A4F4C]/20 focus:border-[#0A4F4C] transition-all"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Devise de pêcheur
                </label>
                <input
                  type="text"
                  value={punchline}
                  onChange={(e) => setPunchline(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A4F4C]/20 focus:border-[#0A4F4C] transition-all"
                  placeholder="Chasseur de brochets depuis 2010"
                />
                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Apparaîtra sur votre profil
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  L'email ne peut pas être modifié
                </p>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#0A4F4C] to-[#0D6963] hover:from-[#0D6963] hover:to-[#0A4F4C] text-white font-semibold rounded-xl shadow-lg shadow-[#0A4F4C]/25 hover:shadow-xl hover:shadow-[#0A4F4C]/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed animate-slide-in-up"
            style={{ animationDelay: '150ms' }}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Enregistrer les modifications</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
