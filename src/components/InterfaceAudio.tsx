'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type Tone = 'hover' | 'click' | 'detent'
const AudioFeedback = createContext<(tone: Tone) => void>(() => {})
export const useInterfaceSound = () => useContext(AudioFeedback)

export function InterfaceAudio({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false)
  const disabled = useRef(false)
  const audio = useRef<AudioContext | null>(null)
  const voices = useRef(new Set<OscillatorNode>())
  const last = useRef(0)
  const reported = useRef(false)

  const report = useCallback((error: unknown) => {
    if (reported.current) return
    reported.current = true
    console.warn('Interface audio unavailable:', error)
  }, [])

  const play = useCallback(
    (tone: Tone) => {
      if (disabled.current || !window.AudioContext) return
      const now = performance.now()
      if (now - last.current < (tone === 'hover' ? 350 : 180)) return
      try {
        audio.current ??= new AudioContext()
        const context = audio.current
        if (context.state !== 'running') {
          if (navigator.userActivation?.isActive) void context.resume().catch(report)
          return
        }
        if (voices.current.size >= 9) return
        last.current = now
        const start = context.currentTime
        const fundamental = tone === 'hover' ? 110 : tone === 'detent' ? 82.4069 : 146.8324
        const duration = tone === 'hover' ? 0.85 : 1.6
        const attack = tone === 'hover' ? 0.16 : 0.22
        const harmonics = tone === 'click' ? [1, 1.5, 4] : [1, 1.5, 2.003]
        for (const [layer, harmonic] of harmonics.entries()) {
          const oscillator = context.createOscillator()
          const gain = context.createGain()
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(fundamental * harmonic, start)
          oscillator.detune.setValueAtTime(layer === 1 ? -3 : 2, start)
          const level = (tone === 'hover' ? 0.007 : 0.012) / (layer + 1)
          gain.gain.setValueAtTime(0, start)
          gain.gain.linearRampToValueAtTime(level, start + attack + layer * 0.03)
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
          gain.gain.linearRampToValueAtTime(0, start + duration + 0.05)
          oscillator.connect(gain).connect(context.destination)
          voices.current.add(oscillator)
          oscillator.onended = () => {
            voices.current.delete(oscillator)
            oscillator.disconnect()
            gain.disconnect()
          }
          oscillator.start(start)
          oscillator.stop(start + duration + 0.06)
        }
      } catch (error) {
        report(error)
      }
    },
    [report],
  )

  useEffect(() => {
    const activeVoices = voices.current
    let frame = 0
    try {
      disabled.current = localStorage.getItem('avl-sound-muted') === 'true'
      frame = requestAnimationFrame(() => setMuted(disabled.current))
    } catch (error) {
      report(error)
    }
    const hover = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest('a,button') : null
      if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)))
        return
      play('hover')
    }
    const activate = (event: Event) => {
      if (
        event instanceof KeyboardEvent &&
        !['Enter', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(
          event.key,
        )
      )
        return
      if (disabled.current) return
      try {
        audio.current ??= new AudioContext()
        if (audio.current.state !== 'running') void audio.current.resume().catch(report)
      } catch (error) {
        report(error)
      }
    }
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      if (event.target instanceof Element && event.target.closest('a,button')) play('click')
    }
    document.addEventListener('pointerover', hover)
    document.addEventListener('pointerdown', activate, true)
    document.addEventListener('keydown', activate, true)
    document.addEventListener('click', click)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointerover', hover)
      document.removeEventListener('pointerdown', activate, true)
      document.removeEventListener('keydown', activate, true)
      document.removeEventListener('click', click)
      for (const voice of activeVoices) voice.stop()
      if (audio.current) void audio.current.close().catch(report)
      audio.current = null
    }
  }, [play, report])

  return (
    <AudioFeedback.Provider value={play}>
      {children}
      <button
        className="sound-switch"
        type="button"
        aria-label={muted ? 'Unmute interaction sounds' : 'Mute interaction sounds'}
        aria-pressed={muted}
        onClick={() => {
          const next = !disabled.current
          disabled.current = next
          setMuted(next)
          if (next) for (const voice of voices.current) voice.stop()
          try {
            localStorage.setItem('avl-sound-muted', String(next))
          } catch (error) {
            report(error)
          }
          if (!next) play('click')
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M4 9H8L13 5V19L8 15H4Z" />
          {muted ? (
            <path d="M17 9L22 15M22 9L17 15" />
          ) : (
            <path d="M17 8Q22 12 17 16M19 4Q27 12 19 20" />
          )}
        </svg>
      </button>
    </AudioFeedback.Provider>
  )
}
