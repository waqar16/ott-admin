'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'

interface NavigationContextType {
  isNavigating: boolean
  pendingPath: string | null
  progress: number
  startNavigation: (href: string) => boolean
  cancelNavigation: () => void
  isPending: (href: string) => boolean
}

const NavigationLoadingContext = createContext<NavigationContextType | undefined>(undefined)

/**
 * Normalizes a URL path by removing search params, hashes, and trailing slashes.
 */
export function normalizePath(path: string): string {
  if (!path) return ''
  const clean = path.split('?')[0].split('#')[0]
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1)
  }
  return clean
}

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [pendingPath, setPendingPath] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null)
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearAllTimers = () => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current)
  }

  // Smoothly simulates indeterminate progress when navigation begins
  const startProgressAnimation = () => {
    clearAllTimers()
    setProgress(15)

    // Staged progress ticker
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 40) return prev + 12
        if (prev < 70) return prev + 6
        if (prev < 85) return prev + 2
        if (prev < 95) return prev + 0.5
        return prev
      })
    }, 150)

    // Fallback safety timeout (10 seconds) to prevent stuck spinners if navigation aborts
    safetyTimeoutRef.current = setTimeout(() => {
      cancelNavigation()
    }, 10000)
  }

  const completeNavigation = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current)

    // Snap to 100%
    setProgress(100)

    // Fade out and reset after completion animation
    resetTimerRef.current = setTimeout(() => {
      setIsNavigating(false)
      setPendingPath(null)
      setProgress(0)
    }, 250)
  }, [])

  const cancelNavigation = useCallback(() => {
    clearAllTimers()
    setIsNavigating(false)
    setPendingPath(null)
    setProgress(0)
  }, [])

  /**
   * Starts navigation for a given href.
   * Returns true if navigation was initiated, false if ignored (e.g., current route or already loading).
   */
  const startNavigation = useCallback(
    (href: string): boolean => {
      if (!href) return false

      const targetPath = normalizePath(href)
      const currentPath = normalizePath(pathname)

      // Ignore navigation to the current page to avoid permanent/unnecessary loading states
      if (targetPath === currentPath) {
        return false
      }

      // Prevent duplicate clicks if this exact destination is already in progress
      if (pendingPath && normalizePath(pendingPath) === targetPath) {
        return false
      }

      // Immediately register the new destination and kick off visual feedback
      setPendingPath(href)
      setIsNavigating(true)
      startProgressAnimation()
      return true
    },
    [pathname, pendingPath]
  )

  /**
   * Checks whether a specific href matches the current pending navigation destination.
   */
  const isPending = useCallback(
    (href: string): boolean => {
      if (!pendingPath) return false
      return normalizePath(pendingPath) === normalizePath(href)
    },
    [pendingPath]
  )

  // Listen for route changes via usePathname
  useEffect(() => {
    if (isNavigating) {
      // Whenever pathname changes, navigation has reached its target or moved to a new route
      completeNavigation()
    }
  }, [pathname, completeNavigation])

  // Handle browser back/forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      // Complete or cancel pending state on browser history changes
      if (isNavigating) {
        completeNavigation()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      clearAllTimers()
    }
  }, [isNavigating, completeNavigation])

  return (
    <NavigationLoadingContext.Provider
      value={{
        isNavigating,
        pendingPath,
        progress,
        startNavigation,
        cancelNavigation,
        isPending,
      }}
    >
      {children}
    </NavigationLoadingContext.Provider>
  )
}

export function useNavigationLoading(): NavigationContextType {
  const context = useContext(NavigationLoadingContext)
  if (!context) {
    throw new Error('useNavigationLoading must be used within a NavigationLoadingProvider')
  }
  return context
}
