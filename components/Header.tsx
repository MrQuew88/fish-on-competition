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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

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
    setMobileMenuOpen(false)
    router.push('/login')
  }

  // Hide header on public pages
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
    <>
      <header className="header">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/competitions" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-water rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow-water transition-shadow">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313-12.454z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 8.5c-1.5-1.5-3-2-5.5-2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5.5 2 6.5 5" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold text-navy-900">Fish On!</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-navy-100 transition-colors"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-white shadow-soft"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-water flex items-center justify-center text-xs text-white font-bold">
                    {getInitials(profile?.name)}
                  </div>
                )}
                <span className="text-sm font-semibold text-navy-700">
                  {profile?.name?.split(' ')[0] || 'Profil'}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="btn-icon"
                title="Déconnexion"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden btn-icon"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="sm:hidden fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="sm:hidden fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-strong animate-slide-down">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-navy-100">
                <span className="font-display text-lg font-bold text-navy-900">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-icon"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="p-5 bg-navy-50 border-b border-navy-100">
                <div className="flex items-center gap-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover ring-3 ring-white shadow-soft"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-water flex items-center justify-center text-lg text-white font-bold">
                      {getInitials(profile?.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-navy-900 truncate">
                      {profile?.name || 'Utilisateur'}
                    </div>
                    <div className="text-sm text-navy-500 truncate">{user?.email}</div>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4 space-y-1">
                <Link
                  href="/competitions"
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-navy-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-water-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-water-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="font-semibold text-navy-700">Mes compétitions</span>
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-navy-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-navy-700">Mon profil</span>
                </Link>
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-navy-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-navy-100 text-navy-700 rounded-xl hover:bg-navy-200 transition-colors font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
