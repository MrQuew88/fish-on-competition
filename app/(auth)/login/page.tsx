'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/competitions')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Header gradient */}
      <div className="bg-gradient-hero h-40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              fill="rgba(56, 178, 172, 0.4)"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 -mt-20">
        <div className="animate-slide-up">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-strong hover:scale-105 transition-transform"
            >
              <svg className="w-8 h-8 text-water-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313-12.454z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 8.5c-1.5-1.5-3-2-5.5-2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5.5 2 6.5 5" />
              </svg>
            </Link>
          </div>

          {/* Form Card */}
          <div className="card-elevated p-8">
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-bold text-navy-900">
                Connexion
              </h1>
              <p className="text-navy-500 mt-2">
                Accédez à vos compétitions
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="votre@email.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="alert alert-error animate-scale-in">
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full btn-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="spinner-light"></span>
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-navy-100 text-center">
              <p className="text-sm text-navy-500">
                Pas encore de compte ?{' '}
                <Link
                  href="/signup"
                  className="font-bold text-water-600 hover:text-water-700 transition-colors"
                >
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>

          {/* Back to home */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-sm text-navy-400 hover:text-navy-600 transition-colors inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
