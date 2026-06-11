'use client'

import { useEffect, useRef } from 'react'

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            const delay = target.dataset.delay ?? '0'
            target.style.transitionDelay = `${delay}ms`
            target.classList.add('visible')
            observer.unobserve(target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const observeWithin = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>('.reveal:not(.visible)').forEach(t => observer.observe(t))
    }
    observeWithin(el)

    // Elementos .reveal añadidos después del mount (filtros, paginación) también se observan
    const mutations = new MutationObserver(records => {
      for (const record of records) {
        record.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return
          if (node.classList.contains('reveal') && !node.classList.contains('visible')) {
            observer.observe(node)
          }
          observeWithin(node)
        })
      }
    })
    mutations.observe(el, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutations.disconnect()
    }
  }, [])

  return ref
}
