// components/NowRotator.jsx
// "Right now, I'm probably…" followed by a phrase that changes on the SAME line.
// Each new phrase slides up into place while the old one slides out the top.

import { useEffect, useRef, useState } from 'react'

// each phrase gets its own colour from the palette (orange, teal, yellow, pink, black — then it starts over)
const PHRASES = [
  { text: 'redesigning my portfolio (again)', color: '#FE602F' },
  { text: 'napping zzz', color: '#64CEBB' },
  { text: 'hanging with my friends', color: '#F5C645' },
  { text: 'in another country', color: '#E6C7EB' },
  { text: 'locked-in to school (aren’t you so impressed)', color: '#000000' },
  { text: 'planning my next hike', color: '#FE602F' },
  { text: 'applying to another job (help me)', color: '#64CEBB' },
]
const INTERVAL_MS = 2800

export default function NowRotator() {
  const [cur, setCur] = useState(0)
  const [prev, setPrev] = useState(-1)
  const hostRef = useRef(null)

  useEffect(() => {
    let timer = null
    let visible = true
    const tick = () => {
      setCur((c) => {
        setPrev(c)
        return (c + 1) % PHRASES.length
      })
    }
    const start = () => { if (!timer && visible && !document.hidden) timer = setInterval(tick, INTERVAL_MS) }
    const stop = () => { if (timer) { clearInterval(timer); timer = null } }
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop() }, { threshold: 0 })
    if (hostRef.current) io.observe(hostRef.current)
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    start()
    return () => { stop(); io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  return (
    <p className="hero-now" ref={hostRef}>
      <span className="hero-now-label">Right now, I’m probably…</span>{' '}
      <span className="hero-now-window" aria-live="polite" data-nowrite data-fade data-rv-delay="750">
        {PHRASES.map(({ text, color }, i) => (
          <span
            key={text}
            className={`hero-now-item ${i === cur ? 'is-active' : i === prev ? 'is-prev' : ''}`}
            style={{ color }}
            aria-hidden={i === cur ? undefined : 'true'}
          >
            {text}
          </span>
        ))}
      </span>
    </p>
  )
}
