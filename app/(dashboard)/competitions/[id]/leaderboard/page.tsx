'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface LeaderboardEntry {
  user_id: string
  user_name: string
  user_avatar: string | null
  total_count: number
  record_size: number | null
  top_5_sum: number | null
  top_5_detail: number[]
}

export default function LeaderboardPage() {
  const router = useRouter()
  const params = useParams()
  const competitionId = params.id as string

  const [competition, setCompetition] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const { data: compData, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single()

      if (compError) throw compError
      setCompetition(compData)

      const { data: catches, error: catchError } = await supabase
        .from('catches')
        .select('*, profiles(name, avatar_url)')
        .eq('competition_id', competitionId)

      if (catchError) throw catchError

      const userScores: { [key: string]: LeaderboardEntry } = {}

      catches?.forEach((c: any) => {
        if (!userScores[c.user_id]) {
          userScores[c.user_id] = {
            user_id: c.user_id,
            user_name: c.profiles?.name || 'Inconnu',
            user_avatar: c.profiles?.avatar_url || null,
            total_count: 0,
            record_size: null,
            top_5_sum: null,
            top_5_detail: [],
          }
        }

        userScores[c.user_id].total_count += c.count

        if (c.size) {
          if (!userScores[c.user_id].record_size || c.size > userScores[c.user_id].record_size!) {
            userScores[c.user_id].record_size = c.size
          }
        }
      })

      for (const userId in userScores) {
        const userCatches = catches?.filter((c: any) => c.user_id === userId && c.size !== null)
        const sizes = userCatches?.map((c: any) => c.size).sort((a: number, b: number) => b - a) || []
        const top5 = sizes.slice(0, 5)
        userScores[userId].top_5_detail = top5
        userScores[userId].top_5_sum = top5.length > 0 ? top5.reduce((sum: number, size: number) => sum + size, 0) : null
      }

      setLeaderboard(Object.values(userScores))
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankedByTotalCount = () => {
    return [...leaderboard]
      .filter(entry => entry.total_count > 0)
      .sort((a, b) => b.total_count - a.total_count)
  }

  const getRankedByRecordSize = () => {
    return [...leaderboard]
      .filter(entry => entry.record_size !== null)
      .sort((a, b) => (b.record_size || 0) - (a.record_size || 0))
  }

  const getRankedByTop5 = () => {
    return [...leaderboard]
      .filter(entry => entry.top_5_sum !== null)
      .sort((a, b) => (b.top_5_sum || 0) - (a.top_5_sum || 0))
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getMedalClass = (index: number) => {
    switch (index) {
      case 0: return 'leaderboard-entry-gold'
      case 1: return 'leaderboard-entry-silver'
      case 2: return 'leaderboard-entry-bronze'
      default: return 'leaderboard-entry-default'
    }
  }

  const getMedal = (index: number) => {
    switch (index) {
      case 0: return { icon: '🥇', class: 'medal-gold' }
      case 1: return { icon: '🥈', class: 'medal-silver' }
      case 2: return { icon: '🥉', class: 'medal-bronze' }
      default: return { icon: `${index + 1}`, class: 'bg-navy-100 text-navy-600' }
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-48 mb-6 rounded-lg"></div>
        <div className="card p-8 mb-8">
          <div className="skeleton h-10 w-2/3 mb-4 rounded-xl"></div>
          <div className="skeleton h-6 w-32 rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6">
              <div className="skeleton h-6 w-48 mb-4 rounded-lg"></div>
              <div className="space-y-3">
                <div className="skeleton h-16 rounded-xl"></div>
                <div className="skeleton h-16 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="page-container">
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

  const rankedByTotal = getRankedByTotalCount()
  const rankedByRecord = getRankedByRecordSize()
  const rankedByTop5 = getRankedByTop5()

  const LeaderboardSection = ({
    title,
    icon,
    color,
    entries,
    valueFormatter,
    detailFormatter
  }: {
    title: string
    icon: string
    color: string
    entries: LeaderboardEntry[]
    valueFormatter: (entry: LeaderboardEntry) => string
    detailFormatter?: (entry: LeaderboardEntry) => string | null
  }) => (
    <div className="card overflow-hidden animate-slide-up">
      <div className={`p-4 ${color}`}>
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          {title}
        </h2>
      </div>
      <div className="p-4">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-navy-500">
            Aucune donnée disponible
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const medal = getMedal(index)
              const detail = detailFormatter ? detailFormatter(entry) : null
              return (
                <div
                  key={entry.user_id}
                  className={`${getMedalClass(index)} leaderboard-entry`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`medal ${medal.class}`}>
                    {medal.icon}
                  </div>
                  {entry.user_avatar ? (
                    <img
                      src={entry.user_avatar}
                      alt={entry.user_name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-water-gradient flex items-center justify-center text-white font-display font-bold">
                      {getInitials(entry.user_name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-navy-900 truncate">
                      {entry.user_name}
                    </div>
                    {detail && (
                      <div className="text-sm text-navy-500 truncate">
                        {detail}
                      </div>
                    )}
                  </div>
                  <div className="font-display text-xl font-bold text-navy-900 whitespace-nowrap">
                    {valueFormatter(entry)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="page-container">
      {/* Back link */}
      <Link href={`/competitions/${competitionId}`} className="back-link">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour à la compétition
      </Link>

      {/* Header */}
      <div className="card water-bg text-white p-8 mb-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl trophy-glow">🏆</span>
            <div>
              <h1 className="font-display text-3xl font-bold">Classement</h1>
              <p className="text-water-100">{competition.name}</p>
            </div>
          </div>
          <p className="text-water-200 text-sm mt-4">
            Mis à jour en temps réel
          </p>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="space-y-6">
        {competition.rule_total_count && (
          <LeaderboardSection
            title="Nombre total de poissons"
            icon="🐟"
            color="bg-forest-gradient"
            entries={rankedByTotal}
            valueFormatter={(e) => `${e.total_count} poisson${e.total_count > 1 ? 's' : ''}`}
          />
        )}

        {competition.rule_record_size && (
          <LeaderboardSection
            title="Poisson record"
            icon="📏"
            color="bg-water-gradient"
            entries={rankedByRecord}
            valueFormatter={(e) => `${e.record_size} cm`}
          />
        )}

        {competition.rule_top_x_biggest && (
          <LeaderboardSection
            title={`Top ${competition.rule_top_x_biggest} plus gros poissons`}
            icon="🏆"
            color="bg-trophy-gradient"
            entries={rankedByTop5}
            valueFormatter={(e) => `${e.top_5_sum?.toFixed(1)} cm`}
            detailFormatter={(e) =>
              e.top_5_detail.length > 0
                ? e.top_5_detail.map(s => `${s}cm`).join(' + ')
                : null
            }
          />
        )}
      </div>

      {/* Empty state if no categories */}
      {!competition.rule_total_count && !competition.rule_record_size && !competition.rule_top_x_biggest && (
        <div className="card p-12">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">
              Aucune catégorie de classement
            </h3>
            <p className="empty-state-text">
              Cette compétition n'a pas de règles de classement définies.
            </p>
          </div>
        </div>
      )}

      {/* Quick action */}
      <div className="mt-8 flex justify-center">
        <Link
          href={`/competitions/${competitionId}/catches`}
          className="btn-success flex items-center gap-2"
        >
          <span className="text-lg">🎣</span>
          Enregistrer une capture
        </Link>
      </div>
    </div>
  )
}
