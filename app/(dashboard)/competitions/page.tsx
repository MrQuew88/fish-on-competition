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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'active') {
      return (
        <span className="badge badge-active">
          <span className="status-dot status-dot-live"></span>
          Live
        </span>
      )
    }
    if (status === 'finished') {
      return <span className="badge badge-finished">Completed</span>
    }
    return <span className="badge badge-draft">Draft</span>
  }

  const getStatusIcon = (status: string) => {
    if (status === 'active') {
      return (
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )
    }
    if (status === 'finished') {
      return (
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
      )
    }
    return (
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-container-narrow">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="skeleton h-7 w-40 mb-2"></div>
            <div className="skeleton h-5 w-28"></div>
          </div>
          <div className="skeleton h-10 w-10 rounded-lg"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-lg"></div>
                <div className="flex-1">
                  <div className="skeleton h-5 w-2/3 mb-2"></div>
                  <div className="skeleton h-4 w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page-container-narrow">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Competitions</h1>
          <p className="text-slate-500 mt-1">Your fishing tournaments</p>
        </div>
        <Link
          href="/competitions/create"
          className="w-10 h-10 bg-teal-700 text-white rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>

      {competitions.length === 0 ? (
        <div className="card p-8">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="empty-state-title">No competitions yet</h3>
            <p className="empty-state-text mb-6">
              Create your first competition and invite your fishing friends.
            </p>
            <Link href="/competitions/create" className="btn-primary">
              Create competition
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {competitions.map((competition, index) => (
            <Link
              key={competition.id}
              href={`/competitions/${competition.id}`}
              className="card-interactive block p-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex items-center gap-4">
                {/* Status icon */}
                {getStatusIcon(competition.status)}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-semibold text-slate-900 truncate">
                      {competition.name}
                    </h2>
                    <StatusBadge status={competition.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
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

                {/* Arrow */}
                <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
