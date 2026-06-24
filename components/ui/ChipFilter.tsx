'use client'

import type { Icon } from '@phosphor-icons/react'

export interface Chip {
  id: string
  label: string
  Icon?: Icon
}

interface ChipFilterProps {
  chips: Chip[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function ChipFilter({ chips, activeId, onChange, className = '' }: ChipFilterProps) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto scroll-hide py-0.5 ${className}`}
      role="group"
      aria-label="Filtros de búsqueda"
    >
      {chips.map(chip => {
        const isActive = chip.id === activeId
        return (
          <button
            key={chip.id}
            onClick={() => onChange(chip.id)}
            aria-pressed={isActive}
            className="flex items-center gap-1.5 flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: isActive ? 'var(--color-crimson)' : 'var(--color-card)',
              color: isActive ? 'white' : 'var(--color-text-muted)',
              boxShadow: isActive ? 'none' : 'var(--shadow-card)',
              border: isActive ? 'none' : '1px solid var(--color-border)',
              fontFamily: 'var(--font-family-body)',
            }}
          >
            {chip.Icon && (
              <chip.Icon
                size={14}
                weight="regular"
                aria-hidden="true"
                style={{ color: isActive ? 'white' : 'var(--color-text-muted)' }}
              />
            )}
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
