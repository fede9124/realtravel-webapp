'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Compass, MapTrifold, Globe, Heart,
  CaretLeft, CaretRight, X,
  MapPin, Buildings, Path,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

interface NavItem {
  href: string
  label: string
  Icon: Icon
}

const NAV_ITEMS: NavItem[] = [
  { href: '/explorar',   label: 'Explorar',   Icon: Compass    },
  { href: '/lugares',    label: 'Lugares',    Icon: MapPin     },
  { href: '/destinos',   label: 'Destinos',   Icon: Buildings  },
  { href: '/rutas',      label: 'Rutas',      Icon: Path       },
  { href: '/mapa',       label: 'Mapa',       Icon: MapTrifold },
  { href: '/red-travel', label: 'Red Travel', Icon: Globe      },
  { href: '/favoritos',  label: 'Favoritos',  Icon: Heart      },
]

interface SideNavProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  isMobile: boolean
  onMobileClose: () => void
}

const EASE = 'cubic-bezier(0.4,0,0.2,1)'
const LABEL_TRANSITION = `max-width 0.25s ${EASE}, opacity 0.18s ease`

function CollapsibleLabel({
  collapsed,
  children,
  style,
}: {
  collapsed: boolean
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <span
      style={{
        maxWidth: collapsed ? 0 : '200px',
        opacity: collapsed ? 0 : 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        transition: LABEL_TRANSITION,
        pointerEvents: collapsed ? 'none' : 'auto',
        display: 'block',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export function SideNav({ collapsed, onToggle, mobileOpen, isMobile, onMobileClose }: SideNavProps) {
  const pathname = usePathname()

  const isCollapsed = isMobile ? false : collapsed
  const sidebarWidth = isMobile ? 240 : (collapsed ? 64 : 240)

  // An item is "active" if the current path starts with its href
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: isCollapsed ? 0 : '12px',
    padding: isCollapsed ? '12px' : '11px 14px',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: `background 150ms ease, gap 0.3s ${EASE}`,
    textDecoration: 'none',
    position: 'relative',
    background: active ? 'var(--color-crimson-light)' : 'transparent',
    color: active ? 'var(--color-crimson)' : 'var(--color-text-muted)',
  })

  const mobileTransform = isMobile
    ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)')
    : 'translateX(0)'

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] px-4 py-2 rounded-xl text-sm font-medium text-white"
        style={{ background: 'var(--color-crimson)' }}
      >
        Ir al contenido principal
      </a>

      <aside
        className="fixed left-0 top-0 h-screen flex flex-col border-r overflow-hidden"
        style={{
          width: `${sidebarWidth}px`,
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
          boxShadow: isMobile ? '4px 0 24px rgba(45,20,8,0.12)' : 'var(--shadow-panel)',
          zIndex: 50,
          transform: mobileTransform,
          transition: isMobile
            ? `transform 0.3s ${EASE}`
            : `width 0.3s ${EASE}`,
        }}
        aria-label="Navegación principal"
      >
        {/* Logo row */}
        <div
          className="flex items-center border-b flex-shrink-0"
          style={{
            borderColor: 'var(--color-border)',
            height: '72px',
            padding: isCollapsed ? '0 14px' : '0 20px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: isCollapsed ? 0 : '12px',
            transition: `padding 0.3s ${EASE}, gap 0.3s ${EASE}`,
          }}
        >
          <Link
            href="/explorar"
            onClick={isMobile ? onMobileClose : undefined}
            aria-label="Real Travel — inicio"
            style={{ display: 'flex', alignItems: 'center', gap: 'inherit', textDecoration: 'none' }}
          >
            <Image
              src="/logo/RT_roj.png"
              alt="Real Travel"
              width={36}
              height={36}
              className="flex-shrink-0"
              style={{ objectFit: 'contain' }}
            />
            <div style={{ overflow: 'hidden' }}>
              <CollapsibleLabel collapsed={isCollapsed}>
                <span
                  className="font-bold text-base block"
                  style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}
                >
                  Real Travel
                </span>
                <span className="text-[11px] block" style={{ color: 'var(--color-text-muted)', marginTop: '-1px' }}>
                  Guía inteligente
                </span>
              </CollapsibleLabel>
            </div>
          </Link>

          {isMobile && (
            <button
              onClick={onMobileClose}
              aria-label="Cerrar menú"
              className="ml-auto flex items-center justify-center rounded-xl w-9 h-9 transition-colors"
              style={{ color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <X size={18} weight="regular" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 flex flex-col gap-1 overflow-y-auto scroll-hide"
          style={{
            padding: isCollapsed ? '20px 8px' : '20px 12px',
            transition: `padding 0.3s ${EASE}`,
          }}
        >
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = isActive(href)

            return (
              <Link
                key={href}
                href={href}
                onClick={isMobile ? onMobileClose : undefined}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                title={isCollapsed ? label : undefined}
                style={navItemStyle(active)}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--color-surface)' }}
                onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--color-crimson-light)' : 'transparent' }}
              >
                {active && !isCollapsed && (
                  <span
                    className="absolute left-0 rounded-r-full"
                    style={{ width: '3.5px', height: '24px', background: 'var(--color-crimson)' }}
                    aria-hidden="true"
                  />
                )}
                <Icon
                  size={20}
                  weight={active ? 'fill' : 'regular'}
                  style={{ flexShrink: 0 }}
                  aria-hidden="true"
                />
                <CollapsibleLabel collapsed={isCollapsed}>
                  <span className="text-sm font-medium flex-1" style={{ fontFamily: 'var(--font-family-body)' }}>
                    {label}
                  </span>
                </CollapsibleLabel>
              </Link>
            )
          })}
        </nav>

        {/* Bottom: profile + toggle */}
        <div
          className="border-t flex-shrink-0 flex flex-col"
          style={{
            borderColor: 'var(--color-border)',
            padding: isCollapsed ? '12px 8px' : '12px',
            gap: '4px',
            transition: `padding 0.3s ${EASE}`,
          }}
        >
          <Link
            href="/perfil"
            onClick={isMobile ? onMobileClose : undefined}
            aria-label="Ver perfil"
            aria-current={isActive('/perfil') ? 'page' : undefined}
            title={isCollapsed ? 'Perfil' : undefined}
            style={navItemStyle(isActive('/perfil'))}
            onMouseEnter={e => { if (!isActive('/perfil')) e.currentTarget.style.background = 'var(--color-surface)' }}
            onMouseLeave={e => { e.currentTarget.style.background = isActive('/perfil') ? 'var(--color-crimson-light)' : 'transparent' }}
          >
            <div
              className="flex items-center justify-center text-sm font-bold text-white flex-shrink-0 select-none rounded-full"
              style={{ width: '32px', height: '32px', minWidth: '32px', background: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)' }}
              aria-hidden="true"
            >
              V
            </div>
            <CollapsibleLabel collapsed={isCollapsed}>
              <span className="text-sm font-semibold leading-tight block" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}>
                Viajero Aventurero
              </span>
              <span className="text-xs block" style={{ color: 'var(--color-text-muted)', marginTop: '-1px' }}>
                Ver perfil
              </span>
            </CollapsibleLabel>
          </Link>

          {!isMobile && (
            <button
              onClick={onToggle}
              aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
              title={collapsed ? 'Expandir' : 'Contraer'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isCollapsed ? 0 : '10px',
                padding: isCollapsed ? '10px' : '10px 14px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: `background 150ms ease, gap 0.3s ${EASE}`,
                background: 'transparent',
                color: 'var(--color-text-muted)',
                border: 'none',
                width: '100%',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {collapsed
                ? <CaretRight size={15} weight="regular" aria-hidden="true" />
                : <CaretLeft  size={15} weight="regular" style={{ flexShrink: 0 }} aria-hidden="true" />
              }
              <CollapsibleLabel collapsed={isCollapsed}>
                <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-family-body)' }}>
                  Contraer
                </span>
              </CollapsibleLabel>
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
