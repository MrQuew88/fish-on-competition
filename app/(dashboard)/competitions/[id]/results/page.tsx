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
    <div className="flex items-end justify-center gap-4 py-8 px-4">
      {/* Second place */}
      {second && (
        <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {second.user_avatar ? (
            <img
              src={second.user_avatar}
              alt=""
              className="w-14 h-14 mx-auto rounded-xl object-cover ring-2 ring-slate-300 mb-2"
            />
          ) : (
            <div className="w-14 h-14 mx-auto rounded-xl bg-slate-200 flex items-center justify-center text-lg font-semibold text-slate-600 mb-2">
              {getInitials(second.user_name)}
            </div>
          )}
          <div className="w-20 podium-second h-20 flex flex-col items-center justify-end pb-3">
            <div className="rank-badge rank-2 mb-1">2</div>
            <span className="text-xs font-semibold text-slate-700 truncate w-full px-1">
              {second.user_name.split(' ')[0]}
            </span>
            <span className="text-[10px] text-slate-500">{valueFormatter(second)}</span>
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
                alt=""
                className="w-16 h-16 mx-auto rounded-xl object-cover ring-2 ring-amber-400 mb-2"
              />
            ) : (
              <div className="w-16 h-16 mx-auto rounded-xl bg-amber-100 flex items-center justify-center text-xl font-semibold text-amber-700 mb-2">
                {getInitials(first.user_name)}
              </div>
            )}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-amber-800" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div className="w-24 podium-first h-24 flex flex-col items-center justify-end pb-3">
            <div className="rank-badge rank-1 mb-1">1</div>
            <span className="text-sm font-semibold text-amber-800 truncate w-full px-1">
              {first.user_name.split(' ')[0]}
            </span>
            <span className="text-xs text-amber-700 font-medium">{valueFormatter(first)}</span>
          </div>
        </div>
      )}

      {/* Third place */}
      {third && (
        <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {third.user_avatar ? (
            <img
              src={third.user_avatar}
              alt=""
              className="w-12 h-12 mx-auto rounded-xl object-cover ring-2 ring-orange-300 mb-2"
            />
          ) : (
            <div className="w-12 h-12 mx-auto rounded-xl bg-orange-100 flex items-center justify-center text-base font-semibold text-orange-700 mb-2">
              {getInitials(third.user_name)}
            </div>
          )}
          <div className="w-18 podium-third h-16 flex flex-col items-center justify-end pb-3">
            <div className="rank-badge rank-3 mb-1">3</div>
            <span className="text-[10px] font-semibold text-orange-800 truncate w-full px-1">
              {third.user_name.split(' ')[0]}
            </span>
            <span className="text-[9px] text-orange-600">{valueFormatter(third)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="page-container-narrow">
        <div className="skeleton h-5 w-32 mb-6"></div>
        <div className="skeleton h-48 rounded-xl mb-6"></div>
        <div className="skeleton h-64 rounded-xl mb-5"></div>
        <div className="skeleton h-64 rounded-xl"></div>
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

  return (
    <div className="page-container-narrow">
      {/* Back link */}
      <Link href={`/competitions/${competitionId}`} className="back-btn">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Hero Header */}
      <div className="card bg-amber-50 border-amber-200 p-6 mb-6 text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-amber-100 rounded-xl flex items-center justify-center">
          <svg className="w-7 h-7 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-1.17a3 3 0 01-5.66 0H8.83a3 3 0 01-5.66 0H2a2 2 0 110-4h1.17A3 3 0 015 5z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          Final Results
        </h1>
        <p className="text-slate-600 text-sm">{competition.name}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500 text-xs mt-4">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(competition.start_date)}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {competition.location}
          </span>
        </div>
      </div>

      {/* Results Sections */}
      <div className="space-y-4">
        {/* Total Fish Count */}
        {competition.rule_total_count && rankedByTotal.length > 0 && (
          <div className="card overflow-hidden animate-slide-up">
            <div className="flex items-center gap-3 p-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-900">Total catch count</h2>
            </div>
            <PodiumDisplay
              entries={rankedByTotal}
              valueFormatter={(e) => `${e.total_count}`}
            />
          </div>
        )}

        {/* Record Size */}
        {competition.rule_record_size && rankedByRecord.length > 0 && (
          <div className="card overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 p-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-900">Biggest catch</h2>
            </div>
            <PodiumDisplay
              entries={rankedByRecord}
              valueFormatter={(e) => `${e.record_size} cm`}
            />
          </div>
        )}

        {/* Top N */}
        {competition.rule_top_x_biggest && rankedByTopN.length > 0 && (
          <div className="card overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 p-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-900">Top {competition.rule_top_x_biggest} combined</h2>
            </div>
            <PodiumDisplay
              entries={rankedByTopN}
              valueFormatter={(e) => `${e.top_5_sum?.toFixed(0)} cm`}
            />
          </div>
        )}
      </div>

      {/* Prize Section */}
      {competition.prize && (
        <div className="prize-banner mt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Prize</p>
            <p className="text-sm font-semibold text-slate-900">{competition.prize}</p>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="mt-8 flex justify-center">
        <Link
          href={`/competitions/${competitionId}/captures`}
          className="btn-secondary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          View gallery
        </Link>
      </div>
    </div>
  )
}
