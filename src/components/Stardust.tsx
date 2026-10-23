'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  born: number
  life: number
  size: number
  color: string
}

export function Stardust({ selection }: { selection: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const bloom = useRef<(() => void) | null>(null)

  useEffect(() => {
    const element = canvas.current
    const root = element?.parentElement
    const context = element?.getContext('2d')
    if (!element || !root || !context) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    let particles: Particle[] = []
    let frame = 0
    let width = 0
    let height = 0
    let lastEmission = 0
    let lastFrame = 0
    const colors = ['#fffdf4', '#acded6', '#bda36b']
    function resize() {
      const box = root!.getBoundingClientRect()
      width = box.width
      height = box.height
      const ratio = Math.min(devicePixelRatio || 1, 2)
      element!.width = Math.round(width * ratio)
      element!.height = Math.round(height * ratio)
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    function clear() {
      cancelAnimationFrame(frame)
      frame = 0
      particles = []
      context!.clearRect(0, 0, width, height)
    }
    function draw(now: number) {
      frame = 0
      if (document.hidden || reduced.matches) {
        clear()
        return
      }
      const dt = Math.min((now - lastFrame) / 1000, 0.05)
      lastFrame = now
      context!.clearRect(0, 0, width, height)
      particles = particles.filter((particle) => now - particle.born < particle.life)
      for (const particle of particles) {
        const progress = (now - particle.born) / particle.life
        particle.x += particle.vx * dt
        particle.y += particle.vy * dt
        context!.globalAlpha = Math.sin(Math.PI * progress) * 0.75
        context!.fillStyle = particle.color
        context!.shadowColor = particle.color
        context!.shadowBlur = 7
        context!.beginPath()
        context!.arc(particle.x, particle.y, particle.size * (1 - progress * 0.5), 0, Math.PI * 2)
        context!.fill()
      }
      context!.globalAlpha = 1
      if (particles.length) frame = requestAnimationFrame(draw)
    }
    function emit(x: number, y: number, count: number) {
      if (reduced.matches || document.hidden) return
      const now = performance.now()
      const available = Math.min(count, 64 - particles.length)
      for (let i = 0; i < available; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * 28
        particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          vx: Math.cos(angle) * (8 + Math.random() * 17),
          vy: Math.sin(angle) * 13 - 9,
          born: now,
          life: 900 + Math.random() * 1000,
          size: 0.5 + Math.random() * 1.2,
          color: colors[i % colors.length],
        })
      }
      if (!frame && particles.length) {
        lastFrame = now
        frame = requestAnimationFrame(draw)
      }
    }
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || performance.now() - lastEmission < 65) return
      if (!(event.target instanceof Element) || !event.target.closest('.orbital-art,.orbit-node'))
        return
      const box = root.getBoundingClientRect()
      emit(event.clientX - box.left, event.clientY - box.top, 4)
      lastEmission = performance.now()
    }
    bloom.current = () => emit(width * 0.6, height * 0.38, 28)
    const observer = new ResizeObserver(resize)
    observer.observe(root)
    resize()
    root.addEventListener('pointermove', pointer, { passive: true })
    root.addEventListener('pointerover', pointer, { passive: true })
    document.addEventListener('visibilitychange', clear)
    reduced.addEventListener('change', clear)
    return () => {
      clear()
      bloom.current = null
      observer.disconnect()
      root.removeEventListener('pointermove', pointer)
      root.removeEventListener('pointerover', pointer)
      document.removeEventListener('visibilitychange', clear)
      reduced.removeEventListener('change', clear)
    }
  }, [])

  useEffect(() => {
    bloom.current?.()
  }, [selection])

  return <canvas className="stardust" ref={canvas} aria-hidden="true" />
}
