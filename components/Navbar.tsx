'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoggedIn, user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const loggedOutLinks = [
    { href: '/', label: 'Home' },
    { href: '/premiere', label: 'Premiere' },
    { href: '/demo', label: 'Free Demo' },
    { href: '/blog', label: 'Blog' },
    { href: '/games', label: 'Games' },
  ]

  const loggedInLinks = [
    { href: '/admin', label: 'Home' },
    { href: '/immersive', label: 'VR & Immersive' },
    { href: '/movies', label: 'Movies' },
    { href: '/series', label: 'Series' },
    { href: '/kids', label: 'Kids' },
    { href: '/premiere', label: 'Premiere' },
    { href: '/games', label: 'Games' },
    { href: '/my-list', label: 'My List' },
    { href: '/search', label: 'Search' },
  ]

  const onLogout = async () => {
    await logout()
    setAccountOpen(false)
    router.push('/')
  }

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isLoggedIn ? '/admin' : '/'} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-xl">
              OTT
            </div>
            <span className="text-xl font-bold hidden sm:inline">OTT Platform</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {(isLoggedIn ? loggedInLinks : loggedOutLinks).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-purple-400 transition-colors ${
                  pathname === link.href ? 'text-purple-400 font-semibold' : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-800"
                >
                  <img
                    src={user?.profile_picture || 'https://i.pravatar.cc/100?img=3'}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-300">Account</span>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <Link href="/account" className="block px-4 py-2 hover:bg-gray-100">
                      Account
                    </Link>
                    <Link href="/help" className="block px-4 py-2 hover:bg-gray-100">
                      Help
                    </Link>
                    <button
                      onClick={onLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-800">
            {(isLoggedIn ? loggedInLinks : loggedOutLinks).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
                  pathname === link.href
                    ? 'text-purple-400 bg-gray-800 font-semibold'
                    : 'text-gray-300'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isLoggedIn ? (
              <div className="px-4 pt-4 space-y-2 border-t border-gray-800">
                <Link
                  href="/login"
                  className="block w-full px-4 py-2 text-center text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
              </div>
            ) : (
              <div className="px-4 pt-4 border-t border-gray-800">
                <Link
                  href="/account"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-800"
                  onClick={() => setMobileOpen(false)}
                >
                  Account
                </Link>
                <Link
                  href="/help"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-800"
                  onClick={() => setMobileOpen(false)}
                >
                  Help
                </Link>
                <button
                  onClick={() => {
                    onLogout()
                    setMobileOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

// TODO: Replace with real auth state and avatar when backend is available.
