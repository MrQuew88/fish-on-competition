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
      setError('End date must be after start date')
      setLoading(false)
      return
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        setError('You must be logged in')
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

  return (
    <div className="page-container-narrow form-container">
      {/* Back link */}
      <Link href="/competitions" className="back-btn">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Competitions
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-700 rounded-xl mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">
          New competition
        </h1>
        <p className="text-slate-500 text-sm mt-1">Create a challenge for your friends</p>
      </div>

      {error && (
        <div className="alert alert-error mb-6 animate-scale-in">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="font-semibold text-slate-900">Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Name *</label>
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
                <label className="label">Start date *</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">End date *</label>
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
              <label className="label">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder="Lough Corrib, Ireland"
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[100px] resize-none"
                rows={4}
                placeholder="A week of pike fishing with friends..."
              />
            </div>

            <div>
              <label className="label">Prize</label>
              <input
                type="text"
                value={formData.prize}
                onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                className="input"
                placeholder="Trophy + dinner paid"
              />
            </div>

            <div>
              <label className="label">Max participants *</label>
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
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="font-semibold text-slate-900">Scoring rules</h2>
          </div>

          <div className="space-y-3">
            {/* Total Count */}
            <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={formData.rule_total_count}
                onChange={(e) => setFormData({ ...formData, rule_total_count: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-900">Total fish count</span>
                </div>
                <p className="text-sm text-slate-500 mt-2 ml-10">
                  Count total fish caught by each participant
                </p>
              </div>
            </label>

            {/* Record Size */}
            <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={formData.rule_record_size}
                onChange={(e) => setFormData({ ...formData, rule_record_size: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-900">Biggest catch</span>
                </div>
                <p className="text-sm text-slate-500 mt-2 ml-10">
                  Biggest fish of each participant counts
                </p>
              </div>
            </label>

            {/* Top X */}
            <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={formData.rule_top_x_biggest !== null}
                onChange={(e) => setFormData({
                  ...formData,
                  rule_top_x_biggest: e.target.checked ? 5 : null
                })}
                className="w-5 h-5 mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-900">Top 5 combined</span>
                </div>
                <p className="text-sm text-slate-500 mt-2 ml-10">
                  Sum of top 5 biggest fish per participant
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/competitions')}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner-light"></span>
                Creating...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create competition
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
