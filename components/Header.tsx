'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (pathname === '/login' || pathname === '/signup' || pathname === '/' || pathname?.startsWith('/invite/')) {
    return null
  }

  if (!user) {
    return null
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <header className="header">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/competitions" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-depth-800 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M9 8h1m4 0h1m-5 4h1m4 0h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
              </svg>
            </div>
            <span className="text-display text-base">Fish On!</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-earth-100 transition-colors"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-7 h-7 avatar avatar-ring"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-depth-700 flex items-center justify-center text-2xs text-white font-semibold">
                  {getInitials(profile?.name)}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-depth-700">
                {profile?.name?.split(' ')[0] || 'Profil'}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-depth-400 hover:text-depth-600 hover:bg-earth-100 transition-colors"
              title="Deconnexion"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
