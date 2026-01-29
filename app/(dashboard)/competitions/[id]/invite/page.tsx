'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function InvitePage() {
  const router = useRouter()
  const params = useParams()
  const competitionId = params.id as string

  const [emails, setEmails] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [competition, setCompetition] = useState<any>(null)

  useEffect(() => {
    loadCompetition()
  }, [])

  const loadCompetition = async () => {
    const { data } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', competitionId)
      .single()

    setCompetition(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Vous devez être connecté')
        setLoading(false)
        return
      }

      const emailList = emails
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email.length > 0)

      if (emailList.length === 0) {
        setError('Veuillez saisir au moins un email')
        setLoading(false)
        return
      }

      let acceptedCount = 0
      let invitedCount = 0

      for (const email of emailList) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', email)
          .single()

        const token = crypto.randomUUID()

        if (existingProfile) {
          const { error: partError } = await supabase
            .from('participants')
            .insert({
              competition_id: competitionId,
              user_id: existingProfile.id,
              invitation_token: token,
              status: 'accepted',
              joined_at: new Date().toISOString(),
            })
          if (partError) {
            console.error('Error creating participant:', partError)
            continue
          }
          acceptedCount++
        } else {
          const { error: partError } = await supabase
            .from('participants')
            .insert({
              competition_id: competitionId,
              invitation_token: token,
              status: 'invited',
            })
          if (partError) {
            console.error('Error creating participant:', partError)
            continue
          }
          invitedCount++

          try {
            await fetch('/api/send-invitation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                token,
                competition: {
                  name: competition.name,
                  start_date: competition.start_date,
                  end_date: competition.end_date,
                  location: competition.location,
                  species: competition.species,
                  prize: competition.prize,
                },
              }),
            })
          } catch (emailError) {
            console.error('Error sending email:', emailError)
          }
        }
      }

      const message = []
      if (acceptedCount > 0) message.push(`${acceptedCount} participant(s) ajouté(s)`)
      if (invitedCount > 0) message.push(`${invitedCount} invitation(s) envoyée(s)`)

      setSuccess(message.join(' et '))
      setEmails('')

      setTimeout(() => {
        router.push(`/competitions/${competitionId}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container-narrow">
      {/* Back link */}
      <Link href={`/competitions/${competitionId}`} className="back-btn">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-700 rounded-xl mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">
          Inviter des participants
        </h1>
        {competition && (
          <p className="text-slate-500 text-sm mt-1">{competition.name}</p>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error mb-4 animate-slide-up">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p>{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-semibold text-slate-900">Adresses email</h2>
          </div>

          <div>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              required
              rows={6}
              className="input resize-none min-h-[140px]"
              placeholder="jean@exemple.com&#10;marie@exemple.com&#10;pierre@exemple.com"
            />
            <p className="helper-text">
              Saisissez un email par ligne ou séparez-les par des virgules
            </p>
          </div>
        </div>

        {/* Info box */}
        <div className="card p-4 mb-4 bg-teal-50 border-teal-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm">
              <p className="font-medium text-teal-800 mb-1">Comment ça marche</p>
              <ul className="text-teal-700 space-y-1">
                <li>Si l'email correspond à un compte existant, la personne sera ajoutée directement</li>
                <li>Sinon, une invitation par email sera envoyée</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`/competitions/${competitionId}`)}
            className="btn-ghost"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner-light"></span>
                Envoi...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Envoyer les invitations
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
