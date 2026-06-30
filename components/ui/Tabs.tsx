'use client'

export interface TabItem {
  id: string
  label: string
  count?: number
}

const SIZE = {
  sm: { text: 'text-sm', weight: 'font-semibold', padding: 'pb-3 pt-1', gap: 'gap-7', indicator: '2px' },
  lg: { text: 'text-lg', weight: 'font-bold', padding: 'pb-4 pt-2', gap: 'gap-10', indicator: '3px' },
} as const

interface TabsProps {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
  size?: 'sm' | 'lg'
  className?: string
}

export function Tabs({ tabs, activeId, onChange, size = 'sm', className = '' }: TabsProps) {
  const s = SIZE[size]
  return (
    <div
      role="tablist"
      aria-label="Pestañas de contenido"
      className={`flex ${s.gap} overflow-x-auto scroll-hide border-b ${className}`}
      style={{ borderColor: 'var(--color-border)' }}
    >
      {tabs.map(tab => {
        const active = tab.id === activeId
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`relative flex-shrink-0 ${s.padding} ${s.text} ${s.weight} cursor-pointer transition-colors`}
            style={{
              color: active ? 'var(--color-crimson)' : 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-heading)',
            }}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span className="ml-1.5 font-normal" style={{ opacity: 0.6 }}>
                {tab.count}
              </span>
            )}
            {active && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '-1px',
                  height: s.indicator,
                  borderRadius: '2px',
                  background: 'var(--color-crimson)',
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
