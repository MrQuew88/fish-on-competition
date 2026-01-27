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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

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

  const isActive = (path: string) => {
    if (path === '/competitions') {
      return pathname === '/competitions' || pathname?.startsWith('/competitions/')
    }
    return pathname === path
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16 md:h-[72px]">
            {/* Logo */}
            <Link href="/competitions" className="flex items-center gap-3 group">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-water-deep to-water-surface bg-clip-text text-transparent">
                Fish On
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/competitions"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/competitions')
                    ? 'text-white bg-gradient-to-r from-water-deep via-merged-teal-gold to-water-mid shadow-sm'
                    : 'text-slate-600 hover:text-primary hover:bg-primary-light'
                }`}
              >
                Compétitions
              </Link>
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive('/profile')
                    ? 'bg-primary-light'
                    : 'hover:bg-slate-50'
                }`}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-8 w-8 rounded-full ring-2 ring-slate-200 object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full ring-2 ring-slate-200 bg-primary flex items-center justify-center text-xs text-white font-medium">
                    {getInitials(profile?.name)}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-900 hidden lg:block">
                  {profile?.name?.split(' ')[0] || 'Profil'}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                title="Déconnexion"
                aria-label="Déconnexion"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors duration-200"
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <span className="text-lg font-semibold text-slate-900">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
              aria-label="Fermer le menu"
            >
              <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 border-b border-slate-200">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-14 w-14 rounded-xl ring-2 ring-slate-200 object-cover shadow-sm"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl ring-2 ring-slate-200 bg-gradient-to-br from-water-deep via-merged-teal-gold to-water-mid flex items-center justify-center text-lg text-white font-semibold shadow-sm">
                  {getInitials(profile?.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 truncate">
                  {profile?.name || 'Utilisateur'}
                </div>
                <div className="text-sm text-slate-500 truncate">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-6 space-y-2">
            <Link
              href="/competitions"
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                isActive('/competitions')
                  ? 'text-white bg-gradient-to-r from-water-deep via-merged-teal-gold to-water-mid shadow-md'
                  : 'text-slate-700 hover:text-primary hover:bg-primary-light'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  isActive('/competitions')
                    ? 'bg-white/20'
                    : 'bg-gradient-to-br from-primary-light to-primary/10'
                }`}>
                  <svg className={`w-5 h-5 ${isActive('/competitions') ? 'text-white' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span>Mes Compétitions</span>
              </div>
            </Link>

            <Link
              href="/profile"
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                isActive('/profile')
                  ? 'text-white bg-gradient-to-r from-water-deep via-merged-teal-gold to-water-mid shadow-md'
                  : 'text-slate-700 hover:text-primary hover:bg-primary-light'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  isActive('/profile')
                    ? 'bg-white/20'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200'
                }`}>
                  <svg className={`w-5 h-5 ${isActive('/profile') ? 'text-white' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>Mon Profil</span>
              </div>
            </Link>
          </nav>

          {/* Logout Button */}
          <div className="p-6 pt-0 border-t border-slate-200 mt-auto">
            <div className="pt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-slate-200 hover:border-primary text-slate-700 hover:text-primary rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
