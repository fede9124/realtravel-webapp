'use client'

import { X, User, Envelope, Lock } from '@phosphor-icons/react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface LoginPromptProps {
  open: boolean
  onClose: () => void
  message?: string
}

export function LoginPrompt({ open, onClose, message }: LoginPromptProps) {
  const { login } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  if (!open) return null

  const handleSubmit = () => {
    login()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-8 flex flex-col gap-5"
        style={{ background: 'var(--color-card)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: 'var(--color-crimson-light)' }}
          >
            <User size={28} weight="regular" style={{ color: 'var(--color-crimson)' }} />
          </div>
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-display)' }}
          >
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>
          {message && (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {mode === 'register' && (
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1.5px solid var(--color-border)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-crimson)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>
          )}
          <div className="relative">
            <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1.5px solid var(--color-border)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-crimson)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1.5px solid var(--color-border)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-crimson)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.98]"
          style={{ background: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)' }}
        >
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {mode === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
          <button
            onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
            className="font-semibold underline cursor-pointer"
            style={{ color: 'var(--color-crimson)' }}
          >
            {mode === 'login' ? 'Registrate' : 'Iniciá sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}
