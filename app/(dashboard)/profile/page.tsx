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
      console.error('Erreur:', error)
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
      <div className="page-container form-container">
        <div className="skeleton h-8 w-32 mb-8 rounded-lg"></div>
        <div className="card p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="skeleton w-24 h-24 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="skeleton h-6 w-40 rounded"></div>
              <div className="skeleton h-4 w-32 rounded"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="skeleton h-12 rounded-xl"></div>
            <div className="skeleton h-12 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container form-container">
      {/* Back link */}
      <Link href="/competitions" className="back-link">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Mes compétitions
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-900">
          Mon Profil
        </h1>
        <p className="text-navy-500 mt-1">Gérez vos informations</p>
      </div>

      {success && (
        <div className="alert alert-success mb-6 animate-scale-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium">Profil mis à jour avec succès !</p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-6 animate-scale-in">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="card p-6 md:p-8">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-navy-100 mb-8">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-water-200"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-water-gradient flex items-center justify-center text-3xl text-white font-display font-bold border-4 border-water-200">
                {getInitials(name)}
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              {uploadingAvatar ? (
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <span className="text-sm font-medium">Modifier</span>
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

          <div className="text-center sm:text-left">
            <h2 className="font-display text-2xl font-bold text-navy-900">
              {name || 'Pêcheur anonyme'}
            </h2>
            <p className="text-navy-500">{user?.email}</p>
            {punchline && (
              <p className="text-water-600 font-medium mt-1 italic">"{punchline}"</p>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Votre nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label className="label">Votre punchline</label>
            <input
              type="text"
              value={punchline}
              onChange={(e) => setPunchline(e.target.value)}
              className="input"
              placeholder="Le roi du brochet !"
            />
            <p className="text-sm text-navy-400 mt-1">
              Cette phrase sera affichée à côté de votre nom
            </p>
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input bg-navy-50 text-navy-500 cursor-not-allowed"
            />
            <p className="text-sm text-navy-400 mt-1">
              L'email ne peut pas être modifié
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enregistrer les modifications
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
