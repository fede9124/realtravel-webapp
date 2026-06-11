'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { List, AirplaneTilt } from '@phosphor-icons/react'
import { SideNav } from './SideNav'

export const SIDEBAR_EXPANDED = 240
export const SIDEBAR_COLLAPSED = 64
const MOBILE_HEADER_H = 56

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  const sidebarW = isMobile ? 0 : (collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED)

  return (
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
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
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

          <Link
            href="/explorar"
            className="flex items-center gap-2"
            aria-label="Real Travel — inicio"
          >
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: '28px', height: '28px', background: 'var(--color-crimson)' }}
            >
              <AirplaneTilt size={14} color="white" weight="fill" aria-hidden="true" />
            </div>
            <span
              className="font-bold text-sm"
              style={{
                fontFamily: 'var(--font-family-display)',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Real Travel
            </span>
          </Link>

          {/* Mirror of the hamburger for optical balance */}
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
  )
}
