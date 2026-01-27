'use client'

import Link from 'next/link'
import Image from 'next/image'
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      {/* Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.7s ease-out forwards; }
        .animate-fade-in-down { animation: fadeInDown 0.7s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.7s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.6s ease-out forwards; }
      `}} />

      {/* Hero Image Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/splash-hero.webp"
          alt="Compétition de pêche entre amis au lever du soleil"
          fill
          priority
          quality={90}
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/20 to-slate-900/80" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-between min-h-screen px-6 py-12 text-center">

        {/* Top Section - Logo & Brand */}
        <div
          className="pt-4 sm:pt-8 opacity-0 animate-fade-in-down"
          style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
        >
          <div className="inline-flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <svg className="h-8 w-8 md:h-10 md:w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-4 tracking-tight drop-shadow-2xl">
            Fish On!
          </h1>
        </div>

        {/* Middle Section - Hero Message */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl py-8">
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl leading-tight opacity-0 animate-fade-in-up"
            style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
          >
            Compétitions de pêche entre amis
          </h2>

          <p
            className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-lg max-w-lg leading-relaxed opacity-0 animate-fade-in-up"
            style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
          >
            Suivez vos prises, défiez vos amis, célébrez vos records
          </p>

          {/* Feature badges */}
          <div
            className="flex flex-wrap items-center justify-center gap-3 text-sm md:text-base opacity-0 animate-fade-in-up"
            style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 font-medium">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Photos de prises</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 font-medium">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span>Classements en direct</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 font-medium">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Entre amis</span>
            </div>
          </div>
        </div>

        {/* Bottom Section - CTA */}
        <div
          className="w-full max-w-md space-y-4 mb-4 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}
        >
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 w-full bg-white hover:bg-white/95 text-water-deep font-bold py-4 px-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] text-lg"
          >
            <span>Commencer</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center w-full border-2 border-white/30 hover:border-white/50 hover:bg-white/10 text-white font-semibold py-3.5 px-8 rounded-xl backdrop-blur-sm transition-all duration-300"
          >
            Se connecter
          </Link>

          {/* Trust element */}
          <p className="mt-6 text-sm text-white/60 font-medium">
            Gratuit • Simple • Entre amis
          </p>
        </div>
      </div>
    </main>
  )
}
