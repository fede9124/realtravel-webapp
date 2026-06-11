'use client'

import { useState, useRef, useEffect } from 'react'
import { CaretDown } from '@phosphor-icons/react'

export interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
  icon?: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  defaultOpenId?: string
}

export function Accordion({ items, allowMultiple = false, defaultOpenId }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    defaultOpenId ? new Set([defaultOpenId]) : new Set()
  )

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const base = allowMultiple ? new Set(prev) : new Set<string>()
      if (prev.has(id)) {
        base.delete(id)
      } else {
        base.add(id)
      }
      return base
    })
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}>
      {items.map((item, index) => (
        <AccordionPanel
          key={item.id}
          item={item}
          isOpen={openIds.has(item.id)}
          onToggle={() => toggle(item.id)}
          showDivider={index < items.length - 1}
        />
      ))}
    </div>
  )
}

function AccordionPanel({
  item,
  isOpen,
  onToggle,
  showDivider,
}: {
  item: AccordionItem
  isOpen: boolean
  onToggle: () => void
  showDivider: boolean
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!contentRef.current) return
    setHeight(isOpen ? contentRef.current.scrollHeight : 0)
  }, [isOpen])

  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-panel-${item.id}`}
        id={`accordion-trigger-${item.id}`}
        className="flex items-center justify-between w-full px-5 py-[18px] text-left gap-3 transition-colors"
        style={{ background: isOpen ? 'var(--color-crimson-light)' : 'transparent' }}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'var(--color-surface)' }}
        onMouseLeave={e => { e.currentTarget.style.background = isOpen ? 'var(--color-crimson-light)' : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          {item.icon && (
            <span aria-hidden="true" style={{ color: 'var(--color-crimson)' }}>
              {item.icon}
            </span>
          )}
          <span
            className="font-semibold text-sm"
            style={{ color: isOpen ? 'var(--color-crimson)' : 'var(--color-text-primary)' }}
          >
            {item.title}
          </span>
        </div>
        <CaretDown
          size={17}
          weight="regular"
          aria-hidden="true"
          className="flex-shrink-0 transition-transform duration-300"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: isOpen ? 'var(--color-crimson)' : 'var(--color-text-muted)',
          }}
        />
      </button>

      <div
        id={`accordion-panel-${item.id}`}
        role="region"
        aria-labelledby={`accordion-trigger-${item.id}`}
        ref={contentRef}
        style={{
          height: `${height}px`,
          overflow: 'hidden',
          transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="px-5 pb-5 pt-1 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {item.content}
        </div>
      </div>

      {showDivider && (
        <div className="mx-5 h-px" style={{ background: 'var(--color-border)' }} />
      )}
    </div>
  )
}
