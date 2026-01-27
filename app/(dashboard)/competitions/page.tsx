'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Competition } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CompetitionsPage() {
  const router = useRouter()
  const [competitions, setCompetitions] = useState<Competition[]>([])
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

      setCompetitions(uniqueCompetitions)
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

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
            <span className="relative h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-700">En cours</span>
        </span>
      )
    }
    if (status === 'finished') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20">
          <span className="text-xs font-semibold text-slate-600">Terminée</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
        <span className="text-xs font-semibold text-amber-700">Brouillon</span>
      </span>
    )
  }

  const getStatusIcon = (status: string) => {
    if (status === 'active') {
      return (
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-md"></div>
          <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
            <svg className="h-7 w-7 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      )
    }
    if (status === 'finished') {
      return (
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-slate-500/20 rounded-xl blur-md"></div>
          <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
            <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        </div>
      )
    }
    return (
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-md"></div>
        <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
          <svg className="h-7 w-7 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-teal-50/30 relative">
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: grainTexture }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Header skeleton */}
          <div className="flex justify-between items-start">
            <div>
              <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="h-12 w-12 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>

          {/* Cards skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/90 rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-slate-200 rounded-xl animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-6 w-2/3 bg-slate-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-teal-50/30 relative">
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
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Compétitions</h1>
            <p className="text-lg text-slate-600 mt-2">Vos tournois de pêche</p>
          </div>
          <Link
            href="/competitions/create"
            className="group relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-water-deep via-merged-teal-gold to-water-mid rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
            <div className="relative h-12 w-12 bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </Link>
        </div>

        {competitions.length === 0 ? (
          /* Empty State */
          <div
            className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-8 shadow-lg"
            style={{ animation: 'slideInUp 0.5s ease-out 0.1s both' }}
          >
            <div className="flex flex-col items-center justify-center py-8 px-4">
              {/* Illustration */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary-light to-[#0A4F4C]/10 flex items-center justify-center shadow-lg">
                  <svg className="h-16 w-16 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">
                Aucune compétition
              </h3>
              <p className="text-base text-slate-600 mb-8 text-center max-w-md">
                Créez votre première compétition et invitez vos amis pêcheurs à vous rejoindre.
              </p>

              <Link
                href="/competitions/create"
                className="inline-flex items-center gap-3 bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid hover:from-water-mid hover:to-water-surface hover:shadow-[0_8px_30px_rgba(212,165,116,0.25)] text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 md:p-6 shadow-md hover:shadow-xl hover:border-slate-300 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    {/* Status icon with colored gradient */}
                    {getStatusIcon(competition.status)}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-lg md:text-xl font-semibold text-slate-900 truncate">
                          {competition.name}
                        </h2>
                        <StatusBadge status={competition.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">{formatDate(competition.start_date)}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="font-medium">{competition.location}</span>
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <svg className="h-5 w-5 text-slate-400 flex-shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
            className="relative bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid hover:from-water-mid hover:to-water-surface hover:shadow-[0_8px_30px_rgba(212,165,116,0.25)] text-white rounded-full h-16 w-16 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:scale-110"
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
