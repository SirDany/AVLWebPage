'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { useInterfaceSound } from './InterfaceAudio'
import { orbitIndex, orbitNodes } from '@/lib/orbit'
import { Stardust } from './Stardust'

export type OrbitalItem = {
  id: number
  title: string
  summary: string
  href: string
  image?: { url: string; alt: string }
  date?: string | null
  state?: string
  sample?: true
}

export function OrbitalMenu({
  items,
  initialID,
}: {
  items: OrbitalItem[]
  initialID?: number | null
}) {
  const [position, setPosition] = useState(() =>
    Math.max(
      0,
      items.findIndex((item) => item.id === initialID),
    ),
  )
  const root = useRef<HTMLElement>(null)
  const current = useRef(position)
  const drag = useRef<{ x: number; y: number; last: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const play = useInterfaceSound()
  const index = orbitIndex(position, items.length)
  const item = items[index]

  useEffect(() => {
    const element = root.current
    if (!element || items.length < 2) return
    let sum = 0
    let last = 0
    let lastInput = 0
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 500 : 1)
      if (!delta) return
      const direction = Math.sign(delta)
      const next = current.current + direction
      event.preventDefault()
      const now = performance.now()
      if (now - lastInput > 180 || Math.sign(sum) !== direction) sum = 0
      lastInput = now
      sum += delta
      if (Math.abs(sum) < 65 || now - last < 220) return
      last = now
      sum = 0
      current.current = next
      setPosition(next)
      play('detent')
    }
    element.addEventListener('wheel', wheel, { passive: false })
    return () => element.removeEventListener('wheel', wheel)
  }, [items.length, play])

  function select(next: number) {
    if (items.length < 2 || next === current.current) return
    current.current = next
    setPosition(next)
    play('detent')
  }

  function move(event: PointerEvent<HTMLElement>) {
    const start = drag.current
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (!start.moved && Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) {
      drag.current = null
      return
    }
    if (Math.abs(dx) < 14 || Math.abs(dx) <= Math.abs(dy) * 1.2) return
    if (!start.moved) event.currentTarget.setPointerCapture(event.pointerId)
    start.moved = true
    suppressClick.current = true
    if (Math.abs(event.clientX - start.last) >= 48) {
      select(current.current + (event.clientX < start.last ? 1 : -1))
      start.last = event.clientX
    }
  }

  return (
    <section
      className="orbital orbital-project"
      aria-label="Project constellation"
      ref={root}
      tabIndex={items.length > 1 ? 0 : undefined}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLAnchorElement) return
        const next =
          event.key === 'ArrowRight' || event.key === 'ArrowDown'
            ? current.current + 1
            : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
              ? current.current - 1
              : event.key === 'Home'
                ? current.current - index
                : event.key === 'End'
                  ? current.current - index + items.length - 1
                  : null
        if (next !== null) {
          event.preventDefault()
          select(next)
          event.currentTarget.focus({ preventScroll: true })
        }
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        suppressClick.current = false
        drag.current = { x: event.clientX, y: event.clientY, last: event.clientX, moved: false }
      }}
      onPointerMove={move}
      onPointerUp={() => {
        drag.current = null
      }}
      onPointerCancel={() => {
        drag.current = null
      }}
      onLostPointerCapture={(event) => {
        if (event.target === event.currentTarget) drag.current = null
      }}
      onClickCapture={(event) => {
        if (suppressClick.current) {
          suppressClick.current = false
          if (event.detail === 0) return
          event.preventDefault()
          event.stopPropagation()
        }
      }}
    >
      <Stardust selection={position} />
      <div className="orbital-heading">
        <span>Selected projects</span>
        <span aria-hidden="true">
          {items.length
            ? `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`
            : '—'}
        </span>
      </div>
      <div className="orbital-traces" key={`trace-${index}`} aria-hidden="true">
        <svg viewBox="0 0 600 600" fill="none">
          <circle cx="300" cy="300" r="240" />
          <path d="M60 300H540M300 60V540M130 130L470 470M130 470L470 130M180 92L420 508M92 420L508 180" />
          <path d="M300 60L508 420H92Z M300 540L92 180H508Z" />
          <circle cx="300" cy="300" r="120" />
        </svg>
        <span>eⁱπ + 1 = 0</span>
      </div>
      {item ? (
        <>
          <div className="orbital-display" key={item.id}>
            {item.image && (
              <Link
                className="orbital-art"
                href={item.href}
                aria-label={`View ${item.title}`}
                draggable={false}
              >
                <img
                  src={item.image.url}
                  alt={item.image.alt}
                  width="1400"
                  height="1540"
                  draggable={false}
                  fetchPriority="high"
                />
              </Link>
            )}
            <div className="orbital-caption">
              {item.sample && <span className="demo-label">Digital study / demo</span>}
              {item.date && (
                <time dateTime={item.date}>
                  {new Date(item.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })}
                </time>
              )}
              {item.state && <span className="orbital-state">{item.state}</span>}
              <h2>
                <Link href={item.href}>
                  {item.title}
                  <span aria-hidden="true"> ↗</span>
                </Link>
              </h2>
              <p>{item.summary}</p>
            </div>
          </div>
          <div className="orbit-track" aria-label="Select project">
            <svg className="orbit-lines" viewBox="0 0 600 140" aria-hidden="true" fill="none">
              <path d="M20 105Q300 -75 580 105M45 119Q300 -40 555 119" />
              <path d="M300 14V128M120 58L300 128L480 58" />
            </svg>
            {orbitNodes(position, items.length).map((node) => {
              const entry = items[node.index]
              const angle = (node.distance * Math.PI) / 6
              const x = 50 + 43 * Math.sin(angle)
              const y = 82 - 60 * Math.cos(angle)
              return (
                <button
                  type="button"
                  key={node.position}
                  className="orbit-node"
                  data-distance={Math.abs(node.distance)}
                  style={{ '--node-x': `${x}%`, '--node-y': `${y}%` } as CSSProperties}
                  aria-label={`Select ${entry.title}`}
                  aria-pressed={node.distance === 0}
                  onClick={() => select(node.position)}
                >
                  <span className="node-dot" aria-hidden="true" />
                  <span className="node-title">{entry.title}</span>
                </button>
              )
            })}
          </div>
          <div className="orbital-instructions" aria-hidden="true">
            <span className="wheel-hint">Hover &amp; scroll</span>
            <span className="touch-hint">Swipe to select</span>
            <span>← →</span>
          </div>
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {item.title}
          </span>
        </>
      ) : (
        <p className="orbital-no-content">No published work.</p>
      )}
    </section>
  )
}
