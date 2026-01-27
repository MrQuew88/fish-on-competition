'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface CatchWithProfile {
  id: string
  user_id: string
  count: number
  size: number | null
  lure: string | null
  photo_url: string | null
  recorded_at: string
  profiles: {
    name: string
    avatar_url: string | null
  }
}

export default function CapturesPage() {
  const params = useParams()
  const competitionId = params.id as string

  const [competition, setCompetition] = useState<any>(null)
  const [catches, setCatches] = useState<CatchWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCaptures()
  }, [])

  const loadCaptures = async () => {
    try {
      const { data: compData, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single()

      if (compError) throw compError
      setCompetition(compData)

      const { data: catchesData, error: catchError } = await supabase
        .from('catches')
        .select('*, profiles(name, avatar_url)')
        .eq('competition_id', competitionId)
        .order('recorded_at', { ascending: false })

      if (catchError) throw catchError
      setCatches(catchesData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const groupedCatches = catches.reduce((acc, catchItem) => {
    const key = `${catchItem.user_id}-${catchItem.recorded_at}-${catchItem.photo_url || 'no-photo'}`
    if (!acc[key]) {
      acc[key] = {
        user_name: catchItem.profiles.name,
        avatar_url: catchItem.profiles.avatar_url,
        recorded_at: catchItem.recorded_at,
        photo_url: catchItem.photo_url,
        catches: []
      }
    }
    acc[key].catches.push(catchItem)
    return acc
  }, {} as any)

  const sessions = Object.values(groupedCatches) as any[]

  if (loading) {
    return (
      <div className="page-container-narrow">
        <div className="skeleton h-5 w-24 mb-6"></div>
        <div className="skeleton h-28 rounded-xl mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card overflow-hidden">
              <div className="p-5">
                <div className="flex gap-4">
                  <div className="skeleton w-10 h-10 rounded-lg"></div>
                  <div className="space-y-2 flex-1">
                    <div className="skeleton h-5 w-32"></div>
                    <div className="skeleton h-4 w-24"></div>
                  </div>
                </div>
              </div>
              <div className="skeleton h-48"></div>
            </div>
          ))}
        </div>
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
      <div className="card p-6 mb-6 bg-slate-700">
        <h1 className="text-xl font-semibold text-white">Gallery</h1>
        <p className="text-white/60 text-sm mt-1">{competition.name}</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span>{catches.length} catch{catches.length !== 1 ? 'es' : ''}</span>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="card p-8">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="empty-state-title">Gallery is empty</h3>
            <p className="empty-state-text mb-6">
              Be the first to log a catch!
            </p>
            {competition.status === 'active' && (
              <Link
                href={`/competitions/${competitionId}/catches`}
                className="btn-success"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                Log a catch
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session: any, index: number) => {
            const totalFish = session.catches.length
            const withSize = session.catches.filter((c: any) => c.size !== null)
            const sizes = withSize.map((c: any) => c.size).sort((a: number, b: number) => b - a)
            const biggestSize = sizes.length > 0 ? sizes[0] : null
            const lures = Array.from(new Set(session.catches.filter((c: any) => c.lure).map((c: any) => c.lure))) as string[]

            return (
              <div
                key={index}
                className="card overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Session Header */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {session.avatar_url ? (
                      <img
                        src={session.avatar_url}
                        alt={session.user_name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-teal-700 flex items-center justify-center text-sm text-white font-semibold">
                        {getInitials(session.user_name)}
                      </div>
                    )}

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {session.user_name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {formatDateTime(session.recorded_at)}
                      </p>
                    </div>

                    {/* Fish count badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-700 rounded-full font-semibold text-sm border border-emerald-500/20">
                      <span>{totalFish}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  </div>

                  {/* Stats row */}
                  {(sizes.length > 0 || lures.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {biggestSize && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 text-teal-700 rounded-lg text-sm font-medium border border-teal-500/20">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span>Biggest: {biggestSize} cm</span>
                        </div>
                      )}
                      {sizes.length > 1 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium border border-slate-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>{sizes.length} measured</span>
                        </div>
                      )}
                      {lures.slice(0, 2).map((lure: string, idx: number) => (
                        <div key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-700 rounded-lg text-sm font-medium border border-amber-500/20">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span>{lure}</span>
                        </div>
                      ))}
                      {lures.length > 2 && (
                        <div className="inline-flex items-center px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-sm border border-slate-200">
                          +{lures.length - 2}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sizes detail */}
                  {sizes.length > 0 && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Recorded sizes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {sizes.map((size: number, idx: number) => (
                          <span
                            key={idx}
                            className={`inline-block px-2.5 py-1 rounded-lg text-sm font-semibold ${
                              idx === 0 ? 'bg-teal-700 text-white' : 'bg-white text-slate-700 shadow-sm border border-slate-200'
                            }`}
                          >
                            {size} cm
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Photo */}
                {session.photo_url && (
                  <div className="relative">
                    <img
                      src={session.photo_url}
                      alt="Catch"
                      className="w-full h-auto object-cover max-h-[400px]"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* FAB */}
      {competition.status === 'active' && sessions.length > 0 && (
        <Link
          href={`/competitions/${competitionId}/catches`}
          className="fab"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}
    </div>
  )
}
