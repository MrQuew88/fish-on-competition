'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  const router = useRouter()
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
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <div className="skeleton h-8 w-48 mb-6 rounded-lg"></div>
        <div className="card p-8 mb-8">
          <div className="skeleton h-10 w-2/3 mb-4 rounded-xl"></div>
          <div className="skeleton h-6 w-32 rounded"></div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6">
              <div className="flex gap-4 mb-4">
                <div className="skeleton w-12 h-12 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="skeleton h-5 w-32 rounded"></div>
                  <div className="skeleton h-4 w-24 rounded"></div>
                </div>
              </div>
              <div className="skeleton h-40 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="page-container">
        <div className="card p-12">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">
              Compétition introuvable
            </h3>
            <Link href="/competitions" className="btn-primary">
              Retour aux compétitions
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Back link */}
      <Link href={`/competitions/${competitionId}`} className="back-link">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour à la compétition
      </Link>

      {/* Header */}
      <div className="card water-bg text-white p-8 mb-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📸</span>
            <div>
              <h1 className="font-display text-3xl font-bold">Galerie des captures</h1>
              <p className="text-water-100">{competition.name}</p>
            </div>
          </div>
          <p className="text-water-200 text-sm mt-4">
            {sessions.length} session{sessions.length > 1 ? 's' : ''} de pêche
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="card p-12">
          <div className="empty-state">
            <div className="empty-state-icon">🐟</div>
            <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">
              Aucune capture pour l'instant
            </h3>
            <p className="empty-state-text mb-6">
              Soyez le premier à enregistrer une prise !
            </p>
            <Link
              href={`/competitions/${competitionId}/catches`}
              className="btn-success inline-flex items-center gap-2"
            >
              <span>🎣</span>
              Enregistrer une capture
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session: any, index: number) => {
            const totalFish = session.catches.length
            const withSize = session.catches.filter((c: any) => c.size !== null)
            const sizes = withSize.map((c: any) => c.size).sort((a: number, b: number) => b - a)
            const lures = Array.from(new Set(session.catches.filter((c: any) => c.lure).map((c: any) => c.lure))) as string[]

            return (
              <div
                key={index}
                className="card overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Session Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {session.avatar_url ? (
                        <img
                          src={session.avatar_url}
                          alt={session.user_name}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-water-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-water-gradient flex items-center justify-center text-xl text-white font-display font-bold">
                          {getInitials(session.user_name)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-display text-xl font-bold text-navy-900">
                          {session.user_name}
                        </h3>
                        <p className="text-sm text-navy-500">
                          {formatDateTime(session.recorded_at)}
                        </p>
                      </div>
                    </div>

                    {/* Fish count badge */}
                    <div className="fish-count">
                      {totalFish}
                      <span className="text-lg">🐟</span>
                    </div>
                  </div>

                  {/* Sizes */}
                  {sizes.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-display font-medium text-navy-500 mb-2">
                        Tailles enregistrées
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size: number, idx: number) => (
                          <span key={idx} className="size-badge">
                            📏 {size} cm
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lures */}
                  {lures.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-display font-medium text-navy-500 mb-2">
                        Leurres utilisés
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {lures.map((lure: string, idx: number) => (
                          <span key={idx} className="lure-badge">
                            🎣 {lure}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Photo */}
                {session.photo_url && (
                  <div className="border-t border-navy-100">
                    <img
                      src={session.photo_url}
                      alt="Capture"
                      className="w-full h-auto object-contain max-h-[500px]"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Quick action */}
      {competition.status === 'active' && (
        <div className="mt-8 flex justify-center">
          <Link
            href={`/competitions/${competitionId}/catches`}
            className="btn-success flex items-center gap-2"
          >
            <span className="text-lg">🎣</span>
            Enregistrer une capture
          </Link>
        </div>
      )}
    </div>
  )
}
