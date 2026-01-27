'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function CreateCompetitionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<{
    name: string
    start_date: string
    end_date: string
    description: string
    prize: string
    location: string
    max_participants: number
    rule_top_x_biggest: number | null
    rule_total_count: boolean
    rule_record_size: boolean
  }>({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
    prize: '',
    location: '',
    max_participants: 10,
    rule_top_x_biggest: 5,
    rule_total_count: true,
    rule_record_size: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      setError('La date de fin doit être après la date de début')
      setLoading(false)
      return
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        setError('Vous devez être connecté')
        setLoading(false)
        return
      }

      const { data, error: insertError } = await supabase
        .from('competitions')
        .insert({
          creator_id: user.id,
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description || null,
          prize: formData.prize || null,
          species: 'Pike',
          location: formData.location,
          max_participants: formData.max_participants,
          status: 'draft',
          rule_top_x_biggest: formData.rule_top_x_biggest || null,
          rule_total_count: formData.rule_total_count || false,
          rule_record_size: formData.rule_record_size || false,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          competition_id: data.id,
          user_id: user.id,
          invitation_token: crypto.randomUUID(),
          status: 'accepted',
          joined_at: new Date().toISOString(),
        })

      if (participantError) {
        console.error('Error adding participant:', participantError)
      }

      router.push('/competitions')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: entranceAnimation }} />

      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-[#E6F2F1] to-slate-100" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: grainTexture }}
        />
      </div>

      <div className="min-h-screen px-4 py-6 md:py-10">
        <div className="max-w-xl mx-auto">
          {/* Back link */}
          <Link
            href="/competitions"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#0A4F4C] mb-6 group transition-colors duration-200"
            style={{ animation: 'slideInUp 0.4s ease-out forwards' }}
          >
            <div className="w-8 h-8 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200/80 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-[#0A4F4C]/30 transition-all duration-200">
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-sm font-medium">Compétitions</span>
          </Link>

          {/* Header */}
          <div
            className="text-center mb-8"
            style={{ animation: 'slideInUp 0.4s ease-out 0.1s forwards', opacity: 0 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0A4F4C] to-[#065F46] rounded-2xl mb-4 shadow-lg shadow-[#0A4F4C]/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Nouvelle compétition
            </h1>
            <p className="text-slate-500 mt-1">Créez un défi pour vos amis pêcheurs</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              style={{ animation: 'slideInUp 0.3s ease-out forwards' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info Card */}
            <div
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/5 overflow-hidden"
              style={{ animation: 'slideInUp 0.4s ease-out 0.2s forwards', opacity: 0 }}
            >
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A4F4C]/10 to-[#0A4F4C]/5 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#0A4F4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">Informations</h2>
                    <p className="text-xs text-slate-500">Détails de la compétition</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nom de la compétition <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A4F4C] focus:ring-2 focus:ring-[#0A4F4C]/20 transition-all duration-200"
                    placeholder="Challenge Brochet Irlande 2026"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Date de début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#0A4F4C] focus:ring-2 focus:ring-[#0A4F4C]/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Date de fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#0A4F4C] focus:ring-2 focus:ring-[#0A4F4C]/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Lieu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A4F4C] focus:ring-2 focus:ring-[#0A4F4C]/20 transition-all duration-200"
                    placeholder="Lough Corrib, Irlande"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A4F4C] focus:ring-2 focus:ring-[#0A4F4C]/20 transition-all duration-200 resize-none"
                    rows={3}
                    placeholder="Une semaine de pêche au brochet entre amis..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Récompense
                  </label>
                  <input
                    type="text"
                    value={formData.prize}
                    onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A4F4C] focus:ring-2 focus:ring-[#0A4F4C]/20 transition-all duration-200"
                    placeholder="Trophée + dîner offert"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Participants max <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="2"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#0A4F4C] focus:ring-2 focus:ring-[#0A4F4C]/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Rules Card */}
            <div
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/5 overflow-hidden"
              style={{ animation: 'slideInUp 0.4s ease-out 0.3s forwards', opacity: 0 }}
            >
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">Règles de classement</h2>
                    <p className="text-xs text-slate-500">Méthodes de comptage des points</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {/* Total Count Rule */}
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  formData.rule_total_count
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={formData.rule_total_count}
                      onChange={(e) => setFormData({ ...formData, rule_total_count: e.target.checked })}
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          formData.rule_total_count
                            ? 'bg-emerald-500/20'
                            : 'bg-emerald-500/10'
                        }`}>
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                        </div>
                        <span className="font-medium text-slate-900">Nombre total</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-2 ml-10">
                        Comptabilise le nombre total de prises par participant
                      </p>
                    </div>
                  </div>
                </label>

                {/* Record Size Rule */}
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  formData.rule_record_size
                    ? 'border-[#0A4F4C] bg-[#E6F2F1]/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={formData.rule_record_size}
                      onChange={(e) => setFormData({ ...formData, rule_record_size: e.target.checked })}
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-[#0A4F4C] focus:ring-[#0A4F4C]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          formData.rule_record_size
                            ? 'bg-[#0A4F4C]/20'
                            : 'bg-[#0A4F4C]/10'
                        }`}>
                          <svg className="w-4 h-4 text-[#0A4F4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        </div>
                        <span className="font-medium text-slate-900">Plus grosse prise</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-2 ml-10">
                        La plus grande prise de chaque participant compte
                      </p>
                    </div>
                  </div>
                </label>

                {/* Top X Rule */}
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  formData.rule_top_x_biggest !== null
                    ? 'border-amber-500 bg-amber-50/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={formData.rule_top_x_biggest !== null}
                      onChange={(e) => setFormData({
                        ...formData,
                        rule_top_x_biggest: e.target.checked ? 5 : null
                      })}
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          formData.rule_top_x_biggest !== null
                            ? 'bg-amber-500/20'
                            : 'bg-amber-500/10'
                        }`}>
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <span className="font-medium text-slate-900">Top 5 combiné</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-2 ml-10">
                        Somme des 5 plus grosses prises par participant
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex gap-3 pt-2"
              style={{ animation: 'slideInUp 0.4s ease-out 0.4s forwards', opacity: 0 }}
            >
              <button
                type="button"
                onClick={() => router.push('/competitions')}
                className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0A4F4C] to-[#065F46] text-white rounded-xl font-semibold shadow-lg shadow-[#0A4F4C]/25 hover:shadow-xl hover:shadow-[#0A4F4C]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Créer la compétition</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
