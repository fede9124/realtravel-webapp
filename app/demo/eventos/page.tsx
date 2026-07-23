'use client'

import { useState, useMemo } from 'react'
import { SearchBar } from '@/components/ui/SearchBar'
import { EventCard } from '@/components/ui/EventCard'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { EVENTOS } from '@/lib/data'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'

const PV_EVENTOS = EVENTOS.filter(e => e.destinoId === 'puerto-varas')
const CATEGORIES = ['Todos', ...new Set(PV_EVENTOS.map(e => e.category))]

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  let startDay = first.getDay() - 1
  if (startDay < 0) startDay = 6
  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let d = 1; d <= lastDay; d++) days.push(d)
  return days
}

function eventFallsOnDate(e: typeof PV_EVENTOS[0], dateStr: string) {
  if (e.dateStart === dateStr) return true
  if (e.dateEnd && e.dateStart <= dateStr && e.dateEnd >= dateStr) return true
  return false
}

function MiniCalendar({ eventos, onSelectDate, selectedDate }: {
  eventos: typeof PV_EVENTOS
  onSelectDate: (d: string | null) => void
  selectedDate: string | null
}) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const days = getCalendarDays(viewYear, viewMonth)

  const eventDates = useMemo(() => {
    const set = new Set<string>()
    eventos.forEach(e => {
      const start = new Date(e.dateStart + 'T12:00:00')
      const end = e.dateEnd ? new Date(e.dateEnd + 'T12:00:00') : start
      const cur = new Date(start)
      while (cur <= end) {
        if (cur.getMonth() === viewMonth && cur.getFullYear() === viewYear) {
          set.add(isoDate(cur))
        }
        cur.setDate(cur.getDate() + 1)
      }
    })
    return set
  }, [eventos, viewMonth, viewYear])

  const todayStr = isoDate(today)

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
            else setViewMonth(m => m - 1)
            onSelectDate(null)
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)' }}>
          {MONTHS_ES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={() => {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
            else setViewMonth(m => m + 1)
            onSelectDate(null)
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {DAYS_ES.map(d => (
          <div key={d} className="text-center text-[10px] font-bold uppercase py-1" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {days.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const hasEvent = eventDates.has(dateStr)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate

          return (
            <button
              key={dateStr}
              onClick={() => { if (hasEvent) onSelectDate(isSelected ? null : dateStr) }}
              className="relative flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors"
              style={{
                background: isSelected ? 'var(--color-crimson)' : isToday ? 'var(--color-crimson-light)' : 'transparent',
                color: isSelected ? 'white' : isToday ? 'var(--color-crimson)' : 'var(--color-text-primary)',
                border: 'none',
                cursor: hasEvent ? 'pointer' : 'default',
                opacity: hasEvent || isToday ? 1 : 0.6,
                fontSize: '13px',
                fontWeight: hasEvent || isToday ? 700 : 400,
              }}
              onMouseEnter={e => { if (hasEvent && !isSelected) e.currentTarget.style.background = 'var(--color-surface)' }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? 'var(--color-crimson-light)' : 'transparent' }}
            >
              {day}
              {hasEvent && !isSelected && (
                <span style={{ position: 'absolute', bottom: '2px', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-crimson)' }} />
              )}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <button
          onClick={() => onSelectDate(null)}
          className="mt-3 w-full text-center text-xs font-medium py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--color-crimson)', background: 'var(--color-crimson-light)', border: 'none', cursor: 'pointer' }}
        >
          Limpiar filtro
        </button>
      )}
    </div>
  )
}

export default function DemoEventosPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const revealRef = useScrollReveal()

  const filtered = useMemo(() => {
    let list = PV_EVENTOS
    if (activeCategory !== 'Todos') list = list.filter(e => e.category === activeCategory)
    if (selectedDate) list = list.filter(e => eventFallsOnDate(e, selectedDate))
    if (query.trim()) {
      const q = norm(query.trim())
      list = list.filter(e => norm(`${e.title} ${e.location} ${e.category} ${e.description}`).includes(q))
    }
    return list.sort((a, b) => a.dateStart.localeCompare(b.dateStart))
  }, [query, activeCategory, selectedDate])

  return (
    <div ref={revealRef} className="w-full pb-24">
      {/* Header */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pt-10 pb-6">
        <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-crimson)', letterSpacing: '0.1em', fontFamily: 'var(--font-family-body)' }}>
          Puerto Varas
        </p>
        <h1 className="font-bold mb-2" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(24px, 4vw, 40px)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Eventos
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {filtered.length} evento{filtered.length !== 1 ? 's' : ''}
        </p>
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar eventos…" />
      </div>

      {/* Category chips */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
              style={{
                fontFamily: 'var(--font-family-body)',
                background: activeCategory === cat ? 'var(--color-crimson)' : 'var(--color-card)',
                color: activeCategory === cat ? 'white' : 'var(--color-text-muted)',
                border: `1px solid ${activeCategory === cat ? 'var(--color-crimson)' : 'var(--color-border)'}`,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-8">
        <MiniCalendar eventos={PV_EVENTOS} onSelectDate={setSelectedDate} selectedDate={selectedDate} />
      </div>

      {/* Cards */}
      <div className="reveal px-5 sm:px-8 lg:px-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {selectedDate ? 'No hay eventos en esta fecha.' : 'No hay eventos con esos filtros.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 340px))', gap: '24px 20px' }}>
            {filtered.map((e, i) => (
              <EventCard key={e.id} {...e} href={`/demo/eventos/${e.id}`} revealDelay={i * 40} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
