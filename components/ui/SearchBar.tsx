'use client'

import { MagnifyingGlass } from '@phosphor-icons/react'
import { useState } from 'react'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
}

export function SearchBar({
  placeholder = 'Buscar lugares, ciudades...',
  value,
  onChange,
  onSearch,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative flex items-center">
      <MagnifyingGlass
        size={17}
        weight="regular"
        className="absolute left-4 pointer-events-none"
        aria-hidden="true"
        style={{ color: focused ? 'var(--color-crimson)' : 'var(--color-text-muted)' }}
      />
      <input
        type="search"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch?.(value ?? '')}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        aria-label="Buscar destinos, lugares y ciudades"
        className="w-full pl-11 pr-5 py-3.5 rounded-lg text-sm outline-none transition-all duration-200 cursor-text"
        style={{
          background: 'var(--color-card)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-body)',
          boxShadow: focused
            ? '0 0 0 2px var(--color-crimson), var(--shadow-card)'
            : 'var(--shadow-card)',
          border: 'none',
        }}
      />
    </div>
  )
}
