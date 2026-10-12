// components/Fireflies.jsx
// Tiny glowing yellow orbs (palette yellow #F5C645) that hover and drift
// gently around the landing section, blink softly like real fireflies,
// and fly away when the pointer (or a finger) gets close.

import { useEffect, useRef } from 'react'

const GLOW = '245,198,69' // #F5C645

function makeGlowSprite(size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const x = c.getContext('2d')
  const r = size / 2
  const g = x.createRadialGradient(r, r, 0, r, r, r)
  g.addColorStop(0, 'rgba(255,248,214,1)')     // hot centre
  g.addColorStop(0.1, `rgba(${GLOW},1)`)        // the yellow core
  g.addColorStop(0.28, `rgba(${GLOW},0.42)`)    // soft halo
  g.addColorStop(0.6, `rgba(${GLOW},0.1)`)
  g.addColorStop(1, `rgba(${GLOW},0)`)
  x.fillStyle = g
  x.fillRect(0, 0, size, size)
  return c
}

export default function Fireflies() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas.parentElement
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sprite = makeGlowSprite(128)

    let W = 0, H = 0, dpr = 1, unit = 1
    let flies = []
    let raf = 0, running = false, last = 0, t = 0, visible = true
    const ptr = { x: -9999, y: -9999, active: false }

    const rand = (a, b) => a + Math.random() * (b - a)

    function build() {
      const r = host.getBoundingClientRect()
      W = Math.max(1, r.width)
      H = Math.max(1, r.height)
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      // sizes scale with the site's root font size (bigger screens → bigger fireflies)
      unit = (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16
      const count = Math.max(14, Math.min(40, Math.round((W * H) / 42000)))
      // keep fireflies already flying; add or drop to match the new count
      while (flies.length > count) flies.pop()
      while (flies.length < count) {
        const a = rand(0, Math.PI * 2)
        flies.push({
          x: rand(0, W), y: rand(0, H),
          vx: Math.cos(a) * 10, vy: Math.sin(a) * 10,
          heading: a, turn: rand(-0.6, 0.6), turnT: rand(1, 4),
          speed: rand(7, 20),
          size: rand(0.7, 1.25),
          ph: rand(0, 6.28), rate: rand(0.5, 1.3),
        })
      }
      flies.forEach((f) => { f.x = Math.min(W, f.x); f.y = Math.min(H, f.y) })
      draw()
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      for (const f of flies) {
        // slow blink: glow swells and dims
        const b = 0.5 + 0.5 * Math.sin(t * f.rate + f.ph)
        const bright = 0.35 + 0.65 * b * b
        const d = (30 + 22 * bright) * f.size * unit // glow diameter
        ctx.globalAlpha = bright
        ctx.drawImage(sprite, f.x - d / 2, f.y - d / 2, d, d)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    function step(now) {
      raf = 0
      if (!running) return
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
      last = now
      t += dt
      const R = 150 * unit // how close the pointer has to get before they flee

      for (const f of flies) {
        // gentle wandering: heading drifts slowly, speed is low
        f.turnT -= dt
        if (f.turnT <= 0) { f.turn = rand(-0.7, 0.7); f.turnT = rand(1.5, 4.5) }
        f.heading += f.turn * dt
        const wx = Math.cos(f.heading) * f.speed * unit
        const wy = Math.sin(f.heading) * f.speed * unit * 0.8 + Math.sin(t * 0.8 + f.ph) * 4 * unit // slight bob

        // ease back toward the calm wander velocity
        const ease = Math.min(1, dt * 1.4)
        f.vx += (wx - f.vx) * ease
        f.vy += (wy - f.vy) * ease

        // fly away from the pointer
        if (ptr.active) {
          const dx = f.x - ptr.x, dy = f.y - ptr.y
          const dist = Math.hypot(dx, dy) || 1
          if (dist < R) {
            const k = 1 - dist / R
            const push = k * k * 1500 * unit
            f.vx += (dx / dist) * push * dt
            f.vy += (dy / dist) * push * dt
            // face away so it keeps going that way after the scare
            f.heading = Math.atan2(f.vy, f.vx)
          }
        }
        // speed limit
        const sp = Math.hypot(f.vx, f.vy)
        const maxSp = 460 * unit
        if (sp > maxSp) { f.vx = (f.vx / sp) * maxSp; f.vy = (f.vy / sp) * maxSp }

        f.x += f.vx * dt
        f.y += f.vy * dt

        // stay inside the section: turn around softly at the edges
        const m = 12
        if (f.x < m) { f.vx += 60 * dt * unit * 4; f.heading = rand(-0.6, 0.6) }
        if (f.x > W - m) { f.vx -= 60 * dt * unit * 4; f.heading = Math.PI + rand(-0.6, 0.6) }
        if (f.y < m) { f.vy += 60 * dt * unit * 4; f.heading = Math.PI / 2 + rand(-0.6, 0.6) }
        if (f.y > H - m) { f.vy -= 60 * dt * unit * 4; f.heading = -Math.PI / 2 + rand(-0.6, 0.6) }
        f.x = Math.max(-20, Math.min(W + 20, f.x))
        f.y = Math.max(-20, Math.min(H + 20, f.y))
      }
      draw()
      raf = requestAnimationFrame(step)
    }

    function start() {
      if (running || reduce || !visible || document.hidden) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(step)
    }
    function stop() {
      running = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    function onMove(e) {
      const r = host.getBoundingClientRect()
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      ptr.active = inside
      if (inside) { ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top }
    }
    function onLeave() { ptr.active = false }

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      visible ? start() : stop()
    }, { threshold: 0 })
    io.observe(host)
    const ro = new ResizeObserver(() => build())
    ro.observe(host)
    function onVis() { document.hidden ? stop() : start() }
    document.addEventListener('visibilitychange', onVis)
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onMove, { passive: true })
      window.addEventListener('pointerup', onLeave, { passive: true })
      window.addEventListener('pointercancel', onLeave, { passive: true })
      document.addEventListener('pointerleave', onLeave)
    }

    build()
    start()
    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      window.removeEventListener('pointerup', onLeave)
      window.removeEventListener('pointercancel', onLeave)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="landing-fireflies" aria-hidden="true" />
}
