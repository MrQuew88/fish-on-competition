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
      console.error('Erreur:', error)
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

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`

    return date.toLocaleDateString('fr-FR', {
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
      <div className="page-container">
        <div className="skeleton h-5 w-24 mb-6"></div>
        <div className="skeleton h-32 rounded-3xl mb-6"></div>
        <div className="space-y-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="card overflow-hidden">
              <div className="p-5">
                <div className="flex gap-4">
                  <div className="skeleton w-12 h-12 rounded-xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="skeleton h-5 w-32"></div>
                    <div className="skeleton h-4 w-24"></div>
                  </div>
                </div>
              </div>
              <div className="skeleton h-56"></div>
            </div>
          ))}
        </div>
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
      <div className="card-water p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="relative">
          <h1 className="font-display text-2xl font-bold text-white">Galerie</h1>
          <p className="text-white/70 text-sm mt-1">{competition.name}</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{sessions.length} session{sessions.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>{catches.length} capture{catches.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="card p-10">
          <div className="empty-state">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-navy-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="empty-state-title">La galerie est vide</h3>
            <p className="empty-state-text mb-6">
              Soyez le premier à capturer un poisson !
            </p>
            {competition.status === 'active' && (
              <Link
                href={`/competitions/${competitionId}/catches`}
                className="btn-success"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                Enregistrer une capture
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
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
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Session Header - Social style */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {session.avatar_url ? (
                      <img
                        src={session.avatar_url}
                        alt={session.user_name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-soft"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-water-500 to-water-700 flex items-center justify-center text-white font-display font-bold shadow-soft">
                        {getInitials(session.user_name)}
                      </div>
                    )}

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-navy-900 truncate">
                        {session.user_name}
                      </h3>
                      <p className="text-sm text-navy-500">
                        {formatDateTime(session.recorded_at)}
                      </p>
                    </div>

                    {/* Fish count badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-100 text-forest-700 rounded-full font-display font-bold text-sm">
                      <span>{totalFish}</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Stats row */}
                  {(sizes.length > 0 || lures.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {biggestSize && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-water-100 text-water-700 rounded-lg text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span>Record: {biggestSize} cm</span>
                        </div>
                      )}
                      {sizes.length > 1 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-100 text-navy-600 rounded-lg text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>{sizes.length} mesurés</span>
                        </div>
                      )}
                      {lures.slice(0, 2).map((lure: string, idx: number) => (
                        <div key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-100 text-gold-700 rounded-lg text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span>{lure}</span>
                        </div>
                      ))}
                      {lures.length > 2 && (
                        <div className="inline-flex items-center px-3 py-1.5 bg-navy-50 text-navy-500 rounded-lg text-sm">
                          +{lures.length - 2}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sizes detail */}
                  {sizes.length > 0 && (
                    <div className="mt-4 p-3 bg-navy-50 rounded-xl">
                      <p className="text-xs font-medium text-navy-500 mb-2 uppercase tracking-wide">Tailles enregistrées</p>
                      <div className="flex flex-wrap gap-1.5">
                        {sizes.map((size: number, idx: number) => (
                          <span
                            key={idx}
                            className={`inline-block px-2.5 py-1 rounded-lg text-sm font-display font-semibold ${
                              idx === 0 ? 'bg-water-500 text-white' : 'bg-white text-navy-700 shadow-sm'
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
                      alt="Capture"
                      className="w-full h-auto object-cover max-h-[400px]"
                    />
                    {/* Gradient overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Quick action FAB */}
      {competition.status === 'active' && sessions.length > 0 && (
        <div className="fixed bottom-6 right-6 z-20">
          <Link
            href={`/competitions/${competitionId}/catches`}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest-500 to-forest-600 text-white shadow-lg shadow-forest-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}
