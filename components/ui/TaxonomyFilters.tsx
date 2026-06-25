'use client'

import { useState, useCallback, useMemo } from 'react'
import { X, SlidersHorizontal, FunnelSimple, CaretDown } from '@phosphor-icons/react'
import {
  CATEGORIAS, IDENTIDADES, ENTORNOS,
  TIPOS_POR_CATEGORIA, TAGS_POR_TIPO,
  TAG_ACCESIBILIDAD_VALUES, TAG_SERVICIOS_VALUES,
  TAG_ACTIVIDADES_VALUES, TAG_CULTURAS_VALUES,
  type Categoria,
} from '@/lib/data'

export interface TaxonomyState {
  categoria: string | null
  identidad: string | null
  entorno: string | null
  tipo_punto: string | null
  tags_opcionales: string[]
  tag_accesibilidad: string[]
  tag_servicios: string[]
  tag_actividades: string[]
  tag_culturas: string[]
}

const EMPTY: TaxonomyState = {
  categoria: null, identidad: null, entorno: null, tipo_punto: null,
  tags_opcionales: [], tag_accesibilidad: [], tag_servicios: [],
  tag_actividades: [], tag_culturas: [],
}

export function useFilters() {
  const [state, setState] = useState<TaxonomyState>({ ...EMPTY })

  const setCategoria = useCallback((v: string | null) => {
    setState(s => ({ ...s, categoria: v, tipo_punto: null, tags_opcionales: [] }))
  }, [])

  const setIdentidad = useCallback((v: string | null) => {
    setState(s => ({ ...s, identidad: v }))
  }, [])

  const setEntorno = useCallback((v: string | null) => {
    setState(s => ({ ...s, entorno: v }))
  }, [])

  const setTipoPunto = useCallback((v: string | null) => {
    setState(s => ({ ...s, tipo_punto: v, tags_opcionales: [] }))
  }, [])

  const toggleMulti = useCallback((field: keyof TaxonomyState, value: string) => {
    setState(s => {
      const arr = s[field] as string[]
      return { ...s, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }, [])

  const clearAll = useCallback(() => setState({ ...EMPTY }), [])

  const activeCount = useMemo(() => {
    let c = 0
    if (state.categoria) c++
    if (state.identidad) c++
    if (state.entorno) c++
    if (state.tipo_punto) c++
    c += state.tags_opcionales.length
    c += state.tag_accesibilidad.length
    c += state.tag_servicios.length
    c += state.tag_actividades.length
    c += state.tag_culturas.length
    return c
  }, [state])

  const hasFilters = activeCount > 0

  return { state, setCategoria, setIdentidad, setEntorno, setTipoPunto, toggleMulti, clearAll, activeCount, hasFilters }
}

// ─── Chip components ─────────────────────────────────────────────────────────

function SingleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 active:scale-95"
      style={{
        background: active ? 'var(--color-crimson)' : 'var(--color-surface)',
        color: active ? 'white' : 'var(--color-text-muted)',
        border: active ? 'none' : '1px solid var(--color-border)',
      }}
    >
      {label}
    </button>
  )
}

function MultiChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-all duration-200 active:scale-95"
      style={{
        background: active ? 'var(--color-crimson)' : 'var(--color-surface)',
        color: active ? 'white' : 'var(--color-text-muted)',
        border: active ? 'none' : '1px solid var(--color-border)',
      }}
    >
      {label}
    </button>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p
        className="text-[11px] font-bold uppercase mb-2"
        style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}
      >
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {children}
      </div>
    </div>
  )
}

// ─── Inline filters (always visible) ─────────────────────────────────────────

export function TaxonomyChips({
  state,
  setCategoria,
  setTipoPunto,
  activeCount,
  onOpenModal,
}: {
  state: TaxonomyState
  setCategoria: (v: string | null) => void
  setTipoPunto: (v: string | null) => void
  activeCount: number
  onOpenModal: () => void
}) {
  const tipoOptions = state.categoria
    ? TIPOS_POR_CATEGORIA[state.categoria as Categoria] ?? []
    : []

  return (
    <div className="flex flex-col gap-2.5">
      {/* Primary row: categorías + filter button */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 overflow-x-auto scroll-hide flex-1">
          {CATEGORIAS.map(cat => (
            <SingleChip
              key={cat}
              label={cat}
              active={state.categoria === cat}
              onClick={() => setCategoria(state.categoria === cat ? null : cat)}
            />
          ))}
        </div>
        <button
          onClick={onOpenModal}
          aria-label="Abrir más filtros"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
          style={{
            background: activeCount > 0 ? 'var(--color-crimson)' : 'var(--color-surface)',
            color: activeCount > 0 ? 'white' : 'var(--color-text-muted)',
            border: activeCount > 0 ? 'none' : '1px solid var(--color-border)',
          }}
        >
          <SlidersHorizontal size={12} aria-hidden="true" />
          Filtros
          {activeCount > 0 && (
            <span
              className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.25)' }}
            >
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Dependent row: tipo_punto (only when a categoría is selected) */}
      {tipoOptions.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto scroll-hide">
          {tipoOptions.map(tipo => (
            <SingleChip
              key={tipo}
              label={tipo}
              active={state.tipo_punto === tipo}
              onClick={() => setTipoPunto(state.tipo_punto === tipo ? null : tipo)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Full filter modal ───────────────────────────────────────────────────────

export function TaxonomyModal({
  state,
  setCategoria,
  setIdentidad,
  setEntorno,
  setTipoPunto,
  toggleMulti,
  clearAll,
  activeCount,
  resultCount,
  onClose,
}: {
  state: TaxonomyState
  setCategoria: (v: string | null) => void
  setIdentidad: (v: string | null) => void
  setEntorno: (v: string | null) => void
  setTipoPunto: (v: string | null) => void
  toggleMulti: (field: keyof TaxonomyState, value: string) => void
  clearAll: () => void
  activeCount: number
  resultCount: number
  onClose: () => void
}) {
  const tipoOptions = state.categoria
    ? TIPOS_POR_CATEGORIA[state.categoria as Categoria] ?? []
    : []

  const tagOptions = state.tipo_punto
    ? TAGS_POR_TIPO[state.tipo_punto] ?? []
    : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col"
        style={{ background: 'var(--color-card)', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <FunnelSimple size={16} style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
            <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}>
              Filtros
            </h2>
            {activeCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: 'var(--color-crimson)', color: 'white' }}
              >
                {activeCount} activos
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Categoría */}
          <FilterGroup title="Categoría">
            {CATEGORIAS.map(cat => (
              <SingleChip
                key={cat}
                label={cat}
                active={state.categoria === cat}
                onClick={() => setCategoria(state.categoria === cat ? null : cat)}
              />
            ))}
          </FilterGroup>

          {/* Tipo de punto (dependent on categoría) */}
          {tipoOptions.length > 0 && (
            <FilterGroup title={`Tipo de punto · ${state.categoria}`}>
              {tipoOptions.map(tipo => (
                <SingleChip
                  key={tipo}
                  label={tipo}
                  active={state.tipo_punto === tipo}
                  onClick={() => setTipoPunto(state.tipo_punto === tipo ? null : tipo)}
                />
              ))}
            </FilterGroup>
          )}

          {/* Tags opcionales (dependent on tipo_punto) */}
          {tagOptions.length > 0 && (
            <FilterGroup title={`Tags · ${state.tipo_punto}`}>
              {tagOptions.map(tag => (
                <MultiChip
                  key={tag}
                  label={tag}
                  active={state.tags_opcionales.includes(tag)}
                  onClick={() => toggleMulti('tags_opcionales', tag)}
                />
              ))}
            </FilterGroup>
          )}

          {/* Identidad */}
          <FilterGroup title="Identidad">
            {IDENTIDADES.map(id => (
              <SingleChip
                key={id}
                label={id}
                active={state.identidad === id}
                onClick={() => setIdentidad(state.identidad === id ? null : id)}
              />
            ))}
          </FilterGroup>

          {/* Entorno */}
          <FilterGroup title="Entorno">
            {ENTORNOS.map(e => (
              <SingleChip
                key={e}
                label={e}
                active={state.entorno === e}
                onClick={() => setEntorno(state.entorno === e ? null : e)}
              />
            ))}
          </FilterGroup>

          {/* Transversal: Accesibilidad */}
          <CollapsibleGroup title="Accesibilidad">
            {TAG_ACCESIBILIDAD_VALUES.map(tag => (
              <MultiChip
                key={tag}
                label={tag}
                active={state.tag_accesibilidad.includes(tag)}
                onClick={() => toggleMulti('tag_accesibilidad', tag)}
              />
            ))}
          </CollapsibleGroup>

          {/* Transversal: Servicios */}
          <CollapsibleGroup title="Servicios">
            {TAG_SERVICIOS_VALUES.map(tag => (
              <MultiChip
                key={tag}
                label={tag}
                active={state.tag_servicios.includes(tag)}
                onClick={() => toggleMulti('tag_servicios', tag)}
              />
            ))}
          </CollapsibleGroup>

          {/* Transversal: Actividades */}
          <CollapsibleGroup title="Actividades">
            {TAG_ACTIVIDADES_VALUES.map(tag => (
              <MultiChip
                key={tag}
                label={tag}
                active={state.tag_actividades.includes(tag)}
                onClick={() => toggleMulti('tag_actividades', tag)}
              />
            ))}
          </CollapsibleGroup>

          {/* Transversal: Culturas */}
          <CollapsibleGroup title="Culturas">
            {TAG_CULTURAS_VALUES.map(tag => (
              <MultiChip
                key={tag}
                label={tag}
                active={state.tag_culturas.includes(tag)}
                onClick={() => toggleMulti('tag_culturas', tag)}
              />
            ))}
          </CollapsibleGroup>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: 'var(--color-crimson)', background: 'var(--color-crimson-light)' }}
            >
              Limpiar todo
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--color-crimson)' }}
          >
            Ver {resultCount} resultado{resultCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Collapsible group for long tag lists ────────────────────────────────────

function CollapsibleGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 mb-2 cursor-pointer"
      >
        <p
          className="text-[11px] font-bold uppercase"
          style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}
        >
          {title}
        </p>
        <CaretDown
          size={10}
          weight="bold"
          style={{
            color: 'var(--color-text-muted)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="flex flex-wrap gap-1.5">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Filter logic (AND between fields, OR within multi-value fields) ─────────

export function applyTaxonomyFilters<T extends {
  categoria?: string | null
  identidad?: string | null
  entorno?: string | null
  tipo_punto?: string | null
  tags_opcionales?: string[]
  tag_accesibilidad?: string[]
  tag_servicios?: string[]
  tag_actividades?: string[]
  tag_culturas?: string[]
}>(items: T[], filters: TaxonomyState): T[] {
  return items.filter(item => {
    if (filters.categoria && item.categoria !== filters.categoria) return false
    if (filters.identidad && item.identidad !== filters.identidad) return false
    if (filters.entorno && item.entorno !== filters.entorno) return false
    if (filters.tipo_punto && item.tipo_punto !== filters.tipo_punto) return false

    if (filters.tags_opcionales.length > 0) {
      const itemTags = item.tags_opcionales ?? []
      if (!filters.tags_opcionales.some(t => itemTags.includes(t))) return false
    }
    if (filters.tag_accesibilidad.length > 0) {
      const itemTags = item.tag_accesibilidad ?? []
      if (!filters.tag_accesibilidad.some(t => itemTags.includes(t))) return false
    }
    if (filters.tag_servicios.length > 0) {
      const itemTags = item.tag_servicios ?? []
      if (!filters.tag_servicios.some(t => itemTags.includes(t))) return false
    }
    if (filters.tag_actividades.length > 0) {
      const itemTags = item.tag_actividades ?? []
      if (!filters.tag_actividades.some(t => itemTags.includes(t))) return false
    }
    if (filters.tag_culturas.length > 0) {
      const itemTags = item.tag_culturas ?? []
      if (!filters.tag_culturas.some(t => itemTags.includes(t))) return false
    }

    return true
  })
}
