'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function InviteAcceptPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [competition, setCompetition] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [punchline, setPunchline] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadInvitation()
  }, [token])

  const loadInvitation = async () => {
    try {
      // Récupérer l'invitation
      const { data: participant, error: partError } = await supabase
        .from('participants')
        .select('*, competitions(*)')
        .eq('invitation_token', token)
        .single()

      if (partError || !participant) {
        setError('Invitation invalide ou expirée')
        setLoading(false)
        return
      }

      if (participant.status === 'accepted') {
        setError('Cette invitation a déjà été acceptée')
        setLoading(false)
        return
      }

      setCompetition(participant.competitions)
    } catch (err) {
      setError('Erreur lors du chargement de l\'invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Rediriger vers signup avec le token
        router.push(`/signup?invite=${token}&name=${encodeURIComponent(name)}&punchline=${encodeURIComponent(punchline)}`)
        return
      }

      // Mettre à jour le profil
      await supabase
        .from('profiles')
        .update({ name, punchline })
        .eq('id', user.id)

      // Accepter l'invitation
      await supabase
        .from('participants')
        .update({
          user_id: user.id,
          status: 'accepted',
          joined_at: new Date().toISOString(),
        })
        .eq('invitation_token', token)

      // Rediriger vers la compétition
      router.push(`/competitions/${competition.id}`)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p>Chargement...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border p-8">
        <h1 className="text-2xl font-bold mb-6">Invitation à une compétition</h1>

        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h2 className="font-bold text-lg">{competition.name}</h2>
          <p className="text-sm text-gray-600 mt-2">
            📅 {new Date(competition.start_date).toLocaleDateString('fr-FR')} → {new Date(competition.end_date).toLocaleDateString('fr-FR')}
          </p>
          <p className="text-sm text-gray-600">📍 {competition.location}</p>
        </div>

        <form onSubmit={handleAccept} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Votre nom *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Punchline (optionnel)</label>
            <input
              type="text"
              value={punchline}
              onChange={(e) => setPunchline(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              placeholder="Le roi du brochet"
              maxLength={100}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? 'Acceptation...' : 'Accepter l\'invitation'}
          </button>
        </form>
      </div>
    </div>
  )
}
