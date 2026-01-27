'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
        const topN = compData.rule_top_x_biggest || 5
        const topSizes = sizes.slice(0, topN)
        userScores[userId].top_5_detail = topSizes
        userScores[userId].top_5_sum = topSizes.length > 0 ? topSizes.reduce((sum: number, size: number) => sum + size, 0) : null
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

  const getRankedByTopN = () => {
    return [...leaderboard]
      .filter(entry => entry.top_5_sum !== null)
      .sort((a, b) => (b.top_5_sum || 0) - (a.top_5_sum || 0))
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRankStyle = (index: number) => {
    if (index === 0) return 'rank-1'
    if (index === 1) return 'rank-2'
    if (index === 2) return 'rank-3'
    return 'rank-default'
  }

  const getEntryStyle = (index: number) => {
    if (index === 0) return 'leaderboard-entry-gold'
    if (index === 1) return 'leaderboard-entry-silver'
    if (index === 2) return 'leaderboard-entry-bronze'
    return 'leaderboard-entry-default'
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-5 w-32 mb-6"></div>
        <div className="skeleton h-40 rounded-3xl mb-5"></div>
        <div className="skeleton h-64 rounded-3xl mb-5"></div>
        <div className="skeleton h-64 rounded-3xl"></div>
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

  const rankedByTotal = getRankedByTotalCount()
  const rankedByRecord = getRankedByRecordSize()
  const rankedByTopN = getRankedByTopN()

  const LeaderboardSection = ({
    title,
    icon,
    iconBg,
    entries,
    valueFormatter,
    detailFormatter
  }: {
    title: string
    icon: React.ReactNode
    iconBg: string
    entries: LeaderboardEntry[]
    valueFormatter: (entry: LeaderboardEntry) => string
    detailFormatter?: (entry: LeaderboardEntry) => string | null
  }) => (
    <div className="card mb-5 overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-navy-100">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <h2 className="font-display text-lg font-bold text-navy-900">{title}</h2>
      </div>

      <div className="p-4">
        {entries.length === 0 ? (
          <p className="text-sm text-navy-500 text-center py-8">Aucune donnée</p>
        ) : (
          <div className="space-y-3">
            {entries.slice(0, 10).map((entry, index) => {
              const detail = detailFormatter ? detailFormatter(entry) : null
              return (
                <div
                  key={entry.user_id}
                  className={`leaderboard-entry ${getEntryStyle(index)} animate-slide-up`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`rank ${getRankStyle(index)}`}>
                    {index + 1}
                  </div>

                  {entry.user_avatar ? (
                    <img
                      src={entry.user_avatar}
                      alt=""
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-soft"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-gradient-water flex items-center justify-center text-sm text-white font-bold">
                      {getInitials(entry.user_name)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 truncate">{entry.user_name}</p>
                    {detail && (
                      <p className="text-xs text-navy-500 truncate">{detail}</p>
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
      {/* Back button */}
      <Link href={`/competitions/${competitionId}`} className="back-btn">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </Link>

      {/* Hero Header */}
      <div className="card-navy p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="status-dot status-dot-live"></span>
            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">En direct</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Classement</h1>
          <p className="text-white/60 text-sm mt-1">{competition.name}</p>
        </div>
      </div>

      {/* Leaderboards */}
      {competition.rule_total_count && (
        <LeaderboardSection
          title="Nombre total de prises"
          icon={
            <svg className="w-6 h-6 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          }
          iconBg="bg-forest-100"
          entries={rankedByTotal}
          valueFormatter={(e) => `${e.total_count}`}
        />
      )}

      {competition.rule_record_size && (
        <LeaderboardSection
          title="Plus grande prise"
          icon={
            <svg className="w-6 h-6 text-water-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          }
          iconBg="bg-water-100"
          entries={rankedByRecord}
          valueFormatter={(e) => `${e.record_size} cm`}
        />
      )}

      {competition.rule_top_x_biggest && (
        <LeaderboardSection
          title={`Top ${competition.rule_top_x_biggest} cumulés`}
          icon={
            <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          iconBg="bg-gold-100"
          entries={rankedByTopN}
          valueFormatter={(e) => `${e.top_5_sum?.toFixed(0)} cm`}
          detailFormatter={(e) =>
            e.top_5_detail.length > 0
              ? `${e.top_5_detail.length}/${competition.rule_top_x_biggest} prises`
              : null
          }
        />
      )}

      {!competition.rule_total_count && !competition.rule_record_size && !competition.rule_top_x_biggest && (
        <div className="card p-8">
          <div className="empty-state">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="empty-state-title">Aucune règle définie</h3>
            <p className="empty-state-text">Cette compétition n'a pas de critères de classement</p>
          </div>
        </div>
      )}

      {/* Quick action */}
      {competition.status === 'active' && (
        <div className="mt-8 flex justify-center">
          <Link
            href={`/competitions/${competitionId}/catches`}
            className="btn-success"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            Enregistrer une capture
          </Link>
        </div>
      )}
    </div>
  )
}
