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
            user_name: c.profiles?.name || 'Unknown',
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
      console.error('Error:', error)
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
    if (index === 0) return 'bg-amber-50/50 border border-amber-200/50'
    if (index === 1) return 'bg-slate-50 border border-slate-200/50'
    if (index === 2) return 'bg-orange-50/50 border border-orange-200/50'
    return 'bg-slate-50 border border-slate-100'
  }

  if (loading) {
    return (
      <div className="page-container-narrow">
        <div className="skeleton h-5 w-28 mb-6"></div>
        <div className="skeleton h-32 rounded-xl mb-4"></div>
        <div className="skeleton h-48 rounded-xl mb-4"></div>
        <div className="skeleton h-48 rounded-xl"></div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="page-container-narrow">
        <div className="card p-8">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="empty-state-title">Competition not found</h3>
            <Link href="/competitions" className="btn-primary mt-4">
              Go back
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
    <div className="card mb-4 overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-slate-100">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="p-3">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No data yet</p>
        ) : (
          <div className="space-y-2">
            {entries.slice(0, 10).map((entry, index) => {
              const detail = detailFormatter ? detailFormatter(entry) : null
              return (
                <div
                  key={entry.user_id}
                  className={`leaderboard-entry ${getEntryStyle(index)}`}
                >
                  <div className={`rank-badge ${getRankStyle(index)}`}>
                    {index + 1}
                  </div>

                  {entry.user_avatar ? (
                    <img
                      src={entry.user_avatar}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-teal-700 flex items-center justify-center text-sm text-white font-medium">
                      {getInitials(entry.user_name)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{entry.user_name}</p>
                    {detail && (
                      <p className="text-xs text-slate-500 truncate">{detail}</p>
                    )}
                  </div>

                  <div className="text-lg font-semibold text-slate-900 whitespace-nowrap">
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
    <div className="page-container-narrow">
      {/* Back button */}
      <Link href={`/competitions/${competitionId}`} className="back-btn">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Header */}
      <div className="card bg-slate-700 p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="status-dot status-dot-live"></span>
          <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Live</span>
        </div>
        <h1 className="text-xl font-semibold text-white">Leaderboard</h1>
        <p className="text-white/60 text-sm mt-1">{competition.name}</p>
      </div>

      {/* Leaderboards */}
      {competition.rule_total_count && (
        <LeaderboardSection
          title="Total catch count"
          icon={
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          }
          iconBg="bg-emerald-500/10"
          entries={rankedByTotal}
          valueFormatter={(e) => `${e.total_count}`}
        />
      )}

      {competition.rule_record_size && (
        <LeaderboardSection
          title="Biggest catch"
          icon={
            <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          }
          iconBg="bg-teal-500/10"
          entries={rankedByRecord}
          valueFormatter={(e) => `${e.record_size} cm`}
        />
      )}

      {competition.rule_top_x_biggest && (
        <LeaderboardSection
          title={`Top ${competition.rule_top_x_biggest} combined`}
          icon={
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          iconBg="bg-amber-500/10"
          entries={rankedByTopN}
          valueFormatter={(e) => `${e.top_5_sum?.toFixed(0)} cm`}
          detailFormatter={(e) =>
            e.top_5_detail.length > 0
              ? `${e.top_5_detail.length}/${competition.rule_top_x_biggest} catches`
              : null
          }
        />
      )}

      {!competition.rule_total_count && !competition.rule_record_size && !competition.rule_top_x_biggest && (
        <div className="card p-8">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="empty-state-title">No rules defined</h3>
            <p className="empty-state-text">This competition has no ranking criteria</p>
          </div>
        </div>
      )}

      {/* Quick action */}
      {competition.status === 'active' && (
        <div className="mt-6 flex justify-center">
          <Link
            href={`/competitions/${competitionId}/catches`}
            className="btn-success"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            Log a catch
          </Link>
        </div>
      )}
    </div>
  )
}
