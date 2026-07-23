'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { TransitionLink } from '@/components/ui/TransitionLink'
import {
  Compass, MapTrifold, Globe, Heart,
  X, MapPin, Buildings, Path, User, PushPin,
  House, Binoculars, Phone, CalendarBlank,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'

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

const DEMO_NAV_ITEMS: NavItem[] = [
  { href: '/demo',           label: 'Inicio',     Icon: House      },
  { href: '/demo/atractivos', label: 'Atractivos', Icon: Binoculars },
  { href: '/demo/rutas',     label: 'Rutas',      Icon: Path       },
  { href: '/demo/mapa',      label: 'Mapa',       Icon: MapTrifold },
  { href: '/demo/servicios', label: 'Servicios',  Icon: Globe      },
  { href: '/demo/eventos',   label: 'Eventos',    Icon: CalendarBlank },
  { href: '/demo/contacto',  label: 'Contacto',   Icon: Phone      },
]

interface SideNavProps {
  hovering: boolean
  pinned: boolean
  onHoverEnter: () => void
  onHoverLeave: () => void
  onPinToggle: () => void
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

export function SideNav({
  hovering,
  pinned,
  onHoverEnter,
  onHoverLeave,
  onPinToggle,
  mobileOpen,
  isMobile,
  onMobileClose,
}: SideNavProps) {
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()

  const isDemo = pathname.startsWith('/demo')
  const navItems = isDemo ? DEMO_NAV_ITEMS : NAV_ITEMS

  const expanded = isMobile ? true : (hovering || pinned)
  const isCollapsed = !expanded
  const sidebarWidth = expanded ? 240 : 64

  const isActive = (href: string) =>
    isDemo
      ? (href === '/demo' ? pathname === '/demo' : pathname.startsWith(href + '/') || pathname === href)
      : pathname === href || pathname.startsWith(href + '/')

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
          boxShadow: isMobile
            ? '4px 0 24px rgba(45,20,8,0.12)'
            : expanded && !pinned
              ? '4px 0 20px rgba(45,20,8,0.10)'
              : 'var(--shadow-panel)',
          zIndex: 50,
          transform: mobileTransform,
          transition: isMobile
            ? `transform 0.3s ${EASE}`
            : `width 0.3s ${EASE}, box-shadow 0.3s ease`,
        }}
        onMouseEnter={!isMobile ? onHoverEnter : undefined}
        onMouseLeave={!isMobile ? onHoverLeave : undefined}
        aria-label="Navegación principal"
      >
        {/* Logo row */}
        <div
          className="flex items-center border-b flex-shrink-0"
          style={{
            borderColor: 'var(--color-border)',
            height: '72px',
            padding: isCollapsed ? '0 14px' : '0 16px 0 20px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: isCollapsed ? 0 : '10px',
            transition: `padding 0.3s ${EASE}, gap 0.3s ${EASE}`,
          }}
        >
          <TransitionLink
            href={isDemo ? '/demo' : '/explorar'}
            onClick={isMobile ? onMobileClose : undefined}
            aria-label={isDemo ? 'Puerto Varas — inicio' : 'Real Travel — inicio'}
            style={{ display: 'flex', alignItems: 'center', gap: 'inherit', textDecoration: 'none', flex: 1, minWidth: 0 }}
          >
            <Image
              src={isDemo ? '/logo/pv_logo.png' : '/logo/RT_roj.png'}
              alt={isDemo ? 'Puerto Varas' : 'Real Travel'}
              width={36}
              height={36}
              className="flex-shrink-0"
              style={{ objectFit: 'contain' }}
            />
            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <CollapsibleLabel collapsed={isCollapsed}>
                <span
                  className="font-bold text-base block"
                  style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}
                >
                  {isDemo ? 'Puerto Varas' : 'Real Travel'}
                </span>
                <span className="text-[11px] block" style={{ color: 'var(--color-text-muted)', marginTop: '-1px' }}>
                  {isDemo ? 'powered by Real Travel' : 'Guía inteligente'}
                </span>
              </CollapsibleLabel>
            </div>
          </TransitionLink>

          {/* Pin button — visible when expanded on desktop */}
          {!isMobile && expanded && (
            <button
              onClick={onPinToggle}
              aria-label={pinned ? 'Desfijar barra lateral' : 'Fijar barra lateral'}
              title={pinned ? 'Desfijar' : 'Fijar'}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 hover:scale-110 active:scale-90"
              style={{
                color: pinned ? 'var(--color-crimson)' : 'var(--color-text-muted)',
                background: pinned ? 'var(--color-crimson-light)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { if (!pinned) e.currentTarget.style.background = 'var(--color-surface)' }}
              onMouseLeave={e => { e.currentTarget.style.background = pinned ? 'var(--color-crimson-light)' : 'transparent' }}
            >
              <PushPin
                size={16}
                weight={pinned ? 'fill' : 'regular'}
                aria-hidden="true"
              />
            </button>
          )}

          {/* Mobile close button */}
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
          {navItems.map(({ href, label, Icon }) => {
            const active = isActive(href)

            return (
              <TransitionLink
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
              </TransitionLink>
            )
          })}
        </nav>

        {/* Bottom: profile (hidden in demo) */}
        {!isDemo && <div
          className="border-t flex-shrink-0 flex flex-col"
          style={{
            borderColor: 'var(--color-border)',
            padding: isCollapsed ? '12px 8px' : '12px',
            gap: '4px',
            transition: `padding 0.3s ${EASE}`,
          }}
        >
          <TransitionLink
            href="/perfil"
            onClick={isMobile ? onMobileClose : undefined}
            aria-label={isLoggedIn ? 'Ver perfil' : 'Iniciar sesión'}
            aria-current={isActive('/perfil') ? 'page' : undefined}
            title={isCollapsed ? (isLoggedIn ? 'Perfil' : 'Iniciar sesión') : undefined}
            style={navItemStyle(isActive('/perfil'))}
            onMouseEnter={e => { if (!isActive('/perfil')) e.currentTarget.style.background = 'var(--color-surface)' }}
            onMouseLeave={e => { e.currentTarget.style.background = isActive('/perfil') ? 'var(--color-crimson-light)' : 'transparent' }}
          >
            {isLoggedIn ? (
              <div
                className="flex items-center justify-center text-sm font-bold text-white flex-shrink-0 select-none rounded-full"
                style={{ width: '32px', height: '32px', minWidth: '32px', background: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)' }}
                aria-hidden="true"
              >
                V
              </div>
            ) : (
              <div
                className="flex items-center justify-center flex-shrink-0 rounded-full"
                style={{ width: '32px', height: '32px', minWidth: '32px', background: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }}
                aria-hidden="true"
              >
                <User size={16} weight="regular" style={{ color: 'var(--color-text-muted)' }} />
              </div>
            )}
            <CollapsibleLabel collapsed={isCollapsed}>
              <span className="text-sm font-semibold leading-tight block" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}>
                {isLoggedIn ? 'Viajero Aventurero' : 'Iniciar sesión'}
              </span>
              <span className="text-xs block" style={{ color: 'var(--color-text-muted)', marginTop: '-1px' }}>
                {isLoggedIn ? 'Ver perfil' : 'Accedé a tu cuenta'}
              </span>
            </CollapsibleLabel>
          </TransitionLink>
        </div>}
      </aside>
    </>
  )
}
