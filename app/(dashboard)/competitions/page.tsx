'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Competition } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ParticipantInfo {
  id: string
  user_id: string | null
  avatar_url?: string | null
  name?: string | null
}

interface CompetitionWithStats extends Competition {
  participants: ParticipantInfo[]
  catches_count: number
}

export default function CompetitionsPage() {
  const router = useRouter()
  const [competitions, setCompetitions] = useState<CompetitionWithStats[]>([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    loadCompetitions()
  }, [])

  const loadCompetitions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. Get competitions created by user
      const { data: createdCompetitions, error: error1 } = await supabase
        .from('competitions')
        .select('*')
        .eq('creator_id', user.id)

      if (error1) throw error1

      // 2. Get competition IDs where user is participant
      const { data: participations, error: error2 } = await supabase
        .from('participants')
        .select('competition_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted')

      if (error2) throw error2

      // 3. Get competition details for participated ones
      let participantCompetitions: Competition[] = []
      if (participations && participations.length > 0) {
        const competitionIds = participations.map(p => p.competition_id)
        const { data, error: error3 } = await supabase
          .from('competitions')
          .select('*')
          .in('id', competitionIds)

        if (error3) throw error3
        participantCompetitions = data || []
      }

      // 4. Combine and deduplicate
      const allCompetitions = [...(createdCompetitions || []), ...participantCompetitions]
      const uniqueCompetitions = Array.from(
        new Map(allCompetitions.map(comp => [comp.id, comp])).values()
      )

      // 5. Sort by date
      uniqueCompetitions.sort((a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      )

      // 6. Fetch participants and catches count for each competition
      const competitionsWithStats: CompetitionWithStats[] = await Promise.all(
        uniqueCompetitions.map(async (comp) => {
          // Get participants with profile info
          const { data: participantsData } = await supabase
            .from('participants')
            .select(`
              id,
              user_id,
              profiles:user_id (
                name,
                avatar_url
              )
            `)
            .eq('competition_id', comp.id)
            .eq('status', 'accepted')

          const participants: ParticipantInfo[] = (participantsData || []).map((p: any) => {
            const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
            return {
              id: p.id,
              user_id: p.user_id,
              name: profile?.name || null,
              avatar_url: profile?.avatar_url || null
            }
          })

          // Get catches count
          const { count: catchesCount } = await supabase
            .from('catches')
            .select('*', { count: 'exact', head: true })
            .eq('competition_id', comp.id)

          return {
            ...comp,
            participants,
            catches_count: catchesCount || 0
          }
        })
      )

      setCompetitions(competitionsWithStats)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Check if same day
    if (start.toDateString() === end.toDateString()) {
      return formatDate(startDate)
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-active-bg border border-status-active/20">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-status-active animate-ping opacity-75"></span>
            <span className="relative h-2 w-2 rounded-full bg-status-active"></span>
          </span>
          <span className="text-xs font-semibold text-primary-700">En cours</span>
        </span>
      )
    }
    if (status === 'finished') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-completed/10 border border-status-completed/20">
          <span className="text-xs font-semibold text-text-secondary">Terminée</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-pending/10 border border-status-pending/20">
        <span className="text-xs font-semibold text-accent-dark">Brouillon</span>
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-bg via-primary-50/50 to-primary-50/30 relative">
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: grainTexture }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Header skeleton */}
          <div className="flex justify-between items-start">
            <div>
              <div className="h-10 w-48 bg-surface-muted rounded-lg animate-pulse mb-2"></div>
              <div className="h-5 w-32 bg-surface-muted rounded animate-pulse"></div>
            </div>
            <div className="h-12 w-12 bg-surface-muted rounded-xl animate-pulse"></div>
          </div>

          {/* Cards skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface/95 rounded-2xl p-5 shadow-md">
                {/* Top row skeleton */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-48 bg-surface-muted rounded animate-pulse"></div>
                    <div className="h-6 w-20 bg-surface-muted rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-5 w-5 bg-surface-muted rounded animate-pulse"></div>
                </div>
                {/* Bottom grid skeleton */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-surface-muted rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-surface-muted rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-surface-muted rounded animate-pulse"></div>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-7 w-7 bg-surface-muted rounded-full animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-bg via-primary-50/50 to-primary-50/30 relative">
      {/* Keyframes for animations */}
      <style dangerouslySetInnerHTML={{ __html: entranceAnimation }} />

      {/* Page grain texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: grainTexture }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-text-primary">Compétitions</h1>
            <p className="text-lg text-text-secondary mt-2">Vos tournois de pêche</p>
          </div>
          <Link
            href="/competitions/create"
            className="group relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-water-deep via-merged-teal-gold to-water-mid rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
            <div className="relative h-12 w-12 bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid text-text-inverse rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </Link>
        </div>

        {competitions.length === 0 ? (
          /* Empty State */
          <div
            className="bg-surface/80 backdrop-blur-md border border-surface-border rounded-2xl p-8 shadow-lg"
            style={{ animation: 'slideInUp 0.5s ease-out 0.1s both' }}
          >
            <div className="flex flex-col items-center justify-center py-8 px-4">
              {/* Illustration */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary-light to-primary-600/10 flex items-center justify-center shadow-lg">
                  <svg className="h-16 w-16 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-text-primary mb-2 text-center">
                Aucune compétition
              </h3>
              <p className="text-base text-text-secondary mb-8 text-center max-w-md">
                Créez votre première compétition et invitez vos amis pêcheurs à vous rejoindre.
              </p>

              <Link
                href="/competitions/create"
                className="inline-flex items-center gap-3 bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid hover:from-water-mid hover:to-water-surface hover:shadow-[0_8px_30px_rgba(212,165,116,0.25)] text-text-inverse font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Créer ma première compétition
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          /* Competition Cards */
          <div className="space-y-4">
            {competitions.map((competition, index) => (
              <Link
                key={competition.id}
                href={`/competitions/${competition.id}`}
                className="group block"
                style={{ animation: `slideInUp 0.5s ease-out ${0.1 + index * 0.1}s both` }}
              >
                <div className="bg-surface/95 backdrop-blur-sm border border-surface-border rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-surface-hover transition-all duration-300">
                  {/* Top: Name + Badge + Chevron */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                      <h2 className="text-xl font-semibold text-text-primary truncate">
                        {competition.name}
                      </h2>
                      <StatusBadge status={competition.status} />
                    </div>
                    <svg className="h-5 w-5 text-text-muted flex-shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Bottom: Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {/* Left Column - Date & Location */}
                    <div className="space-y-2">
                      {/* Date range */}
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <svg className="h-4 w-4 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{formatDateRange(competition.start_date, competition.end_date)}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <svg className="h-4 w-4 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{competition.location}</span>
                      </div>
                    </div>

                    {/* Right Column - Participants & Fish count */}
                    <div className="space-y-2">
                      {/* Participants */}
                      <div>
                        <div className="text-xs text-text-muted mb-1.5">Participants</div>
                        <div className="flex items-center -space-x-2">
                          {competition.participants.length === 0 ? (
                            <span className="text-sm text-text-muted">Aucun participant</span>
                          ) : (
                            <>
                              {competition.participants.slice(0, 4).map((participant) => (
                                participant.avatar_url ? (
                                  <img
                                    key={participant.id}
                                    src={participant.avatar_url}
                                    alt={participant.name || 'Participant'}
                                    className="h-7 w-7 rounded-full ring-2 ring-surface object-cover"
                                  />
                                ) : (
                                  <div
                                    key={participant.id}
                                    className="h-7 w-7 rounded-full ring-2 ring-surface bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center"
                                  >
                                    <span className="text-[10px] font-semibold text-text-inverse">
                                      {getInitials(participant.name)}
                                    </span>
                                  </div>
                                )
                              ))}
                              {competition.participants.length > 4 && (
                                <div className="h-7 w-7 rounded-full bg-surface-muted ring-2 ring-surface flex items-center justify-center">
                                  <span className="text-xs font-semibold text-text-secondary">
                                    +{competition.participants.length - 4}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Fish count */}
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={competition.catches_count > 0 ? "text-text-secondary font-medium" : "text-text-muted"}>
                          {competition.catches_count > 0 ? `${competition.catches_count} prises` : "Aucune prise"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Floating Create Button (mobile) */}
        <div className="md:hidden fixed bottom-6 right-6 group">
          {/* Glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-water-deep via-merged-teal-gold to-water-mid rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

          <Link
            href="/competitions/create"
            className="relative bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid hover:from-water-mid hover:to-water-surface hover:shadow-[0_8px_30px_rgba(212,165,116,0.25)] text-text-inverse rounded-full h-16 w-16 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:scale-110"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
