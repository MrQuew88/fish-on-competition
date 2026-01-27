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
      <div className="page-container-narrow">
        <div className="skeleton h-5 w-28 mb-6"></div>
        <div className="text-center mb-8">
          <div className="skeleton w-20 h-20 rounded-xl mx-auto mb-4"></div>
          <div className="skeleton h-6 w-32 mx-auto mb-2"></div>
          <div className="skeleton h-4 w-48 mx-auto"></div>
        </div>
        <div className="card p-5">
          <div className="space-y-4">
            <div className="skeleton h-12 rounded-lg"></div>
            <div className="skeleton h-12 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container-narrow">
      {/* Back link */}
      <Link href="/competitions" className="back-btn">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Competitions
      </Link>

      {/* Header with Avatar */}
      <div className="text-center mb-8">
        <div className="relative inline-block group mb-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-20 h-20 rounded-xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-teal-700 flex items-center justify-center text-xl text-white font-semibold">
              {getInitials(name)}
            </div>
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-slate-900/50 text-white rounded-xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            {uploadingAvatar ? (
              <span className="spinner-light"></span>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
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

        <h1 className="text-xl font-semibold text-slate-900">
          {name || 'Your profile'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
        {punchline && (
          <p className="text-teal-700 text-sm font-medium mt-2 italic">"{punchline}"</p>
        )}
      </div>

      {/* Alerts */}
      {success && (
        <div className="alert alert-success mb-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p>Profile saved</p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4 animate-slide-up">
          <p>{error}</p>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="font-semibold text-slate-900">Account info</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Display name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="label">Tagline</label>
              <input
                type="text"
                value={punchline}
                onChange={(e) => setPunchline(e.target.value)}
                className="input"
                placeholder="Pike hunter since 2010"
              />
              <p className="helper-text">This will appear on your profile</p>
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="helper-text">Email cannot be changed</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner-light"></span>
              Saving...
            </span>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save changes
            </>
          )}
        </button>
      </form>
    </div>
  )
}
