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
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-navy-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-hero"></div>

        {/* Animated wave pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path
              fill="rgba(56, 178, 172, 0.3)"
              d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,144C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              className="animate-wave"
            />
            <path
              fill="rgba(56, 178, 172, 0.2)"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              style={{ animationDelay: '0.5s' }}
              className="animate-wave"
            />
          </svg>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-lg mx-auto px-6 pt-20 pb-28">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-strong mb-8 animate-bounce-in">
              <svg className="w-10 h-10 text-water-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313-12.454z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 8.5c-1.5-1.5-3-2-5.5-2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5.5 2 6.5 5" />
              </svg>
            </div>

            {/* Title */}
            <h1
              className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4 animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              Fish On!
            </h1>

            {/* Subtitle */}
            <p
              className="text-water-200 text-lg max-w-sm mx-auto mb-10 leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              La compétition de pêche entre amis. Enregistrez vos prises, suivez le classement en direct.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col gap-4 max-w-xs mx-auto animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <Link
                href="/signup"
                className="btn btn-lg bg-white text-navy-900 shadow-strong hover:shadow-glow-water hover:-translate-y-1 transition-all duration-300"
              >
                <span>Commencer gratuitement</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="btn btn-lg bg-white/10 text-white border-2 border-white/20 backdrop-blur-sm hover:bg-white/20 hover:border-white/30"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-lg mx-auto px-6 py-16 -mt-8">
        {/* Feature Cards */}
        <div className="space-y-4">
          {/* Feature 1 */}
          <div
            className="card p-6 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-water-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-water-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-navy-900 mb-1">
                  Enregistrez vos prises
                </h3>
                <p className="text-navy-500 text-sm leading-relaxed">
                  Ajoutez chaque capture avec la taille, le leurre utilisé et une photo pour constituer votre palmarès.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div
            className="card p-6 animate-slide-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gold-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-navy-900 mb-1">
                  Classement en direct
                </h3>
                <p className="text-navy-500 text-sm leading-relaxed">
                  Suivez votre position et celle de vos adversaires en temps réel tout au long de la compétition.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div
            className="card p-6 animate-slide-up"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-forest-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-navy-900 mb-1">
                  Invitez vos amis
                </h3>
                <p className="text-navy-500 text-sm leading-relaxed">
                  Créez une compétition privée et invitez vos compagnons de pêche par email. Fun garanti !
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats/Social proof */}
        <div
          className="mt-12 grid grid-cols-3 gap-4 animate-fade-in"
          style={{ animationDelay: '0.7s' }}
        >
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-navy-900">100%</div>
            <div className="text-xs text-navy-500 font-medium">Gratuit</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-water-600">Mobile</div>
            <div className="text-xs text-navy-500 font-medium">Optimisé</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-navy-900">Fun</div>
            <div className="text-xs text-navy-500 font-medium">Entre amis</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-navy-100">
        <p className="text-sm text-navy-400">
          Conçu pour les passionnés de pêche sportive
        </p>
        <p className="text-xs text-navy-300 mt-1">
          Brochet • Sandre • Black Bass
        </p>
      </div>
    </main>
  )
}
