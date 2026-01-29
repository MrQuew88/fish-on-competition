'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Competition, Participant, Catch } from '@/types'
import Link from 'next/link'

interface LeaderboardEntry {
  id: string
  user_id: string
  name: string
  avatar_url: string | null
  catches_count: number
  total_size: number
  biggest_catch: number
  top5_total: number
  all_sizes: number[]
}

export default function CompetitionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const competitionId = params.id as string

  const [competition, setCompetition] = useState<Competition | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [catches, setCatches] = useState<Catch[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreator, setIsCreator] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [isParticipantsExpanded, setIsParticipantsExpanded] = useState(true)
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'total' | 'biggest' | 'top5'>('total')

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

      // Load catches with user info
      const { data: catchesData, error: catchesError } = await supabase
        .from('catches')
        .select('*, profiles:user_id(name, avatar_url)')
        .eq('competition_id', competitionId)
        .order('recorded_at', { ascending: false })

      if (catchesError) throw catchesError
      setCatches(catchesData || [])

      // Compute leaderboard
      const leaderboardMap = new Map<string, LeaderboardEntry>()
      for (const c of (catchesData || [])) {
        const existing = leaderboardMap.get(c.user_id)
        if (existing) {
          existing.catches_count += c.count
          existing.total_size += (c.size || 0) * c.count
          existing.biggest_catch = Math.max(existing.biggest_catch, c.size || 0)
          if (c.size) {
            existing.all_sizes.push(c.size)
          }
        } else {
          leaderboardMap.set(c.user_id, {
            id: c.user_id,
            user_id: c.user_id,
            name: c.profiles?.name || 'Participant',
            avatar_url: c.profiles?.avatar_url || null,
            catches_count: c.count,
            total_size: (c.size || 0) * c.count,
            biggest_catch: c.size || 0,
            top5_total: 0,
            all_sizes: c.size ? [c.size] : []
          })
        }
      }

      // Calculate top 5 total for each participant
      leaderboardMap.forEach((entry) => {
        const sortedSizes = entry.all_sizes.sort((a, b) => b - a)
        entry.top5_total = sortedSizes.slice(0, 5).reduce((sum, size) => sum + size, 0)
      })

      // Sort by catches count (descending) by default
      const sortedLeaderboard = Array.from(leaderboardMap.values())
        .sort((a, b) => b.catches_count - a.catches_count)
      setLeaderboard(sortedLeaderboard)
    } catch (error) {
      console.error('Error:', error)
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
    if (!confirm('Lancer cette compétition ?')) return
    setActionLoading(true)
    try {
      await supabase
        .from('competitions')
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('id', competitionId)
      loadCompetition()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleFinishCompetition = async () => {
    if (!confirm('Terminer cette compétition ?')) return
    setActionLoading(true)
    try {
      await supabase
        .from('competitions')
        .update({ status: 'finished', finished_at: new Date().toISOString() })
        .eq('id', competitionId)
      router.push(`/competitions/${competitionId}/results`)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Pattern SVG for hero texture
  const heroPattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"

  // Grain texture for page background
  const grainTexture = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E\")"

  // Entrance animation keyframes
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
  `

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-bg relative">
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: grainTexture }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8">
          <div className="h-5 w-28 bg-surface-muted rounded animate-pulse"></div>
          <div className="h-56 bg-surface-muted rounded-2xl animate-pulse"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-surface-muted rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="h-48 bg-surface-muted rounded-2xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-surface-bg relative">
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: grainTexture }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <div className="bg-surface/80 backdrop-blur-md border border-surface-border/80 rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-surface-muted to-surface-hover flex items-center justify-center mb-4 shadow-md">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Compétition introuvable</h3>
              <p className="text-base text-text-secondary mb-6">Cette compétition n'existe pas ou a été supprimée</p>
              <Link
                href="/competitions"
                className="inline-flex items-center justify-center bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid hover:from-water-mid hover:to-water-surface hover:shadow-[0_8px_30px_rgba(212,165,116,0.25)] text-text-inverse font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105"
              >
                Retour
              </Link>
            </div>
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-active/20 border border-status-active/30 backdrop-blur-sm mb-4 shadow-sm">
          {/* Animated dot with ping effect */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-status-active animate-ping opacity-75"></div>
            <div className="h-2 w-2 rounded-full bg-status-active relative z-10"></div>
          </div>
          <span className="text-sm font-semibold text-primary-100">En cours</span>
        </div>
      )
    }
    if (competition.status === 'finished') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-completed/20 border border-status-completed/30 backdrop-blur-sm mb-4 shadow-sm">
          <span className="text-sm font-semibold text-surface-muted">Terminée</span>
        </div>
      )
    }
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-pending/20 border border-status-pending/30 backdrop-blur-sm mb-4 shadow-sm">
        <span className="text-sm font-semibold text-accent-light">Brouillon</span>
      </div>
    )
  }

  // For draft status, we use a lighter hero card
  const isDraft = competition.status === 'draft'

  return (
    <div className="min-h-screen bg-surface-bg relative">
      {/* Keyframes for animations */}
      <style dangerouslySetInnerHTML={{ __html: entranceAnimation }} />

      {/* Page grain texture - enhanced visibility */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: grainTexture }}
      />

      <div className={`relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8 ${competition.status === 'active' ? 'pb-32' : ''}`}>
        {/* Back button - enhanced animation */}
        <Link
          href="/competitions"
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-all duration-200 group mb-6"
        >
          <svg className="h-5 w-5 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium group-hover:translate-x-0.5 transition-transform duration-200">Compétitions</span>
        </Link>

        {/* Hero Card */}
        {isDraft ? (
          // Draft: lighter hero card
          <div className="relative overflow-hidden bg-surface/80 backdrop-blur-md border border-surface-border/80 rounded-2xl p-8 shadow-lg">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-pending border border-accent-amber mb-4 shadow-sm">
                <span className="text-sm font-semibold text-accent-dark">Brouillon</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter text-text-primary mb-3">
                {competition.name}
              </h1>
              {competition.species && (
                <p className="text-xl font-medium text-text-secondary mb-6">
                  {competition.species}
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-text-secondary">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">
                    {formatDate(competition.start_date)}
                    {competition.end_date !== competition.start_date && ` - ${formatDate(competition.end_date)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-sm font-medium">{competition.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">{acceptedParticipants.length} participant{acceptedParticipants.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {competition.description && (
                <p className="mt-4 pt-4 border-t border-surface-border text-text-secondary text-base">
                  {competition.description}
                </p>
              )}

              {/* Rules - Subtle display in hero */}
              {(competition.rule_total_count || competition.rule_record_size || competition.rule_top_x_biggest) && (
                <div className="mt-6 pt-6 border-t border-surface-border">
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                    Règles de scoring
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {competition.rule_total_count && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-muted border border-surface-border">
                        <svg className="h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <span className="text-sm text-text-secondary">Nombre total</span>
                      </div>
                    )}
                    {competition.rule_record_size && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-muted border border-surface-border">
                        <svg className="h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span className="text-sm text-text-secondary">Plus grosse prise</span>
                      </div>
                    )}
                    {competition.rule_top_x_biggest && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-muted border border-surface-border">
                        <svg className="h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-sm text-text-secondary">Top {competition.rule_top_x_biggest}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Active/Finished: dramatic dark hero card with water reflections
          <div className="relative overflow-hidden rounded-2xl p-8 shadow-2xl">
            {/* Base: Deep water gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-water-deepest via-water-deep to-water-mid" />

            {/* Reflection layer: Golden shimmer */}
            <div className="absolute inset-0 bg-gradient-to-t from-reflect-gold/8 via-reflect-gold/3 to-transparent" />

            {/* Pattern texture overlay - enhanced visibility */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: heroPattern }}
            />

            <div className="relative z-10">
              <StatusBadge />
              <h1 className="text-4xl font-bold tracking-tighter text-white mb-3">
                {competition.name}
              </h1>
              {competition.species && (
                <p className="text-xl font-medium text-primary-100 mb-6">
                  {competition.species}
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-primary-100/90">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">
                    {formatDate(competition.start_date)}
                    {competition.end_date !== competition.start_date && ` - ${formatDate(competition.end_date)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-sm font-medium">{competition.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">{acceptedParticipants.length} participant{acceptedParticipants.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {competition.description && (
                <p className="mt-4 pt-4 border-t border-white/10 text-primary-50 text-base">
                  {competition.description}
                </p>
              )}

              {/* Rules - Subtle display in hero */}
              {(competition.rule_total_count || competition.rule_record_size || competition.rule_top_x_biggest) && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">
                    Règles de scoring
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {competition.rule_total_count && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                        <svg className="h-4 w-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <span className="text-sm text-white/90">Nombre total</span>
                      </div>
                    )}
                    {competition.rule_record_size && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                        <svg className="h-4 w-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span className="text-sm text-white/90">Plus grosse prise</span>
                      </div>
                    )}
                    {competition.rule_top_x_biggest && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                        <svg className="h-4 w-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-sm text-white/90">Top {competition.rule_top_x_biggest}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reward Card with enhanced hover glow */}
        {competition.prize && (
          <div
            className="relative group"
            style={{ animation: 'slideInUp 0.5s ease-out 0.15s both' }}
          >
            {/* Glow effect - enhanced on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-reflect-gold to-reflect-bright rounded-2xl blur-lg opacity-20 group-hover:opacity-40 group-hover:blur-xl transition-all duration-500"></div>

            <div className="relative bg-gradient-to-br from-reflect-bright/15 via-reflect-gold/20 to-reflect-amber/15 border-2 border-reflect-gold/30 rounded-xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-reflect-gold to-reflect-amber flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-reflect-amber uppercase tracking-wider mb-1">Récompense</div>
                  <div className="text-2xl font-bold text-water-deepest">{competition.prize}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Finished - Results CTA */}
        {competition.status === 'finished' && (
          <Link
            href={`/competitions/${competitionId}/results`}
            className="group relative bg-surface/90 backdrop-blur-sm border border-surface-border rounded-xl p-6 shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-300 ease-out block"
            style={{ animation: 'slideInUp 0.5s ease-out 0.3s both' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-light/0 to-primary-light/50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-reflect-gold to-reflect-amber flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                  <svg className="h-8 w-8 text-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-bold text-text-primary">Résultats finaux</p>
                  <p className="text-sm text-text-muted">Voir le classement complet</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-text-muted group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}

        {/* Participants - Collapsible Section */}
        <div
          className="bg-surface/80 backdrop-blur-md border border-surface-border/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          style={{ animation: 'slideInUp 0.5s ease-out 0.45s both' }}
        >
          {/* Collapsible Header */}
          <button
            onClick={() => setIsParticipantsExpanded(!isParticipantsExpanded)}
            className="w-full flex items-center justify-between gap-4 p-6 hover:bg-surface-muted/50 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">Participants</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-muted text-text-secondary text-sm font-medium">
                {acceptedParticipants.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Add participant button - visible for draft and active competitions */}
              {isCreator && competition.status !== 'finished' && (
                <Link
                  href={`/competitions/${competitionId}/invite`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-water-deep to-water-mid hover:from-water-mid hover:to-water-surface text-text-inverse font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Inviter
                </Link>
              )}

              {/* Collapse/Expand icon */}
              <div className="p-2 rounded-lg hover:bg-surface-muted transition-colors duration-200">
                <svg
                  className={`w-5 h-5 text-text-muted transition-transform duration-300 ${isParticipantsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Collapsible Content */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isParticipantsExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-6 pb-6 border-t border-surface-border">
              {acceptedParticipants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-base text-text-muted">Aucun participant confirmé</p>
                  {isCreator && competition.status !== 'finished' && (
                    <Link
                      href={`/competitions/${competitionId}/invite`}
                      className="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary-hover font-medium text-sm transition-colors duration-200"
                    >
                      Inviter le premier participant
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-2 pt-4">
                  {acceptedParticipants.map((participant: any) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-surface-muted hover:to-transparent transition-all duration-200 group"
                    >
                      {/* Avatar with enhanced hover */}
                      <div className="relative">
                        {participant.profiles?.avatar_url ? (
                          <img
                            src={participant.profiles.avatar_url}
                            alt=""
                            className="h-14 w-14 rounded-full ring-2 ring-surface-border group-hover:ring-primary transition-all duration-300 group-hover:scale-105 object-cover"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full ring-2 ring-surface-border group-hover:ring-primary bg-primary flex items-center justify-center text-base text-text-inverse font-semibold transition-all duration-300 group-hover:scale-105">
                            {getInitials(participant.profiles?.name)}
                          </div>
                        )}
                      </div>
                      <span className="text-xl font-semibold text-text-primary">
                        {participant.profiles?.name || 'Participant'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {pendingParticipants.length > 0 && (
                <div className="mt-6 pt-6 border-t border-surface-border">
                  <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
                    En attente ({pendingParticipants.length})
                  </p>
                  <div className="flex -space-x-2">
                    {pendingParticipants.slice(0, 6).map((p) => (
                      <div
                        key={p.id}
                        className="h-12 w-12 rounded-full bg-surface-muted ring-2 ring-surface flex items-center justify-center hover:scale-110 hover:z-10 transition-all duration-200"
                      >
                        <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ))}
                    {pendingParticipants.length > 6 && (
                      <div className="h-12 w-12 rounded-full bg-surface-muted ring-2 ring-surface flex items-center justify-center text-sm font-semibold text-text-secondary hover:scale-110 hover:z-10 transition-all duration-200">
                        +{pendingParticipants.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        {competition.status !== 'draft' && (
          <div
            className="bg-surface/80 backdrop-blur-md border border-surface-border/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            style={{ animation: 'slideInUp 0.5s ease-out 0.55s both' }}
          >
            <div className="p-6 pb-0">
              <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-4">Classement</h2>

              {/* Tabs Navigation */}
              <div className="flex gap-2 border-b border-surface-border pb-0 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveLeaderboardTab('total')}
                  className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                    activeLeaderboardTab === 'total'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  Nombre total
                </button>

                <button
                  onClick={() => setActiveLeaderboardTab('biggest')}
                  className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                    activeLeaderboardTab === 'biggest'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Plus grosse prise
                </button>

                <button
                  onClick={() => setActiveLeaderboardTab('top5')}
                  className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                    activeLeaderboardTab === 'top5'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Top 5 combiné
                </button>
              </div>
            </div>

            <div className="border-t border-surface-border p-6">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-surface-muted to-surface-hover flex items-center justify-center mb-4 shadow-md">
                    <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <p className="text-base text-text-muted">Aucune prise enregistrée</p>
                  <p className="text-sm text-text-muted mt-1">Soyez le premier à capturer un poisson !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    // Sort leaderboard based on active tab
                    const sortedLeaderboard = [...leaderboard].sort((a, b) => {
                      switch (activeLeaderboardTab) {
                        case 'total':
                          return b.catches_count - a.catches_count
                        case 'biggest':
                          return b.biggest_catch - a.biggest_catch
                        case 'top5':
                          return b.top5_total - a.top5_total
                        default:
                          return 0
                      }
                    })

                    // Filter out entries with no relevant data for biggest/top5 tabs
                    const filteredLeaderboard = activeLeaderboardTab === 'biggest'
                      ? sortedLeaderboard.filter(e => e.biggest_catch > 0)
                      : activeLeaderboardTab === 'top5'
                        ? sortedLeaderboard.filter(e => e.top5_total > 0)
                        : sortedLeaderboard

                    if (filteredLeaderboard.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-base text-text-muted">
                            {activeLeaderboardTab === 'biggest'
                              ? 'Aucune taille enregistrée'
                              : 'Aucune taille enregistrée pour calculer le Top 5'}
                          </p>
                          <p className="text-sm text-text-muted mt-1">
                            Enregistrez la taille de vos prises pour apparaître ici
                          </p>
                        </div>
                      )
                    }

                    return filteredLeaderboard.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                          index === 0
                            ? 'bg-gradient-to-r from-medal-gold-bg/20 to-medal-gold-bg/10 border border-medal-gold/30'
                            : index === 1
                              ? 'bg-gradient-to-r from-medal-silver-bg/50 to-medal-silver-bg/30 border border-medal-silver/50'
                              : index === 2
                                ? 'bg-gradient-to-r from-medal-bronze-bg/50 to-medal-bronze-bg/30 border border-medal-bronze/50'
                                : 'hover:bg-surface-muted'
                        }`}
                      >
                        {/* Rank */}
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0
                            ? 'bg-gradient-to-br from-medal-gold to-reflect-amber text-text-inverse shadow-md'
                            : index === 1
                              ? 'bg-gradient-to-br from-medal-silver to-medal-silver text-text-inverse shadow-md'
                              : index === 2
                                ? 'bg-gradient-to-br from-medal-bronze to-medal-bronze text-text-inverse shadow-md'
                                : 'bg-surface-muted text-text-secondary'
                        }`}>
                          {index + 1}
                        </div>

                        {/* Avatar */}
                        {entry.avatar_url ? (
                          <img
                            src={entry.avatar_url}
                            alt=""
                            className="h-12 w-12 rounded-full ring-2 ring-surface object-cover shadow-sm"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full ring-2 ring-surface bg-primary flex items-center justify-center text-sm text-text-inverse font-semibold shadow-sm">
                            {getInitials(entry.name)}
                          </div>
                        )}

                        {/* Name & Stats */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-text-primary truncate">{entry.name}</p>
                          <p className="text-sm text-text-secondary">
                            {activeLeaderboardTab === 'total' && `${entry.catches_count} ${entry.catches_count > 1 ? 'prises' : 'prise'}`}
                            {activeLeaderboardTab === 'biggest' && `Max: ${entry.biggest_catch} cm`}
                            {activeLeaderboardTab === 'top5' && `Top 5: ${entry.top5_total} cm`}
                          </p>
                        </div>

                        {/* Score Badge - changes based on active tab */}
                        <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-lg ${
                          index === 0
                            ? 'bg-medal-gold-bg/20 text-medal-gold'
                            : 'bg-surface-muted text-text-secondary'
                        }`}>
                          {activeLeaderboardTab === 'total' && entry.catches_count}
                          {activeLeaderboardTab === 'biggest' && `${entry.biggest_catch} cm`}
                          {activeLeaderboardTab === 'top5' && `${entry.top5_total} cm`}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {competition.status !== 'draft' && (
          <div
            className={`bg-surface/80 backdrop-blur-md border border-surface-border/80 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${competition.status === 'active' ? 'mb-24' : ''}`}
            style={{ animation: 'slideInUp 0.5s ease-out 0.65s both' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">Galerie</h2>
              <div className="text-sm text-text-muted">
                {catches.filter(c => c.photo_url).length} photo{catches.filter(c => c.photo_url).length !== 1 ? 's' : ''}
              </div>
            </div>

            {catches.filter(c => c.photo_url).length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-surface-muted to-surface-hover flex items-center justify-center mb-4 shadow-md">
                  <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-base text-text-muted">Aucune photo pour le moment</p>
                <p className="text-sm text-text-muted mt-1">Les photos de vos prises apparaîtront ici</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {catches
                  .filter(c => c.photo_url)
                  .slice(0, 9)
                  .map((catchItem: any) => (
                    <div
                      key={catchItem.id}
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <img
                        src={catchItem.photo_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Overlay with info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white font-medium text-sm truncate">
                            {catchItem.profiles?.name || 'Participant'}
                          </p>
                          <div className="flex items-center gap-2 text-white/80 text-xs">
                            {catchItem.size && (
                              <span>{catchItem.size} cm</span>
                            )}
                            {catchItem.count > 1 && (
                              <span>x{catchItem.count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {catches.filter(c => c.photo_url).length > 9 && (
              <div className="mt-4 text-center">
                <Link
                  href={`/competitions/${competitionId}/gallery`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors duration-200"
                >
                  Voir toutes les photos
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Creator Actions */}
        {isCreator && (
          <div className="space-y-4">
            {competition.status === 'draft' && acceptedParticipants.length >= 2 && (
              <button
                onClick={handleStartCompetition}
                disabled={actionLoading}
                className="w-full bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid hover:from-water-mid hover:to-water-surface hover:shadow-[0_8px_30px_rgba(212,165,116,0.25)] active:from-water-deepest active:to-water-deep disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                {actionLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Lancement...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Lancer la compétition
                  </>
                )}
              </button>
            )}

            {competition.status === 'draft' && acceptedParticipants.length < 2 && (
              <div className="bg-surface/80 backdrop-blur-md border border-surface-border/80 rounded-xl p-6 text-center shadow-md">
                <p className="text-base text-text-muted">
                  Minimum 2 participants requis pour commencer
                </p>
              </div>
            )}

            {competition.status === 'active' && (
              <button
                onClick={handleFinishCompetition}
                disabled={actionLoading}
                className="w-full bg-surface border-2 border-surface-hover hover:border-primary text-text-secondary hover:text-primary font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3"
              >
                {actionLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-surface-hover border-t-text-secondary rounded-full animate-spin"></div>
                    Terminaison...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Terminer la compétition
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>

      {/* Floating Full-Width Capture Button */}
      {competition.status === 'active' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
          <div className="max-w-4xl mx-auto">
            <Link
              href={`/competitions/${competitionId}/catches`}
              className="pointer-events-auto block"
            >
              <button className="w-full bg-gradient-to-br from-water-mid via-merged-teal-gold to-water-surface hover:shadow-[0_12px_40px_rgba(212,165,116,0.3)] text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-lg">Ajouter des prises</span>
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
