'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/competitions')
    }
  }

  return (
    <div className="min-h-screen bg-earth-50">
      {/* Header bar */}
      <div className="bg-moss-700 h-32"></div>

      <div className="max-w-sm mx-auto px-4 -mt-16">
        <div className="animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-medium">
              <svg className="w-7 h-7 text-moss-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M9 8h1m4 0h1m-5 4h1m4 0h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
              </svg>
            </Link>
          </div>

          {/* Form Card */}
          <div className="card-elevated p-6">
            <div className="text-center mb-6">
              <h1 className="text-display text-xl">Creer un compte</h1>
              <p className="text-sm text-depth-500 mt-1">Rejoignez Fish On! gratuitement</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="label">Votre nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="label">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input"
                  placeholder="••••••••"
                />
                <p className="helper-text">Minimum 6 caracteres</p>
              </div>

              {error && (
                <div className="alert alert-error">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-success w-full btn-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner"></span>
                    Creation...
                  </span>
                ) : (
                  'Creer mon compte'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-earth-200 text-center">
              <p className="text-sm text-depth-500">
                Deja un compte ?{' '}
                <Link href="/login" className="font-semibold text-depth-800 hover:text-depth-600">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
