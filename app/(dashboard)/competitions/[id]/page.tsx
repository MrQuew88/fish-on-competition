'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Competition, Participant } from '@/types'
import Link from 'next/link'

export default function CompetitionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const competitionId = params.id as string

  const [competition, setCompetition] = useState<Competition | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreator, setIsCreator] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadCompetition()
  }, [competitionId])

  const loadCompetition = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: compData, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single()

      if (compError) throw compError

      setCompetition(compData)
      setIsCreator(compData.creator_id === user.id)

      const { data: partData, error: partError } = await supabase
        .from('participants')
        .select('*, profiles(name, avatar_url)')
        .eq('competition_id', competitionId)

      if (partError) throw partError
      setParticipants(partData || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleStartCompetition = async () => {
    if (!confirm('Demarrer cette competition ?')) return
    setActionLoading(true)
    try {
      await supabase
        .from('competitions')
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('id', competitionId)
      loadCompetition()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleFinishCompetition = async () => {
    if (!confirm('Terminer cette competition ?')) return
    setActionLoading(true)
    try {
      await supabase
        .from('competitions')
        .update({ status: 'finished', finished_at: new Date().toISOString() })
        .eq('id', competitionId)
      router.push(`/competitions/${competitionId}/results`)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-4 w-16 mb-6"></div>
        <div className="card p-6 mb-4">
          <div className="skeleton h-6 w-2/3 mb-3"></div>
          <div className="skeleton h-4 w-1/3"></div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-20 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="page-container">
        <div className="card p-8">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-12 h-12 mx-auto text-depth-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="empty-state-title">Competition introuvable</h3>
            <p className="empty-state-text mb-6">Cette competition n'existe pas ou a ete supprimee</p>
            <Link href="/competitions" className="btn-primary">
              Retour
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const acceptedParticipants = participants.filter(p => p.status === 'accepted')
  const pendingParticipants = participants.filter(p => p.status === 'invited')

  const StatusBadge = () => {
    if (competition.status === 'active') {
      return (
        <span className="badge badge-active">
          <span className="status-dot status-dot-live"></span>
          En cours
        </span>
      )
    }
    if (competition.status === 'finished') {
      return <span className="badge badge-finished">Terminee</span>
    }
    return <span className="badge badge-draft">Brouillon</span>
  }

  return (
    <div className="page-container">
      {/* Back button */}
      <Link href="/competitions" className="back-btn">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Competitions
      </Link>

      {/* Header Card */}
      <div className={`rounded-2xl p-5 mb-4 ${
        competition.status === 'active'
          ? 'card-nature'
          : competition.status === 'finished'
          ? 'card-dark'
          : 'card'
      }`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <StatusBadge />
            <h1 className={`text-display text-xl mt-2 ${
              competition.status !== 'draft' ? 'text-white' : ''
            }`}>
              {competition.name}
            </h1>
            {competition.species && (
              <p className={`text-sm mt-0.5 ${
                competition.status !== 'draft' ? 'text-white/70' : 'text-depth-500'
              }`}>
                {competition.species}
              </p>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className={`flex flex-wrap gap-x-5 gap-y-2 text-sm ${
          competition.status !== 'draft' ? 'text-white/80' : 'text-depth-600'
        }`}>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {formatDate(competition.start_date)}
              {competition.end_date !== competition.start_date && ` — ${formatDate(competition.end_date)}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{competition.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{acceptedParticipants.length} participant{acceptedParticipants.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {competition.description && (
          <p className={`mt-4 pt-4 text-sm border-t ${
            competition.status !== 'draft'
              ? 'text-white/70 border-white/10'
              : 'text-depth-600 border-earth-200'
          }`}>
            {competition.description}
          </p>
        )}
      </div>

      {/* Prize banner */}
      {competition.prize && (
        <div className="prize-banner mb-4 animate-fade-in">
          <div className="w-10 h-10 rounded-lg bg-earth-200 flex items-center justify-center">
            <svg className="w-5 h-5 text-earth-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <p className="text-label">Recompense</p>
            <p className="text-sm font-medium text-depth-800">{competition.prize}</p>
          </div>
        </div>
      )}

      {/* Quick Actions - Active */}
      {competition.status === 'active' && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Link href={`/competitions/${competitionId}/catches`} className="action-btn animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="action-btn-icon bg-moss-100 text-moss-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="action-btn-label">Capturer</span>
          </Link>
          <Link href={`/competitions/${competitionId}/leaderboard`} className="action-btn animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="action-btn-icon bg-earth-100 text-earth-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="action-btn-label">Classement</span>
          </Link>
          <Link href={`/competitions/${competitionId}/captures`} className="action-btn animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="action-btn-icon bg-depth-100 text-depth-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="action-btn-label">Galerie</span>
          </Link>
        </div>
      )}

      {/* Finished - Results CTA */}
      {competition.status === 'finished' && (
        <Link
          href={`/competitions/${competitionId}/results`}
          className="card-interactive flex items-center justify-between p-4 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-amber-200 to-amber-400 flex items-center justify-center shadow-soft">
              <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-display text-sm">Resultats finaux</p>
              <p className="text-xs text-depth-500">Voir le classement complet</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-depth-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* Participants */}
      <div className="card mb-4">
        <div className="flex items-center justify-between p-4 pb-0">
          <h2 className="section-title mb-0">Participants</h2>
          {isCreator && competition.status === 'draft' && (
            <Link href={`/competitions/${competitionId}/invite`} className="btn-ghost btn-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Inviter
            </Link>
          )}
        </div>

        <div className="p-4 pt-3">
          {acceptedParticipants.length === 0 ? (
            <p className="text-sm text-depth-500 text-center py-6">
              Aucun participant confirme
            </p>
          ) : (
            <div className="space-y-1">
              {acceptedParticipants.map((participant: any, index: number) => (
                <div
                  key={participant.id}
                  className="participant-row animate-slide-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {participant.profiles?.avatar_url ? (
                    <img
                      src={participant.profiles.avatar_url}
                      alt=""
                      className="w-9 h-9 avatar avatar-ring"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-depth-700 flex items-center justify-center text-xs text-white font-semibold">
                      {getInitials(participant.profiles?.name)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-depth-800">
                    {participant.profiles?.name || 'Participant'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {pendingParticipants.length > 0 && (
            <div className="mt-4 pt-4 border-t border-earth-100">
              <p className="text-label mb-3">En attente · {pendingParticipants.length}</p>
              <div className="flex -space-x-2">
                {pendingParticipants.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    className="w-8 h-8 rounded-full bg-earth-200 ring-2 ring-white flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-depth-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ))}
                {pendingParticipants.length > 6 && (
                  <div className="w-8 h-8 rounded-full bg-depth-100 ring-2 ring-white flex items-center justify-center text-xs font-semibold text-depth-600">
                    +{pendingParticipants.length - 6}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rules */}
      <div className="card p-4 mb-4">
        <h2 className="section-title">Regles</h2>
        <div className="space-y-1">
          {competition.rule_total_count && (
            <div className="rule-item">
              <div className="rule-icon bg-moss-100 text-moss-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <span className="text-sm text-depth-700">Nombre total de prises</span>
            </div>
          )}
          {competition.rule_record_size && (
            <div className="rule-item">
              <div className="rule-icon bg-depth-100 text-depth-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <span className="text-sm text-depth-700">Plus grande prise</span>
            </div>
          )}
          {competition.rule_top_x_biggest && (
            <div className="rule-item">
              <div className="rule-icon bg-earth-100 text-earth-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-sm text-depth-700">Top {competition.rule_top_x_biggest} cumules</span>
            </div>
          )}
          {!competition.rule_total_count && !competition.rule_record_size && !competition.rule_top_x_biggest && (
            <p className="text-sm text-depth-500 py-2">Aucune regle definie</p>
          )}
        </div>
      </div>

      {/* Creator Actions */}
      {isCreator && (
        <div className="space-y-3">
          {competition.status === 'draft' && acceptedParticipants.length >= 2 && (
            <button
              onClick={handleStartCompetition}
              disabled={actionLoading}
              className="btn-success w-full btn-lg"
            >
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <span className="spinner"></span>
                  Demarrage...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Demarrer la competition
                </>
              )}
            </button>
          )}

          {competition.status === 'draft' && acceptedParticipants.length < 2 && (
            <div className="card p-4 text-center">
              <p className="text-sm text-depth-500">
                Minimum 2 participants requis pour demarrer
              </p>
            </div>
          )}

          {competition.status === 'active' && (
            <button
              onClick={handleFinishCompetition}
              disabled={actionLoading}
              className="btn-secondary w-full"
            >
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <span className="spinner"></span>
                  Fermeture...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Terminer la competition
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* FAB for active competition */}
      {competition.status === 'active' && (
        <Link href={`/competitions/${competitionId}/catches`} className="fab">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}
    </div>
  )
}
