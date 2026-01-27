'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Competition, Participant } from '@/types'
import Link from 'next/link'

export default function CompetitionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const competitionId = params.id as string

  const [competition, setCompetition] = useState<Competition | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreator, setIsCreator] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-teal-50/30 relative">
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: grainTexture }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8">
          <div className="h-5 w-28 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-56 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-teal-50/30 relative">
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: grainTexture }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4 shadow-md">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Compétition introuvable</h3>
              <p className="text-base text-slate-600 mb-6">Cette compétition n'existe pas ou a été supprimée</p>
              <Link
                href="/competitions"
                className="inline-flex items-center justify-center bg-gradient-to-br from-[#0A4F4C] to-[#065F46] hover:from-[#0D6963] hover:to-[#047857] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105"
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 backdrop-blur-sm mb-4 shadow-sm">
          {/* Animated dot with ping effect */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
            <div className="h-2 w-2 rounded-full bg-emerald-400 relative z-10"></div>
          </div>
          <span className="text-sm font-semibold text-emerald-50">En cours</span>
        </div>
      )
    }
    if (competition.status === 'finished') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-400/20 border border-slate-400/30 backdrop-blur-sm mb-4 shadow-sm">
          <span className="text-sm font-semibold text-slate-200">Terminée</span>
        </div>
      )
    }
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 backdrop-blur-sm mb-4 shadow-sm">
        <span className="text-sm font-semibold text-amber-200">Brouillon</span>
      </div>
    )
  }

  // For draft status, we use a lighter hero card
  const isDraft = competition.status === 'draft'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-teal-50/30 relative">
      {/* Keyframes for animations */}
      <style dangerouslySetInnerHTML={{ __html: entranceAnimation }} />

      {/* Page grain texture - enhanced visibility */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: grainTexture }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Back button - enhanced animation */}
        <Link
          href="/competitions"
          className="flex items-center gap-2 text-slate-600 hover:text-[#0A4F4C] transition-all duration-200 group mb-6"
        >
          <svg className="h-5 w-5 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium group-hover:translate-x-0.5 transition-transform duration-200">Compétitions</span>
        </Link>

        {/* Hero Card */}
        {isDraft ? (
          // Draft: lighter hero card
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-8 shadow-lg">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 mb-4 shadow-sm">
                <span className="text-sm font-semibold text-amber-700">Brouillon</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-3">
                {competition.name}
              </h1>
              {competition.species && (
                <p className="text-xl font-medium text-slate-600 mb-6">
                  {competition.species}
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-slate-600">
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
                <p className="mt-4 pt-4 border-t border-slate-200 text-slate-600 text-base">
                  {competition.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          // Active/Finished: dramatic dark hero card
          <div className="relative overflow-hidden bg-gradient-to-br from-[#064E3B] via-[#0A4F4C] to-[#065F46] rounded-2xl p-8 shadow-2xl">
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
                <p className="text-xl font-medium text-teal-100 mb-6">
                  {competition.species}
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-teal-100/90">
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
                <p className="mt-4 pt-4 border-t border-white/10 text-teal-50 text-base">
                  {competition.description}
                </p>
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
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 group-hover:blur-xl transition-all duration-500"></div>

            <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300/50 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Récompense</div>
                  <div className="text-2xl font-bold text-amber-900">{competition.prize}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions - Active with colored icons */}
        {competition.status === 'active' && (
          <div
            className="grid grid-cols-3 gap-4"
            style={{ animation: 'slideInUp 0.5s ease-out 0.3s both' }}
          >
            {/* Capturer - Teal */}
            <Link
              href={`/competitions/${competitionId}/catches`}
              className="group relative bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-xl hover:border-teal-300/50 transition-all duration-300 ease-out hover:scale-105"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-100/50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>

              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:rotate-3">
                  <svg className="h-7 w-7 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-slate-900">Capturer</span>
              </div>
            </Link>

            {/* Classement - Orange */}
            <Link
              href={`/competitions/${competitionId}/leaderboard`}
              className="group relative bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-xl hover:border-orange-300/50 transition-all duration-300 ease-out hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-100/50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>

              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:rotate-3">
                  <svg className="h-7 w-7 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-slate-900">Classement</span>
              </div>
            </Link>

            {/* Galerie - Sky Blue */}
            <Link
              href={`/competitions/${competitionId}/captures`}
              className="group relative bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-xl hover:border-sky-300/50 transition-all duration-300 ease-out hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50/0 to-sky-100/50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>

              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:rotate-3">
                  <svg className="h-7 w-7 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-slate-900">Galerie</span>
              </div>
            </Link>
          </div>
        )}

        {/* Finished - Results CTA */}
        {competition.status === 'finished' && (
          <Link
            href={`/competitions/${competitionId}/results`}
            className="group relative bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-xl hover:border-[#0A4F4C]/30 transition-all duration-300 ease-out block"
            style={{ animation: 'slideInUp 0.5s ease-out 0.3s both' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#E6F2F1]/0 to-[#E6F2F1]/50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">Résultats finaux</p>
                  <p className="text-sm text-slate-500">Voir le classement complet</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-slate-400 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}

        {/* Participants - Glass effect with enhanced avatars */}
        <div
          className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
          style={{ animation: 'slideInUp 0.5s ease-out 0.45s both' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Participants</h2>
            {isCreator && competition.status === 'draft' && (
              <Link
                href={`/competitions/${competitionId}/invite`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A4F4C] hover:text-[#0D6963] transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Inviter
              </Link>
            )}
          </div>

          {acceptedParticipants.length === 0 ? (
            <p className="text-base text-slate-500 text-center py-8">
              Aucun participant confirmé
            </p>
          ) : (
            <div className="space-y-2">
              {acceptedParticipants.map((participant: any) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all duration-200 group"
                >
                  {/* Avatar with enhanced hover */}
                  <div className="relative">
                    {participant.profiles?.avatar_url ? (
                      <img
                        src={participant.profiles.avatar_url}
                        alt=""
                        className="h-14 w-14 rounded-full ring-2 ring-slate-200 group-hover:ring-[#0A4F4C] transition-all duration-300 group-hover:scale-105 object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full ring-2 ring-slate-200 group-hover:ring-[#0A4F4C] bg-[#0A4F4C] flex items-center justify-center text-base text-white font-semibold transition-all duration-300 group-hover:scale-105">
                        {getInitials(participant.profiles?.name)}
                      </div>
                    )}
                  </div>
                  <span className="text-xl font-semibold text-slate-900">
                    {participant.profiles?.name || 'Participant'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {pendingParticipants.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                En attente ({pendingParticipants.length})
              </p>
              <div className="flex -space-x-2">
                {pendingParticipants.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    className="h-12 w-12 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center hover:scale-110 hover:z-10 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ))}
                {pendingParticipants.length > 6 && (
                  <div className="h-12 w-12 rounded-full bg-slate-100 ring-2 ring-white flex items-center justify-center text-sm font-semibold text-slate-600 hover:scale-110 hover:z-10 transition-all duration-200">
                    +{pendingParticipants.length - 6}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rules - Glass effect with colored icons */}
        <div
          className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
          style={{ animation: 'slideInUp 0.5s ease-out 0.6s both' }}
        >
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">Règles</h2>
          <div className="space-y-2">
            {/* Total count rule - Teal */}
            {competition.rule_total_count && (
              <div className="flex items-center gap-4 p-4 group">
                <div className="relative flex-shrink-0">
                  {/* Shadow layer for depth */}
                  <div className="absolute inset-0 bg-[#0A4F4C]/20 rounded-xl blur-md"></div>
                  <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-[#E6F2F1] via-teal-50 to-[#0A4F4C]/10 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    <svg className="h-7 w-7 text-[#0A4F4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                </div>
                <span className="text-lg font-semibold text-slate-900">Nombre total de prises</span>
              </div>
            )}
            {/* Record size rule - Orange */}
            {competition.rule_record_size && (
              <div className="flex items-center gap-4 p-4 group">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-md"></div>
                  <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-orange-50 via-orange-100/50 to-orange-500/10 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    <svg className="h-7 w-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                </div>
                <span className="text-lg font-semibold text-slate-900">Plus grosse prise</span>
              </div>
            )}
            {/* Top X biggest rule - Amber */}
            {competition.rule_top_x_biggest && (
              <div className="flex items-center gap-4 p-4 group">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-md"></div>
                  <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-amber-50 via-amber-100/50 to-amber-500/10 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    <svg className="h-7 w-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <span className="text-lg font-semibold text-slate-900">Top {competition.rule_top_x_biggest} combinés</span>
              </div>
            )}
            {!competition.rule_total_count && !competition.rule_record_size && !competition.rule_top_x_biggest && (
              <p className="text-base text-slate-500 py-4">Aucune règle définie</p>
            )}
          </div>
        </div>

        {/* Creator Actions */}
        {isCreator && (
          <div className="space-y-4">
            {competition.status === 'draft' && acceptedParticipants.length >= 2 && (
              <button
                onClick={handleStartCompetition}
                disabled={actionLoading}
                className="w-full bg-gradient-to-br from-[#0A4F4C] to-[#065F46] hover:from-[#0D6963] hover:to-[#047857] active:from-[#083D3A] active:to-[#064E3B] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] flex items-center justify-center gap-3"
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
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 text-center shadow-md">
                <p className="text-base text-slate-500">
                  Minimum 2 participants requis pour commencer
                </p>
              </div>
            )}

            {competition.status === 'active' && (
              <button
                onClick={handleFinishCompetition}
                disabled={actionLoading}
                className="w-full bg-white border-2 border-slate-300 hover:border-[#0A4F4C] text-slate-700 hover:text-[#0A4F4C] font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3"
              >
                {actionLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
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

        {/* FAB with glow effect and entrance animation */}
        {competition.status === 'active' && (
          <div
            className="fixed bottom-6 right-6 group"
            style={{ animation: 'slideInUp 0.5s ease-out 0.3s both' }}
          >
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#0A4F4C] to-[#065F46] rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

            <Link
              href={`/competitions/${competitionId}/catches`}
              className="relative bg-gradient-to-br from-[#0A4F4C] to-[#065F46] hover:from-[#0D6963] hover:to-[#047857] text-white rounded-full h-16 w-16 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:scale-110"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
