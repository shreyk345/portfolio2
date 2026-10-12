// components/DoodlePen.jsx — a pen in the bottom-left corner of every page.
// Click it → a row of palette colours appears and you can doodle anywhere on the screen.
// Undo takes back the last line; the bin deletes every doodle on the current page.
// Click the pen again → drawing turns off (your doodles stay on the page until it is reloaded).
// Doodles are attached to the page, so they scroll with the content.

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

// the site palette
const COLORS = [
  { name: 'orange', hex: '#FE602F' },
  { name: 'teal', hex: '#64CEBB' },
  { name: 'yellow', hex: '#F5C645' },
  { name: 'pink', hex: '#E6C7EB' },
  { name: 'black', hex: '#000000' },
  { name: 'cream', hex: '#EFF0E9' },
]

export default function DoodlePen() {
  const router = useRouter()
  const pageKey = (router.asPath || '/').split('#')[0].split('?')[0]

  const [on, setOn] = useState(false)
  const [color, setColor] = useState(COLORS[0].hex)
  const [count, setCount] = useState(0)   // how many lines are on this page (enables / disables undo + delete)

  const canvasRef = useRef(null)
  const strokes = useRef({})          // pageKey -> [{ color, w, pts: [[x, y], …] }]  (x, y in PAGE coordinates)
  const keyRef = useRef(pageKey)
  const colorRef = useRef(color)
  const size = useRef({ w: 0, h: 0, dpr: 1, unit: 1 })
  const current = useRef(null)
  const raf = useRef(0)

  keyRef.current = pageKey
  colorRef.current = color

  function redraw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { w, h, dpr } = size.current
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const sx = window.scrollX, sy = window.scrollY
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const s of strokes.current[keyRef.current] || []) {
      ctx.strokeStyle = s.color
      ctx.fillStyle = s.color
      ctx.lineWidth = s.w
      const p = s.pts
      if (p.length === 1) {
        ctx.beginPath()
        ctx.arc(p[0][0] - sx, p[0][1] - sy, s.w / 2, 0, Math.PI * 2)
        ctx.fill()
        continue
      }
      ctx.beginPath()
      ctx.moveTo(p[0][0] - sx, p[0][1] - sy)
      for (let i = 1; i < p.length - 1; i++) {
        const mx = (p[i][0] + p[i + 1][0]) / 2 - sx
        const my = (p[i][1] + p[i + 1][1]) / 2 - sy
        ctx.quadraticCurveTo(p[i][0] - sx, p[i][1] - sy, mx, my)
      }
      const last = p[p.length - 1]
      ctx.lineTo(last[0] - sx, last[1] - sy)
      ctx.stroke()
    }
  }

  function schedule() {
    if (raf.current) return
    raf.current = requestAnimationFrame(() => { raf.current = 0; redraw() })
  }

  // canvas size + redraw on scroll / resize
  useEffect(() => {
    const canvas = canvasRef.current
    function fit() {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = window.innerWidth, h = window.innerHeight
      const unit = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16
      size.current = { w, h, dpr, unit }
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      redraw()
    }
    fit()
    window.addEventListener('resize', fit)
    window.addEventListener('scroll', schedule, { passive: true })
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('scroll', schedule)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  // each page shows its own doodles
  useEffect(() => { redraw(); setCount((strokes.current[pageKey] || []).length) }, [pageKey])

  function undo() {
    const list = strokes.current[keyRef.current] || []
    list.pop()
    setCount(list.length)
    redraw()
  }
  function clearAll() {
    strokes.current[keyRef.current] = []
    setCount(0)
    redraw()
  }

  function pt(e) {
    return [e.clientX + window.scrollX, e.clientY + window.scrollY]
  }
  function down(e) {
    if (!on || (e.pointerType === 'mouse' && e.button !== 0)) return
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const s = { color: colorRef.current, w: 4.5 * size.current.unit, pts: [pt(e)] }
    const list = (strokes.current[keyRef.current] ||= [])
    list.push(s)
    setCount(list.length)
    current.current = s
    schedule()
  }
  function move(e) {
    const s = current.current
    if (!s) return
    const events = e.nativeEvent.getCoalescedEvents ? e.nativeEvent.getCoalescedEvents() : [e.nativeEvent]
    for (const ev of events.length ? events : [e.nativeEvent]) s.pts.push([ev.clientX + window.scrollX, ev.clientY + window.scrollY])
    schedule()
  }
  function up() { current.current = null }

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`doodle-canvas ${on ? 'is-on' : ''}`}
        data-nofade
        aria-hidden="true"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
      <div className={`doodle-ui ${on ? 'is-on' : ''}`}>
        <button
          type="button"
          className="doodle-pen"
          style={on ? { '--pen-color': color } : undefined}
          aria-label={on ? 'Stop doodling' : 'Doodle on the page'}
          aria-pressed={on}
          onClick={() => setOn((v) => !v)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 21l1.2-4.6L16.6 4a2.1 2.1 0 013 3L7.2 19.4 3 21z" />
            <path d="M14.5 6.1l3.4 3.4" />
          </svg>
        </button>
        <div className="doodle-palette" role="group" aria-label="Pen colour" aria-hidden={!on}>
          {COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              tabIndex={on ? 0 : -1}
              className={`doodle-swatch ${color === c.hex ? 'active' : ''}`}
              style={{ background: c.hex }}
              aria-label={c.name}
              aria-pressed={color === c.hex}
              onClick={() => setColor(c.hex)}
            />
          ))}
          <span className="doodle-sep" aria-hidden="true" />
          <button type="button" className="doodle-tool" tabIndex={on ? 0 : -1} disabled={!count} aria-label="Undo" title="Undo" onClick={undo}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 14L4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 010 11H11" />
            </svg>
          </button>
          <button type="button" className="doodle-tool" tabIndex={on ? 0 : -1} disabled={!count} aria-label="Delete all doodles" title="Delete all doodles" onClick={clearAll}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 7h16" />
              <path d="M10 11v6M14 11v6" />
              <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
              <path d="M9 7V4h6v3" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
