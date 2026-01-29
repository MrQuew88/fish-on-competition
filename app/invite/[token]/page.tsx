'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function InviteAcceptPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [competition, setCompetition] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [punchline, setPunchline] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadInvitation()
  }, [token])

  const loadInvitation = async () => {
    try {
      const { data: participant, error: partError } = await supabase
        .from('participants')
        .select('*, competitions(*)')
        .eq('invitation_token', token)
        .single()

      if (partError || !participant) {
        setError('Invitation invalide ou expirée')
        setLoading(false)
        return
      }

      if (participant.status === 'accepted') {
        setError('Cette invitation a déjà été acceptée')
        setLoading(false)
        return
      }

      setCompetition(participant.competitions)
    } catch (err) {
      setError('Erreur lors du chargement de l\'invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/signup?invite=${token}&name=${encodeURIComponent(name)}&punchline=${encodeURIComponent(punchline)}`)
        return
      }

      await supabase
        .from('profiles')
        .update({ name, punchline })
        .eq('id', user.id)

      await supabase
        .from('participants')
        .update({
          user_id: user.id,
          status: 'accepted',
          joined_at: new Date().toISOString(),
        })
        .eq('invitation_token', token)

      router.push(`/competitions/${competition.id}`)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-xl mb-4 animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-text-muted">Chargement de l'invitation...</p>
        </div>
      </div>
    )
  }

  if (error && !competition) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="card p-8">
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="empty-state-title">Erreur d'invitation</h3>
              <p className="empty-state-text mb-6">{error}</p>
              <Link href="/" className="btn-primary">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-xl mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-text-primary">
              Vous êtes invité !
            </h1>
            <p className="text-text-muted mt-1">
              Rejoignez cette compétition de pêche
            </p>
          </div>

          {/* Competition Info Card */}
          <div className="card p-5 mb-4 bg-primary-light border-primary/30">
            <h2 className="font-semibold text-text-primary text-lg mb-3">{competition.name}</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(competition.start_date)} → {formatDate(competition.end_date)}</span>
              </div>
              {competition.location && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{competition.location}</span>
                </div>
              )}
              {competition.species && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{competition.species}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Card */}
          <div className="card p-6">
            <form onSubmit={handleAccept} className="space-y-4">
              <div>
                <label className="label">Votre nom *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input"
                  placeholder="Jean Dupont"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="label">Slogan (optionnel)</label>
                <input
                  type="text"
                  value={punchline}
                  onChange={(e) => setPunchline(e.target.value)}
                  className="input"
                  placeholder="Chasseur de brochets depuis 2010"
                  maxLength={100}
                />
                <p className="helper-text">Apparaîtra sur votre profil</p>
              </div>

              {error && (
                <div className="alert alert-error">
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner-light"></span>
                    Inscription...
                  </span>
                ) : (
                  <>
                    Accepter l'invitation
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-surface-border text-center">
              <p className="text-sm text-text-muted">
                Déjà un compte ?{' '}
                <Link
                  href="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Connectez-vous d'abord
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
