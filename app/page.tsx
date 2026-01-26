'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/competitions')
      } else {
        setChecking(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setChecking(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-depth-900">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-earth-50">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-depth-900 via-depth-800 to-depth-700"></div>
        <div className="absolute inset-0 bg-texture-water opacity-30"></div>

        {/* Content */}
        <div className="relative max-w-lg mx-auto px-6 pt-16 pb-20">
          <div className="text-center animate-fade-in">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-strong mb-6">
              <svg className="w-8 h-8 text-depth-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M9 8h1m4 0h1m-5 4h1m4 0h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
              </svg>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3">
              Fish On!
            </h1>

            <p className="text-depth-300 text-base max-w-xs mx-auto mb-8 leading-relaxed">
              Organisez des competitions de peche entre amis et suivez vos prises en temps reel.
            </p>

            {/* CTA */}
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link
                href="/signup"
                className="btn btn-lg bg-white text-depth-800 shadow-medium hover:shadow-strong hover:-translate-y-0.5"
              >
                Commencer
              </Link>
              <Link
                href="/login"
                className="btn btn-lg bg-depth-700/50 text-white border border-white/20 hover:bg-depth-700 hover:border-white/30"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="space-y-4">
          <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-moss-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-moss-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-display text-base mb-1">Enregistrez vos prises</h3>
                <p className="text-sm text-depth-500 leading-relaxed">
                  Ajoutez chaque capture avec taille et photo pour constituer votre palmares.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-earth-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-earth-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-display text-base mb-1">Classement en direct</h3>
                <p className="text-sm text-depth-500 leading-relaxed">
                  Suivez votre position et celle de vos adversaires tout au long de la competition.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-depth-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-depth-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-display text-base mb-1">Invitez vos amis</h3>
                <p className="text-sm text-depth-500 leading-relaxed">
                  Creez une competition privee et invitez vos compagnons de peche par email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-depth-400">
        <p>Concu pour les passionnes de peche sportive</p>
      </div>
    </main>
  )
}
