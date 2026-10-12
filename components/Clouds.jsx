// components/Clouds.jsx
// Wispy, fog-like clouds drawn on a canvas that sits BEHIND the mountain.
// They hang almost still (a very slow drift) and get pushed around when the
// pointer moves through them (or a finger drags across them), then slowly
// settle back to where they were.
//
// How it looks real: every cloud is a soft sprite generated from layered,
// domain-warped noise (stretched horizontally, so it streaks like thin fog),
// white on top with a faint cool grey underside.

import { useEffect, useRef } from 'react'

// ── tiny seeded value-noise ─────────────────────────────────
function hash(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967295
}
function vnoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy)
  const a = hash(ix, iy, seed), b = hash(ix + 1, iy, seed)
  const c = hash(ix, iy + 1, seed), d = hash(ix + 1, iy + 1, seed)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
function fbm(x, y, seed, oct) {
  let s = 0, amp = 0.5, f = 1
  for (let i = 0; i < oct; i++) {
    s += amp * vnoise(x * f, y * f, seed + i * 17)
    f *= 2
    amp *= 0.5
  }
  return s
}

function makeSprite(w, h, seed) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(w, h)
  const d = img.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w, ny = y / h
      const wx = fbm(nx * 3 + seed, ny * 6, seed + 1, 3) - 0.5
      const wy = fbm(nx * 3, ny * 6 + seed, seed + 2, 3) - 0.5
      const n = fbm(nx * 4 + wx * 1.7, ny * 9 + wy * 1.7, seed, 5)
      const dx = (nx - 0.5) * 2, dy = (ny - 0.5) * 2
      const r = Math.sqrt(dx * dx * 0.92 + dy * dy)
      const fall = Math.max(0, 1 - r)
      const fall2 = fall * fall * (3 - 2 * fall)
      let a = (n - 0.36) * 2.5
      a = Math.max(0, Math.min(1, a)) * fall2
      const shade = Math.min(1, Math.max(0, ny + (n - 0.5) * 0.45))
      const i = (y * w + x) * 4
      // white tops, cool blue-grey undersides
      d[i] = 255 - shade * 92
      d[i + 1] = 255 - shade * 76
      d[i + 2] = 255 - shade * 50
      d[i + 3] = a * 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return c
}

export default function Clouds({ front = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    // back layer: sized to the whole hero. front layer (the few clouds drifting over the mountain): sized to its own canvas
    const hero = front ? canvas : canvas.parentElement
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let W = 0, H = 0
    let parts = []
    let raf = 0
    let running = false
    let last = 0
    let t = 0
    let visible = true

    // pointer state (hero-local px)
    const ptr = { x: -9999, y: -9999, vx: 0, vy: 0, active: false, lastT: 0, lx: 0, ly: 0 }

    const sprites = [0, 1, 2, 3].map((i) => makeSprite(360, 170, 11 + i * 29))

    function rand(a, b) { return a + Math.random() * (b - a) }

    function build() {
      const r = hero.getBoundingClientRect()
      W = Math.max(1, Math.round(r.width))
      H = Math.max(1, Math.round(r.height))
      canvas.width = W
      canvas.height = H
      const narrow = W < 700
      const count = front ? 3 : narrow ? 18 : 34
      parts = []
      if (front) {
        // exactly three soft wisps drifting across the mountain
        const spots = [[0.27, 0.58], [0.58, 0.44], [0.8, 0.78]]
        spots.forEach(([fx, fy], i) => {
          const spr = sprites[i % sprites.length]
          const w = W * rand(0.46, 0.6)
          parts.push({
            spr, w, h: w * (spr.height / spr.width),
            hx: fx * W + rand(-0.04, 0.04) * W, hy: fy * H + rand(-0.04, 0.04) * H,
            alpha: rand(0.55, 0.68),
            ax: rand(14, 30), ay: rand(3, 8),
            om: (Math.PI * 2) / rand(34, 60),
            ph: rand(0, 6.28), ph2: rand(0, 6.28),
            dx: 0, dy: 0, vx: 0, vy: 0,
          })
        })
        draw()
        return
      }
      for (let i = 0; i < count; i++) {
        const spr = sprites[i % sprites.length]
        const w = W * rand(narrow ? 0.55 : 0.26, narrow ? 1.0 : 0.62)
        const h = w * (spr.height / spr.width)
        const low = Math.random() < 0.78
        parts.push({
          spr, w, h,
          hx: rand(-0.05, 1.05) * W,
          hy: (low ? rand(0.42, 1.02) : rand(0.08, 0.42)) * H,
          alpha: rand(0.3, 0.72),
          ax: rand(10, 34), ay: rand(3, 11),
          om: (Math.PI * 2) / rand(26, 62),
          ph: rand(0, 6.28), ph2: rand(0, 6.28),
          dx: 0, dy: 0, vx: 0, vy: 0,
        })
      }
      parts.sort((a, b) => a.alpha - b.alpha)
      draw()
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      for (const p of parts) {
        const sc = 1 + 0.03 * Math.sin(t * p.om * 0.7 + p.ph2)
        const cx = p.hx + Math.sin(t * p.om + p.ph) * p.ax + p.dx
        const cy = p.hy + Math.sin(t * p.om * 0.8 + p.ph2) * p.ay + p.dy
        ctx.globalAlpha = p.alpha
        ctx.drawImage(p.spr, cx - (p.w * sc) / 2, cy - (p.h * sc) / 2, p.w * sc, p.h * sc)
      }
      ctx.globalAlpha = 1
    }

    function step(now) {
      raf = 0
      if (!running) return
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
      last = now
      t += dt

      // pointer speed fades out when the pointer stops
      const decay = Math.exp(-dt * 7)
      ptr.vx *= decay
      ptr.vy *= decay
      const speed = Math.hypot(ptr.vx, ptr.vy)

      for (const p of parts) {
        const cx = p.hx + p.dx, cy = p.hy + p.dy
        if (ptr.active) {
          // influence falls off with distance from the cloud's (elliptical) body
          const nd = Math.hypot((ptr.x - cx) / (p.w * 0.46), (ptr.y - cy) / (p.h * 0.62))
          if (nd < 1.2) {
            const k = Math.pow(1 - nd / 1.2, 1.6)
            // follow the sweep at about half the pointer's speed…
            const follow = Math.min(1, dt * 3.2 * k)
            p.vx += (ptr.vx * 0.5 - p.vx) * follow
            p.vy += (ptr.vy * 0.5 - p.vy) * follow
            // …plus a gentle parting from the pointer itself
            const ddx = cx - ptr.x, ddy = cy - ptr.y
            const dl = Math.hypot(ddx, ddy) || 1
            const part = (28 + Math.min(speed, 500) * 0.06) * k
            p.vx += (ddx / dl) * part * dt * 6
            p.vy += (ddy / dl) * part * dt * 3
          }
        }
        // slow spring home + damping = a long, soft settle
        p.vx += (-p.dx * 0.55 - p.vx * 1.15) * dt
        p.vy += (-p.dy * 0.55 - p.vy * 1.15) * dt
        p.dx += p.vx * dt
        p.dy += p.vy * dt
        const lim = p.w * 0.7
        if (p.dx > lim) p.dx = lim
        if (p.dx < -lim) p.dx = -lim
        if (p.dy > lim * 0.5) p.dy = lim * 0.5
        if (p.dy < -lim * 0.5) p.dy = -lim * 0.5
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

    function local(e) {
      const r = hero.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom }
    }
    function onMove(e) {
      const p = local(e)
      if (!p.inside) { ptr.active = false; return }
      const now = performance.now()
      if (ptr.active && now > ptr.lastT) {
        const dtm = (now - ptr.lastT) / 1000
        const ivx = (p.x - ptr.lx) / dtm, ivy = (p.y - ptr.ly) / dtm
        ptr.vx += (Math.max(-1400, Math.min(1400, ivx)) - ptr.vx) * 0.35
        ptr.vy += (Math.max(-1400, Math.min(1400, ivy)) - ptr.vy) * 0.35
      }
      ptr.x = p.x; ptr.y = p.y; ptr.lx = p.x; ptr.ly = p.y; ptr.lastT = now
      ptr.active = true
    }
    function onDown(e) {
      onMove(e)
      if (!ptr.active) return
      // a tap/click puffs the fog outward
      for (const p of parts) {
        const ddx = p.hx + p.dx - ptr.x, ddy = p.hy + p.dy - ptr.y
        const nd = Math.hypot(ddx / (p.w * 0.5), ddy / (p.h * 0.7))
        if (nd < 1.3) {
          const dl = Math.hypot(ddx, ddy) || 1
          const k = 1 - nd / 1.3
          p.vx += (ddx / dl) * 260 * k
          p.vy += (ddy / dl) * 120 * k
        }
      }
    }
    function onLeave() { ptr.active = false }

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      visible ? start() : stop()
    }, { threshold: 0 })
    io.observe(hero)
    function onVis() { document.hidden ? stop() : start() }
    document.addEventListener('visibilitychange', onVis)

    let rt = null
    function onResize() {
      clearTimeout(rt)
      rt = setTimeout(() => {
        const r = hero.getBoundingClientRect()
        if (Math.abs(r.width - W) > 4 || Math.abs(r.height - H) > 40) build()
      }, 150)
    }
    window.addEventListener('resize', onResize)
    // front layer: the mountain image may finish loading after this mounts, so rebuild whenever its box changes size
    let ro = null
    if (front && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        const r = hero.getBoundingClientRect()
        if (Math.abs(r.width - W) > 4 || Math.abs(r.height - H) > 4) build()
      })
      ro.observe(canvas)
    }
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onDown, { passive: true })
      document.addEventListener('pointerleave', onLeave)
    }

    build()
    start()

    return () => {
      stop()
      io.disconnect()
      if (ro) ro.disconnect()
      clearTimeout(rt)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className={front ? 'hero-clouds-front' : 'hero-clouds'} aria-hidden="true" />
}
