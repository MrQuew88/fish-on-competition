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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-700 rounded-xl mb-8">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
              Fish On
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-slate-600 max-w-md mx-auto mb-10 leading-relaxed">
              Track your fishing competitions with friends. Log catches, view live leaderboards, and celebrate victories.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-sm mx-auto sm:max-w-none">
              <Link
                href="/signup"
                className="btn-primary btn-lg"
              >
                Get started free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="btn-secondary btn-lg"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Feature 1 */}
          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Log your catches
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Record each catch with size, lure, and photos to build your personal record.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Live leaderboard
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Track your position and your competitors in real-time throughout the competition.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Invite friends
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Create private competitions and invite your fishing buddies via email.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-semibold text-slate-900">Free</div>
            <div className="text-sm text-slate-500 mt-1">Forever</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-teal-700">Mobile</div>
            <div className="text-sm text-slate-500 mt-1">Optimized</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-900">Fun</div>
            <div className="text-sm text-slate-500 mt-1">With friends</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 py-8 text-center">
        <p className="text-sm text-slate-500">
          Built for sport fishing enthusiasts
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Pike &bull; Walleye &bull; Bass
        </p>
      </div>
    </main>
  )
}
