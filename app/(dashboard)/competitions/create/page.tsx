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
          species: 'Brochet',
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
        console.error('Erreur ajout participant:', participantError)
      }

      router.push('/competitions')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container form-container">
      {/* Back link */}
      <Link href="/competitions" className="back-link">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Mes compétitions
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-water-gradient rounded-2xl shadow-water-lg mb-4">
          <span className="text-3xl">🏆</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-navy-900">
          Nouvelle compétition
        </h1>
        <p className="text-navy-500 mt-1">Créez votre défi entre amis</p>
      </div>

      {error && (
        <div className="alert alert-error mb-6 animate-scale-in">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="section-header flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-water-100 flex items-center justify-center text-sm">📝</span>
            Informations
          </h2>

          <div className="space-y-4">
            <div>
              <label className="label">Nom de la compétition *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Irish Pike Challenge 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date de début *</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Date de fin *</label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Lieu *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder="Lough Corrib, Irlande"
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[100px] resize-none"
                rows={4}
                placeholder="Une semaine de pêche au brochet entre amis..."
              />
            </div>

            <div>
              <label className="label">Récompense</label>
              <input
                type="text"
                value={formData.prize}
                onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                className="input"
                placeholder="Trophée + dîner offert"
              />
            </div>

            <div>
              <label className="label">Nombre de participants max *</label>
              <input
                type="number"
                required
                min="2"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="card p-6">
          <h2 className="section-header flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-sm">📏</span>
            Règles du jeu
          </h2>

          <div className="space-y-4">
            {/* Total Count */}
            <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-transparent hover:border-navy-200 hover:bg-navy-50 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={formData.rule_total_count}
                onChange={(e) => setFormData({ ...formData, rule_total_count: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded border-navy-300 text-water-600 focus:ring-water-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐟</span>
                  <span className="font-display font-semibold text-navy-900">Nombre total de poissons</span>
                </div>
                <p className="text-sm text-navy-500 mt-1">
                  Comptabilise le nombre total de poissons attrapés par chaque participant
                </p>
              </div>
            </label>

            {/* Record Size */}
            <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-transparent hover:border-navy-200 hover:bg-navy-50 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={formData.rule_record_size}
                onChange={(e) => setFormData({ ...formData, rule_record_size: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded border-navy-300 text-water-600 focus:ring-water-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📏</span>
                  <span className="font-display font-semibold text-navy-900">Poisson record</span>
                </div>
                <p className="text-sm text-navy-500 mt-1">
                  Le plus grand poisson de chaque participant compte pour le classement
                </p>
              </div>
            </label>

            {/* Top X */}
            <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-transparent hover:border-navy-200 hover:bg-navy-50 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={formData.rule_top_x_biggest !== null}
                onChange={(e) => setFormData({
                  ...formData,
                  rule_top_x_biggest: e.target.checked ? 5 : null
                })}
                className="w-5 h-5 mt-0.5 rounded border-navy-300 text-water-600 focus:ring-water-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <span className="font-display font-semibold text-navy-900">Top 5 plus gros</span>
                </div>
                <p className="text-sm text-navy-500 mt-1">
                  Cumul des tailles des 5 plus gros poissons de chaque participant
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/competitions')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Création...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer la compétition
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
