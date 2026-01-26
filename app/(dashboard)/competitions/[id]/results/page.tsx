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

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function PodiumDisplay({
  entries,
  valueFormatter
}: {
  entries: LeaderboardEntry[]
  valueFormatter: (entry: LeaderboardEntry) => string
}) {
  if (entries.length === 0) return null

  const podium = entries.slice(0, 3)
  const [first, second, third] = [podium[0], podium[1], podium[2]]

  return (
    <div className="flex items-end justify-center gap-4 mb-8 pt-8">
      {/* Second place */}
      {second && (
        <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {second.user_avatar ? (
            <img
              src={second.user_avatar}
              alt={second.user_name}
              className="w-16 h-16 mx-auto rounded-2xl object-cover border-4 border-navy-300 mb-2"
            />
          ) : (
            <div className="w-16 h-16 mx-auto rounded-2xl bg-navy-200 flex items-center justify-center text-xl font-display font-bold text-navy-600 mb-2">
              {getInitials(second.user_name)}
            </div>
          )}
          <div className="w-20 h-24 bg-gradient-to-t from-navy-300 to-navy-200 rounded-t-lg flex flex-col items-center justify-end pb-2">
            <span className="text-2xl mb-1">🥈</span>
            <span className="text-sm font-display font-bold text-navy-700 truncate w-full px-1">
              {second.user_name.split(' ')[0]}
            </span>
            <span className="text-xs text-navy-600">{valueFormatter(second)}</span>
          </div>
        </div>
      )}

      {/* First place */}
      {first && (
        <div className="text-center animate-slide-up">
          <div className="relative">
            {first.user_avatar ? (
              <img
                src={first.user_avatar}
                alt={first.user_name}
                className="w-20 h-20 mx-auto rounded-2xl object-cover border-4 border-amber-400 mb-2 shadow-glow-amber"
              />
            ) : (
              <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-2xl font-display font-bold text-amber-700 mb-2 shadow-glow-amber">
                {getInitials(first.user_name)}
              </div>
            )}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-float">👑</div>
          </div>
          <div className="w-24 h-32 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-lg flex flex-col items-center justify-end pb-2">
            <span className="text-3xl mb-1">🥇</span>
            <span className="text-sm font-display font-bold text-amber-900 truncate w-full px-1">
              {first.user_name.split(' ')[0]}
            </span>
            <span className="text-xs text-amber-800 font-bold">{valueFormatter(first)}</span>
          </div>
        </div>
      )}

      {/* Third place */}
      {third && (
        <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {third.user_avatar ? (
            <img
              src={third.user_avatar}
              alt={third.user_name}
              className="w-14 h-14 mx-auto rounded-2xl object-cover border-4 border-orange-300 mb-2"
            />
          ) : (
            <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center text-lg font-display font-bold text-orange-600 mb-2">
              {getInitials(third.user_name)}
            </div>
          )}
          <div className="w-18 h-20 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg flex flex-col items-center justify-end pb-2">
            <span className="text-xl mb-1">🥉</span>
            <span className="text-xs font-display font-bold text-orange-900 truncate w-full px-1">
              {third.user_name.split(' ')[0]}
            </span>
            <span className="text-[10px] text-orange-800">{valueFormatter(third)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const competitionId = params.id as string

  const [competition, setCompetition] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async () => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-48 mb-6 rounded-lg"></div>
        <div className="skeleton h-48 w-full mb-8 rounded-2xl"></div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6">
              <div className="skeleton h-8 w-48 mb-4 rounded-lg"></div>
              <div className="space-y-3">
                <div className="skeleton h-20 rounded-xl"></div>
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

  return (
    <div className="page-container">
      {/* Back link */}
      <Link href={`/competitions/${competitionId}`} className="back-link">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour à la compétition
      </Link>

      {/* Hero Header */}
      <div className="card overflow-hidden mb-8">
        <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 text-6xl">+</div>
            <div className="absolute bottom-4 right-4 text-6xl">+</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl">+</div>
          </div>
          <div className="relative">
            <div className="text-6xl mb-4 animate-bounce-in trophy-glow inline-block">🏆</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
              Résultats Finaux
            </h1>
            <h2 className="font-display text-xl text-amber-100 mb-4">{competition.name}</h2>
            <div className="flex flex-wrap items-center justify-center gap-4 text-amber-100 text-sm">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(competition.start_date)} — {formatDate(competition.end_date)}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {competition.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Sections */}
      <div className="space-y-8">
        {/* Total Fish Count */}
        {competition.rule_total_count && rankedByTotal.length > 0 && (
          <div className="card overflow-hidden animate-slide-up">
            <div className="bg-forest-gradient p-4">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">🐟</span>
                Nombre total de poissons
              </h2>
            </div>
            <div className="p-6">
              <PodiumDisplay
                entries={rankedByTotal}
                valueFormatter={(e) => `${e.total_count} poisson${e.total_count > 1 ? 's' : ''}`}
              />
            </div>
          </div>
        )}

        {/* Record Size */}
        {competition.rule_record_size && rankedByRecord.length > 0 && (
          <div className="card overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-water-gradient p-4">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">📏</span>
                Poisson record
              </h2>
            </div>
            <div className="p-6">
              <PodiumDisplay
                entries={rankedByRecord}
                valueFormatter={(e) => `${e.record_size} cm`}
              />
            </div>
          </div>
        )}

        {/* Top 5 */}
        {competition.rule_top_x_biggest && rankedByTop5.length > 0 && (
          <div className="card overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-trophy-gradient p-4">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                Top {competition.rule_top_x_biggest} plus gros poissons
              </h2>
            </div>
            <div className="p-6">
              <PodiumDisplay
                entries={rankedByTop5}
                valueFormatter={(e) => `${e.top_5_sum?.toFixed(1)} cm`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Prize Section */}
      {competition.prize && (
        <div className="card p-6 mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎁</div>
            <div>
              <h3 className="font-display text-xl font-bold text-amber-900 mb-2">
                Récompense
              </h3>
              <p className="text-amber-800 text-lg">{competition.prize}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="mt-8 text-center">
        <Link
          href={`/competitions/${competitionId}/captures`}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <span>📸</span>
          Voir toutes les captures
        </Link>
      </div>
    </div>
  )
}
