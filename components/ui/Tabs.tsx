'use client'

export interface TabItem {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeId, onChange, className = '' }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Pestañas de contenido"
      className={`flex gap-7 overflow-x-auto scroll-hide border-b ${className}`}
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
            className="relative flex-shrink-0 pb-3 pt-1 text-sm font-semibold cursor-pointer transition-colors"
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
                  height: '2px',
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
