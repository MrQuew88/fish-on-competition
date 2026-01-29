'use client'

import { useEffect, useState, useCallback } from 'react'
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

interface CatchSession {
  id: string
  user_id: string
  user_name: string
  avatar_url: string | null
  recorded_at: string
  photo_url: string | null
  catches: CatchWithProfile[]
  totalFish: number
  biggestSize: number | null
  lures: string[]
}

export default function CapturesPage() {
  const params = useParams()
  const competitionId = params.id as string

  const [competition, setCompetition] = useState<any>(null)
  const [catches, setCatches] = useState<CatchWithProfile[]>([])
  const [sessions, setSessions] = useState<CatchSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<CatchSession | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [biggestOverall, setBiggestOverall] = useState<number | null>(null)

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
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `

  useEffect(() => {
    loadCaptures()
  }, [])

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedSession) return

      if (e.key === 'Escape') {
        setSelectedSession(null)
      } else if (e.key === 'ArrowLeft') {
        navigateSession(-1)
      } else if (e.key === 'ArrowRight') {
        navigateSession(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedSession, sessions])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedSession) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedSession])

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

      // Find biggest overall
      const allSizes = catchesData?.filter((c: any) => c.size !== null).map((c: any) => c.size) || []
      if (allSizes.length > 0) {
        setBiggestOverall(Math.max(...allSizes))
      }

      // Group catches into sessions
      const grouped = (catchesData || []).reduce((acc: any, catchItem: CatchWithProfile) => {
        const key = `${catchItem.user_id}-${catchItem.recorded_at}-${catchItem.photo_url || 'no-photo'}`
        if (!acc[key]) {
          acc[key] = {
            id: key,
            user_id: catchItem.user_id,
            user_name: catchItem.profiles.name,
            avatar_url: catchItem.profiles.avatar_url,
            recorded_at: catchItem.recorded_at,
            photo_url: catchItem.photo_url,
            catches: []
          }
        }
        acc[key].catches.push(catchItem)
        return acc
      }, {})

      // Process sessions
      const processedSessions: CatchSession[] = Object.values(grouped).map((session: any) => {
        const sizes = session.catches.filter((c: any) => c.size !== null).map((c: any) => c.size).sort((a: number, b: number) => b - a)
        const lures = Array.from(new Set(session.catches.filter((c: any) => c.lure).map((c: any) => c.lure))) as string[]
        return {
          ...session,
          totalFish: session.catches.length,
          biggestSize: sizes.length > 0 ? sizes[0] : null,
          lures
        }
      })

      setSessions(processedSessions)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateSession = useCallback((direction: number) => {
    if (!selectedSession) return

    const filteredSessions = selectedFilter
      ? sessions.filter(s => s.user_id === selectedFilter)
      : sessions

    const currentIndex = filteredSessions.findIndex(s => s.id === selectedSession.id)
    const newIndex = currentIndex + direction

    if (newIndex >= 0 && newIndex < filteredSessions.length) {
      setSelectedSession(filteredSessions[newIndex])
    }
  }, [selectedSession, sessions, selectedFilter])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Get unique participants for filter
  const participants = Array.from(
    new Map(sessions.map(s => [s.user_id, { id: s.user_id, name: s.user_name, avatar: s.avatar_url }])).values()
  )

  // Filter sessions
  const filteredSessions = selectedFilter
    ? sessions.filter(s => s.user_id === selectedFilter)
    : sessions

  // Sessions with photos only for grid display
  const sessionsWithPhotos = filteredSessions.filter(s => s.photo_url)

  if (loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: entranceAnimation }} />
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-bg via-primary-light to-surface-bg" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: grainTexture }} />
        </div>
        <div className="min-h-screen px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="h-8 w-32 bg-surface-muted rounded-lg mb-6 animate-pulse" />
            <div className="h-12 bg-white/80 rounded-xl mb-6 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-square bg-white/80 rounded-xl animate-pulse" />
              ))}
            </div>
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
        <div className="max-w-7xl mx-auto">
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary mb-1">
              Galerie
            </h1>
            <p className="text-text-secondary">{competition.name}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium">{sessionsWithPhotos.length} photos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-status-active/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-status-active" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <span className="font-medium">{catches.length} prises</span>
              </div>
              {participants.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent-amber/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">{participants.length} participants</span>
                </div>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          {participants.length > 1 && (
            <div
              className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"
              style={{ animation: 'slideInUp 0.4s ease-out 0.15s forwards', opacity: 0 }}
            >
              <button
                onClick={() => setSelectedFilter(null)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  selectedFilter === null
                    ? 'text-white bg-gradient-to-r from-water-deep via-merged-teal-gold to-water-mid shadow-md shadow-primary/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/80 bg-white/50'
                }`}
              >
                Tous
              </button>
              {participants.map((participant) => (
                <button
                  key={participant.id}
                  onClick={() => setSelectedFilter(participant.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    selectedFilter === participant.id
                      ? 'text-white bg-gradient-to-r from-water-deep via-merged-teal-gold to-water-mid shadow-md shadow-primary/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/80 bg-white/50'
                  }`}
                >
                  {participant.avatar ? (
                    <img
                      src={participant.avatar}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedFilter === participant.id
                        ? 'bg-white/30 text-white'
                        : 'bg-primary text-white'
                    }`}>
                      {getInitials(participant.name)}
                    </div>
                  )}
                  {participant.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {sessionsWithPhotos.length === 0 ? (
            // Empty State
            <div
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-surface-border/80 shadow-lg p-12 text-center"
              style={{ animation: 'slideInUp 0.4s ease-out 0.2s forwards', opacity: 0 }}
            >
              <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary-light to-primary/10 flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Galerie vide</h3>
              <p className="text-text-secondary mb-8">
                {selectedFilter
                  ? "Ce participant n'a pas encore partagé de photos"
                  : "Soyez le premier à partager une photo de votre prise !"}
              </p>
              {competition.status === 'active' && (
                <Link
                  href={`/competitions/${competitionId}/catches`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-status-active to-primary text-white rounded-xl font-semibold shadow-lg shadow-status-active/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Capturer mon premier poisson
                </Link>
              )}
            </div>
          ) : (
            // Photo Grid
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              style={{ animation: 'slideInUp 0.4s ease-out 0.2s forwards', opacity: 0 }}
            >
              {sessionsWithPhotos.map((session, index) => {
                const isRecord = session.biggestSize !== null && session.biggestSize === biggestOverall
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-surface-muted">
                      <img
                        src={session.photo_url!}
                        alt="Capture"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Record Badge */}
                      {isRecord && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Record
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Overlay Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        {/* Participant */}
                        <div className="flex items-center gap-2 mb-2">
                          {session.avatar_url ? (
                            <img
                              src={session.avatar_url}
                              alt=""
                              className="w-6 h-6 rounded-full ring-2 ring-white object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full ring-2 ring-white bg-primary flex items-center justify-center text-xs font-bold">
                              {getInitials(session.user_name)}
                            </div>
                          )}
                          <span className="text-sm font-semibold truncate">{session.user_name}</span>
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-3 text-xs">
                          {session.biggestSize && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                              </svg>
                              {session.biggestSize} cm
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDateTime(session.recorded_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fish count badge - visible on mobile */}
                    <div className="md:hidden absolute top-2 left-2 px-2 py-1 rounded-full bg-status-active-bg0 text-white text-xs font-bold">
                      {session.totalFish}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* FAB */}
          {competition.status === 'active' && sessionsWithPhotos.length > 0 && (
            <Link
              href={`/competitions/${competitionId}/catches`}
              className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-status-active to-primary text-white rounded-full shadow-lg shadow-status-active/30 flex items-center justify-center hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 z-30"
              style={{ animation: 'slideInUp 0.4s ease-out 0.4s forwards', opacity: 0 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-50"
          style={{ animation: 'fadeIn 0.2s ease-out forwards' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setSelectedSession(null)}
          />

          {/* Modal */}
          <div
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
          >
            <div className="flex-1 grid md:grid-cols-2 gap-0 overflow-hidden">
              {/* Left - Image */}
              <div className="relative bg-slate-900 flex items-center justify-center min-h-[300px] md:min-h-0">
                <img
                  src={selectedSession.photo_url!}
                  alt="Capture"
                  className="w-full h-full object-contain max-h-[50vh] md:max-h-none"
                />

                {/* Mobile Close Button */}
                <button
                  onClick={() => setSelectedSession(null)}
                  className="md:hidden absolute top-4 right-4 p-2 rounded-full bg-slate-900/50 backdrop-blur-sm text-white hover:bg-slate-900/70 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Navigation Arrows */}
                {filteredSessions.findIndex(s => s.id === selectedSession.id) > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateSession(-1) }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                {filteredSessions.findIndex(s => s.id === selectedSession.id) < filteredSessions.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateSession(1) }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {/* Record Badge */}
                {selectedSession.biggestSize !== null && selectedSession.biggestSize === biggestOverall && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold flex items-center gap-1.5 shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Plus grosse prise
                  </div>
                )}
              </div>

              {/* Right - Details */}
              <div className="p-6 md:p-8 flex flex-col overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {selectedSession.avatar_url ? (
                      <img
                        src={selectedSession.avatar_url}
                        alt=""
                        className="w-12 h-12 rounded-full ring-2 ring-surface-border object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full ring-2 ring-surface-border bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid flex items-center justify-center text-white font-bold">
                        {getInitials(selectedSession.user_name)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">{selectedSession.user_name}</h2>
                      <p className="text-sm text-text-muted">{formatFullDate(selectedSession.recorded_at)}</p>
                    </div>
                  </div>

                  {/* Desktop Close Button */}
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="hidden md:flex p-2 rounded-lg hover:bg-surface-bg transition-colors duration-200"
                  >
                    <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Fish Count */}
                  <div className="p-4 rounded-xl bg-status-active-bg border border-status-active/30">
                    <div className="w-10 h-10 rounded-lg bg-status-active/20 flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-status-active" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-status-active uppercase tracking-wide mb-1">Prises</p>
                    <p className="text-2xl font-bold text-status-active tabular-nums">{selectedSession.totalFish}</p>
                  </div>

                  {/* Size */}
                  {selectedSession.biggestSize && (
                    <div className="p-4 rounded-xl bg-primary-light border border-primary/20">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Plus grande</p>
                      <p className="text-2xl font-bold text-primary tabular-nums">{selectedSession.biggestSize} cm</p>
                    </div>
                  )}

                  {/* Time */}
                  <div className="p-4 rounded-xl bg-surface-bg border border-surface-border">
                    <div className="w-10 h-10 rounded-lg bg-surface-bg flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Heure</p>
                    <p className="text-2xl font-bold text-text-primary tabular-nums">{formatTime(selectedSession.recorded_at)}</p>
                  </div>

                  {/* Lure */}
                  {selectedSession.lures.length > 0 && (
                    <div className="p-4 rounded-xl bg-accent-amber/10 border border-accent-amber/30">
                      <div className="w-10 h-10 rounded-lg bg-accent-amber/20 flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-accent-amber uppercase tracking-wide mb-1">Leurre</p>
                      <p className="text-lg font-bold text-accent-amber truncate">{selectedSession.lures[0]}</p>
                    </div>
                  )}
                </div>

                {/* All Sizes */}
                {selectedSession.catches.some(c => c.size !== null) && (
                  <div className="mt-auto pt-6 border-t border-surface-border">
                    <p className="text-sm font-semibold text-text-primary mb-3">Tailles enregistrées</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSession.catches
                        .filter(c => c.size !== null)
                        .map(c => c.size!)
                        .sort((a, b) => b - a)
                        .map((size, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                              idx === 0 && size === biggestOverall
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                                : idx === 0
                                ? 'bg-primary text-white'
                                : 'bg-surface-bg text-text-secondary'
                            }`}
                          >
                            {size} cm
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
