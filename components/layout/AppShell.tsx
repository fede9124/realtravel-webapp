'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { List, AirplaneTilt } from '@phosphor-icons/react'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { SideNav } from './SideNav'
import { AuthContext, useAuthProvider } from '@/hooks/useAuth'

export const SIDEBAR_EXPANDED = 240
export const SIDEBAR_COLLAPSED = 64
const MOBILE_HEADER_H = 56
const HOVER_LEAVE_DELAY = 220

export function AppShell({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider()
  const pathname = usePathname()
  const isDemo = pathname.startsWith('/demo')
  const [pinned, setPinned] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (!e.matches) setMobileOpen(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-pinned')
    if (saved === 'true') setPinned(true)
  }, [])

  function handleHoverEnter() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setHovering(true)
  }

  function handleHoverLeave() {
    leaveTimer.current = setTimeout(() => setHovering(false), HOVER_LEAVE_DELAY)
  }

  function handlePinToggle() {
    setPinned(prev => {
      const next = !prev
      localStorage.setItem('sidebar-pinned', String(next))
      if (!next) setHovering(false)
      return next
    })
  }

  // Main margin: 64px always unless pinned (sidebar overlays when only hovering)
  const sidebarW = isMobile ? 0 : (pinned ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED)

  return (
    <AuthContext.Provider value={auth}>
    <div className="min-h-[100dvh]" style={{ background: 'var(--color-surface)' }}>

      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <SideNav
        hovering={hovering}
        pinned={pinned}
        onHoverEnter={handleHoverEnter}
        onHoverLeave={handleHoverLeave}
        onPinToggle={handlePinToggle}
        mobileOpen={mobileOpen}
        isMobile={isMobile}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile header */}
      {isMobile && (
        <header
          className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between"
          style={{
            height: `${MOBILE_HEADER_H}px`,
            padding: '0 20px',
            background: 'var(--color-card)',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú de navegación"
            className="w-11 h-11 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <List size={20} weight="regular" aria-hidden="true" />
          </button>

          {isDemo ? (
            <TransitionLink href="/demo" className="flex items-center gap-2" aria-label="Puerto Varas — inicio">
              <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                Puerto Varas
              </span>
            </TransitionLink>
          ) : (
            <TransitionLink href="/explorar" className="flex items-center gap-2" aria-label="Real Travel — inicio">
              <div className="flex items-center justify-center rounded-lg" style={{ width: '28px', height: '28px', background: 'var(--color-crimson)' }}>
                <AirplaneTilt size={14} color="white" weight="fill" aria-hidden="true" />
              </div>
              <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                Real Travel
              </span>
            </TransitionLink>
          )}

          <div className="w-11" aria-hidden="true" />
        </header>
      )}

      {/* Main content */}
      <main
        id="main-content"
        className="min-h-[100dvh]"
        style={{
          marginLeft: `${sidebarW}px`,
          paddingTop: isMobile ? `${MOBILE_HEADER_H}px` : 0,
          transition: isMobile ? 'none' : 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {children}
      </main>
    </div>
    </AuthContext.Provider>
  )
}
