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

type RuleType = 'total' | 'record' | 'topN'

export default function LeaderboardPage() {
  const params = useParams()
  const competitionId = params.id as string

  const [competition, setCompetition] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [activeRule, setActiveRule] = useState<RuleType>('total')

  // Grain texture for premium background
  const grainTexture = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E\")"

  // Entrance animation
  const entranceAnimation = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.5; }
    }
  `

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }

      const { data: compData, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single()

      if (compError) throw compError
      setCompetition(compData)

      // Set initial active rule based on what's enabled
      if (compData.rule_total_count) setActiveRule('total')
      else if (compData.rule_record_size) setActiveRule('record')
      else if (compData.rule_top_x_biggest) setActiveRule('topN')

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

  const getCurrentRanking = () => {
    switch (activeRule) {
      case 'total': return getRankedByTotalCount()
      case 'record': return getRankedByRecordSize()
      case 'topN': return getRankedByTopN()
      default: return []
    }
  }

  const getValueForRule = (entry: LeaderboardEntry): string => {
    switch (activeRule) {
      case 'total': return `${entry.total_count}`
      case 'record': return `${entry.record_size} cm`
      case 'topN': return `${entry.top_5_sum?.toFixed(0)} cm`
      default: return ''
    }
  }

  const getUnitLabel = (): string => {
    switch (activeRule) {
      case 'total': return 'prises'
      case 'record': return 'cm'
      case 'topN': return 'cm total'
      default: return ''
    }
  }

  // Get available rules
  const availableRules: { type: RuleType; label: string; icon: JSX.Element }[] = []
  if (competition?.rule_total_count) {
    availableRules.push({
      type: 'total',
      label: 'Nombre total',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      )
    })
  }
  if (competition?.rule_record_size) {
    availableRules.push({
      type: 'record',
      label: 'Plus grosse prise',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      )
    })
  }
  if (competition?.rule_top_x_biggest) {
    availableRules.push({
      type: 'topN',
      label: `Top ${competition.rule_top_x_biggest} combiné`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    })
  }

  if (loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: entranceAnimation }} />
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-bg via-primary-light to-surface-bg" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: grainTexture }} />
        </div>
        <div className="min-h-screen px-4 py-6">
          <div className="max-w-3xl mx-auto">
            <div className="h-8 w-32 bg-surface-muted rounded-lg mb-6 animate-pulse" />
            <div className="h-24 bg-white/80 rounded-2xl mb-6 animate-pulse" />
            <div className="h-12 bg-white/80 rounded-xl mb-6 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="h-48 bg-white/80 rounded-2xl animate-pulse" />
              <div className="h-56 bg-white/80 rounded-2xl animate-pulse" />
              <div className="h-48 bg-white/80 rounded-2xl animate-pulse" />
            </div>
            <div className="h-64 bg-white/80 rounded-2xl animate-pulse" />
          </div>
        </div>
      </>
    )
  }

  if (!competition) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: entranceAnimation }} />
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-bg via-primary-light to-surface-bg" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: grainTexture }} />
        </div>
        <div className="min-h-screen px-4 py-6 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-surface-border/80 shadow-lg p-8 text-center max-w-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-bg flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Compétition introuvable</h3>
            <Link
              href="/competitions"
              className="inline-flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-water-deep via-merged-teal-gold to-water-mid text-white rounded-xl font-semibold shadow-lg shadow-primary/25"
            >
              Retour
            </Link>
          </div>
        </div>
      </>
    )
  }

  const ranking = getCurrentRanking()
  const top3 = ranking.slice(0, 3)
  const rest = ranking.slice(3)

  // Medal component
  const Medal = ({ rank }: { rank: number }) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-medal-silver to-medal-silver flex items-center justify-center shadow-lg shadow-medal-silver/20">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )
    }
    return null
  }

  // Podium card styles
  const getPodiumCardStyle = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border-2 border-amber-300/60 shadow-xl shadow-amber-500/10'
    }
    if (rank === 2) {
      return 'bg-gradient-to-br from-medal-silver-bg to-medal-silver-bg border-2 border-medal-silver/50 shadow-lg'
    }
    if (rank === 3) {
      return 'bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300/60 shadow-lg shadow-orange-500/10'
    }
    return ''
  }

  const getAvatarRingStyle = (rank: number) => {
    if (rank === 1) return 'ring-4 ring-amber-400 shadow-lg shadow-amber-500/30'
    if (rank === 2) return 'ring-4 ring-medal-silver shadow-lg shadow-medal-silver/20'
    if (rank === 3) return 'ring-4 ring-orange-400 shadow-lg shadow-orange-500/20'
    return 'ring-2 ring-slate-200'
  }

  const getTextColorStyle = (rank: number) => {
    if (rank === 1) return 'text-amber-900'
    if (rank === 2) return 'text-text-secondary'
    if (rank === 3) return 'text-orange-900'
    return 'text-text-primary'
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: entranceAnimation }} />

      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-bg via-primary-light to-surface-bg" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: grainTexture }}
        />
      </div>

      <div className="min-h-screen px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <Link
            href={`/competitions/${competitionId}`}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-6 group transition-colors duration-200"
            style={{ animation: 'slideInUp 0.4s ease-out forwards' }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border border-surface-border/80 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all duration-200">
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-sm font-medium">Retour</span>
          </Link>

          {/* Header */}
          <div
            className="mb-6"
            style={{ animation: 'slideInUp 0.4s ease-out 0.1s forwards', opacity: 0 }}
          >
            <p className="text-sm text-text-secondary mb-1">{competition.name}</p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
                Classement
              </h1>
              {competition.status === 'active' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-status-active/20 text-status-active border border-status-active/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-active opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-status-active"></span>
                  </span>
                  En direct
                </span>
              )}
            </div>
          </div>

          {/* Rule Tabs */}
          {availableRules.length > 1 && (
            <div
              className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide"
              style={{ animation: 'slideInUp 0.4s ease-out 0.15s forwards', opacity: 0 }}
            >
              {availableRules.map((rule) => (
                <button
                  key={rule.type}
                  onClick={() => setActiveRule(rule.type)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeRule === rule.type
                      ? 'text-white bg-gradient-to-r from-water-deep via-merged-teal-gold to-water-mid shadow-md shadow-primary/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/80 bg-white/50'
                  }`}
                >
                  {rule.icon}
                  {rule.label}
                </button>
              ))}
            </div>
          )}

          {ranking.length === 0 ? (
            // Empty State
            <div
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-surface-border/80 shadow-lg p-12 text-center"
              style={{ animation: 'slideInUp 0.4s ease-out 0.2s forwards', opacity: 0 }}
            >
              <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary-light to-primary-600/10 flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Aucune capture</h3>
              <p className="text-text-secondary mb-6">Soyez le premier à enregistrer une prise !</p>
              {competition.status === 'active' && (
                <Link
                  href={`/competitions/${competitionId}/catches`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-status-active to-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-status-active/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Enregistrer une capture
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Podium Section - Top 3 */}
              {top3.length > 0 && (
                <div
                  className="mb-6"
                  style={{ animation: 'slideInUp 0.4s ease-out 0.2s forwards', opacity: 0 }}
                >
                  {/* Mobile: Vertical Cards */}
                  <div className="md:hidden space-y-3">
                    {top3.map((entry, index) => {
                      const rank = index + 1
                      const isCurrentUser = entry.user_id === currentUserId
                      return (
                        <div
                          key={entry.user_id}
                          className={`relative rounded-2xl p-5 ${getPodiumCardStyle(rank)} ${
                            isCurrentUser ? 'ring-2 ring-primary ring-offset-2' : ''
                          }`}
                        >
                          {/* Glow effect for 1st place */}
                          {rank === 1 && (
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-2xl blur-lg opacity-20 -z-10" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} />
                          )}

                          <div className="flex items-center gap-4">
                            <div className="relative">
                              {entry.user_avatar ? (
                                <img
                                  src={entry.user_avatar}
                                  alt=""
                                  className={`w-16 h-16 rounded-full object-cover ${getAvatarRingStyle(rank)}`}
                                />
                              ) : (
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid flex items-center justify-center text-xl text-white font-bold ${getAvatarRingStyle(rank)}`}>
                                  {getInitials(entry.user_name)}
                                </div>
                              )}
                              <div className="absolute -top-1 -right-1">
                                <Medal rank={rank} />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className={`text-lg font-bold truncate ${getTextColorStyle(rank)}`}>
                                  {entry.user_name}
                                </h3>
                                {isCurrentUser && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-white">
                                    Vous
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-text-secondary">{entry.total_count} prises</p>
                            </div>

                            <div className="text-right">
                              <div className={`text-3xl font-bold tabular-nums ${getTextColorStyle(rank)}`}>
                                {getValueForRule(entry).split(' ')[0]}
                              </div>
                              <div className="text-sm text-text-muted">{getUnitLabel()}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Desktop: Podium Layout */}
                  <div className="hidden md:grid grid-cols-3 gap-4 items-end">
                    {/* 2nd Place */}
                    {top3[1] ? (
                      <div
                        className={`relative rounded-2xl p-6 ${getPodiumCardStyle(2)} ${
                          top3[1].user_id === currentUserId ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-3">
                            {top3[1].user_avatar ? (
                              <img
                                src={top3[1].user_avatar}
                                alt=""
                                className={`w-16 h-16 rounded-full object-cover ${getAvatarRingStyle(2)}`}
                              />
                            ) : (
                              <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid flex items-center justify-center text-xl text-white font-bold ${getAvatarRingStyle(2)}`}>
                                {getInitials(top3[1].user_name)}
                              </div>
                            )}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                              <Medal rank={2} />
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <h3 className={`font-bold truncate max-w-[120px] ${getTextColorStyle(2)}`}>
                              {top3[1].user_name}
                            </h3>
                            {top3[1].user_id === currentUserId && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-white">
                                Vous
                              </span>
                            )}
                          </div>
                          <div className={`text-3xl font-bold tabular-nums mt-2 ${getTextColorStyle(2)}`}>
                            {getValueForRule(top3[1]).split(' ')[0]}
                          </div>
                          <div className="text-sm text-text-muted">{getUnitLabel()}</div>
                        </div>
                      </div>
                    ) : <div />}

                    {/* 1st Place - Elevated */}
                    {top3[0] && (
                      <div
                        className={`relative rounded-2xl p-6 -mt-4 ${getPodiumCardStyle(1)} ${
                          top3[0].user_id === currentUserId ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                      >
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-2xl blur-lg opacity-20 -z-10" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} />

                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-3">
                            {top3[0].user_avatar ? (
                              <img
                                src={top3[0].user_avatar}
                                alt=""
                                className={`w-20 h-20 rounded-full object-cover ${getAvatarRingStyle(1)}`}
                              />
                            ) : (
                              <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid flex items-center justify-center text-2xl text-white font-bold ${getAvatarRingStyle(1)}`}>
                                {getInitials(top3[0].user_name)}
                              </div>
                            )}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                              <Medal rank={1} />
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <h3 className={`text-xl font-bold truncate max-w-[140px] ${getTextColorStyle(1)}`}>
                              {top3[0].user_name}
                            </h3>
                            {top3[0].user_id === currentUserId && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-white">
                                Vous
                              </span>
                            )}
                          </div>
                          <div className={`text-4xl font-bold tabular-nums mt-2 ${getTextColorStyle(1)}`}>
                            {getValueForRule(top3[0]).split(' ')[0]}
                          </div>
                          <div className="text-sm text-text-muted">{getUnitLabel()}</div>
                        </div>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {top3[2] ? (
                      <div
                        className={`relative rounded-2xl p-6 ${getPodiumCardStyle(3)} ${
                          top3[2].user_id === currentUserId ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-3">
                            {top3[2].user_avatar ? (
                              <img
                                src={top3[2].user_avatar}
                                alt=""
                                className={`w-16 h-16 rounded-full object-cover ${getAvatarRingStyle(3)}`}
                              />
                            ) : (
                              <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid flex items-center justify-center text-xl text-white font-bold ${getAvatarRingStyle(3)}`}>
                                {getInitials(top3[2].user_name)}
                              </div>
                            )}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                              <Medal rank={3} />
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <h3 className={`font-bold truncate max-w-[120px] ${getTextColorStyle(3)}`}>
                              {top3[2].user_name}
                            </h3>
                            {top3[2].user_id === currentUserId && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-white">
                                Vous
                              </span>
                            )}
                          </div>
                          <div className={`text-3xl font-bold tabular-nums mt-2 ${getTextColorStyle(3)}`}>
                            {getValueForRule(top3[2]).split(' ')[0]}
                          </div>
                          <div className="text-sm text-text-muted">{getUnitLabel()}</div>
                        </div>
                      </div>
                    ) : <div />}
                  </div>
                </div>
              )}

              {/* Rest of Rankings (4th place and below) */}
              {rest.length > 0 && (
                <div
                  className="bg-white/90 backdrop-blur-sm rounded-2xl border border-surface-border/80 shadow-lg shadow-slate-900/5 overflow-hidden"
                  style={{ animation: 'slideInUp 0.4s ease-out 0.3s forwards', opacity: 0 }}
                >
                  <div className="p-5 border-b border-surface-border/50">
                    <h2 className="font-semibold text-text-primary">Autres participants</h2>
                  </div>

                  <div className="p-4 space-y-2">
                    {rest.map((entry, index) => {
                      const rank = index + 4
                      const isCurrentUser = entry.user_id === currentUserId
                      return (
                        <div
                          key={entry.user_id}
                          className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                            isCurrentUser
                              ? 'bg-primary-light/50 border-2 border-primary/30'
                              : 'hover:bg-surface-bg border border-transparent'
                          }`}
                        >
                          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-bg text-text-secondary font-semibold text-lg tabular-nums">
                            {rank}
                          </div>

                          {entry.user_avatar ? (
                            <img
                              src={entry.user_avatar}
                              alt=""
                              className="w-12 h-12 rounded-full ring-2 ring-slate-200 group-hover:ring-primary/50 transition-all duration-200 object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full ring-2 ring-slate-200 group-hover:ring-primary/50 transition-all duration-200 bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid flex items-center justify-center text-white font-semibold">
                              {getInitials(entry.user_name)}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-text-primary truncate">{entry.user_name}</p>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-white">
                                  Vous
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-text-muted">{entry.total_count} prises</p>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold tabular-nums text-text-primary">
                              {getValueForRule(entry).split(' ')[0]}
                            </div>
                            <div className="text-xs text-text-muted">{getUnitLabel()}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quick Action */}
              {competition.status === 'active' && (
                <div
                  className="mt-6 flex justify-center"
                  style={{ animation: 'slideInUp 0.4s ease-out 0.4s forwards', opacity: 0 }}
                >
                  <Link
                    href={`/competitions/${competitionId}/catches`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-status-active to-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-status-active/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Enregistrer une capture
                  </Link>
                </div>
              )}
            </>
          )}

          {/* No Rules Defined */}
          {availableRules.length === 0 && (
            <div
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-surface-border/80 shadow-lg p-12 text-center"
              style={{ animation: 'slideInUp 0.4s ease-out 0.2s forwards', opacity: 0 }}
            >
              <div className="h-20 w-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Aucune règle définie</h3>
              <p className="text-text-secondary">Cette compétition n'a pas de critères de classement</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
