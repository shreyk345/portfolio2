// lib/stickers.js  (client-side)
// Shared sticker helpers: measuring, margin-only placement, and dragging.

const sizeCache = {}

export function loadStickerSize(src) {
  if (sizeCache[src]) return Promise.resolve(sizeCache[src])
  return new Promise((resolve) => {
    const im = new Image()
    im.onload = () => {
      const r = { w: im.naturalWidth || 1, h: im.naturalHeight || 1 }
      sizeCache[src] = r
      resolve(r)
    }
    im.onerror = () => resolve({ w: 1, h: 1, broken: true })
    im.src = src
  })
}

export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build the <img> for one sticker, centred at (cx, cy) in its layer's space.
export function createStickerEl({ src, w, h, cx, cy, rot }) {
  const el = document.createElement('img')
  el.src = src
  el.alt = ''
  el.draggable = false
  el.className = 'sticker'
  el.style.width = w + 'px'
  el.style.height = h + 'px'
  el.style.left = cx - w / 2 + 'px'
  el.style.top = cy - h / 2 + 'px'
  el.style.transform = `rotate(${rot}deg)`
  return el
}

// Drag a sticker without ever panning/scrolling whatever is behind it.
// getScale lets Play (whose world is zoomed) convert screen px → world px.
export function makeStickerDraggable(el, getScale = () => 1, onDrag) {
  let startX, startY, origL, origT, active = false

  function down(e) {
    if (e.button !== undefined && e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    active = true
    el.setPointerCapture?.(e.pointerId)
    el.classList.add('dragging')
    startX = e.clientX
    startY = e.clientY
    origL = parseFloat(el.style.left) || 0
    origT = parseFloat(el.style.top) || 0
  }
  function move(e) {
    if (!active) return
    e.stopPropagation()
    const s = getScale() || 1
    el.style.left = origL + (e.clientX - startX) / s + 'px'
    el.style.top = origT + (e.clientY - startY) / s + 'px'
  }
  function up(e) {
    if (!active) return
    active = false
    e.stopPropagation()
    el.classList.remove('dragging')
    try { el.releasePointerCapture?.(e.pointerId) } catch {}
    if (onDrag) onDrag(el)
  }
  el.addEventListener('pointerdown', down)
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
  return () => {
    el.removeEventListener('pointerdown', down)
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
  }
}

function rotatedBox(w, h, deg) {
  const r = (deg * Math.PI) / 180
  const c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r))
  return { bw: w * c + h * s, bh: w * s + h * c }
}

function hits(a, b) {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0
}

// Place stickers ONLY in empty margins.
//   W,H     – size of the region
//   avoid   – rectangles ({x0,y0,x1,y1}) stickers must stay out of
//   items   – [{src, w, h}] natural sizes
//   gap     – min distance between stickers (negative lets collage overlap a little)
//   baseSize– longest-side size of a sticker in px (before random 0.85–1.2 variation)
export function placeInMargins({ W, H, avoid, items, gap, baseSize, narrow }) {
  const placed = []
  const boxes = []
  const out = []
  for (const it of items) {
    if (it.broken) continue
    const aspect = it.w / it.h
    let best = null, bestScore = -1
    let tries = 0, found = 0
    while (tries < 140 && found < 14) {
      tries++
      const L = baseSize * (0.85 + Math.random() * 0.35)
      const w = aspect >= 1 ? L : L * aspect
      const h = aspect >= 1 ? L / aspect : L
      const rot = (Math.random() - 0.5) * 32
      const { bw, bh } = rotatedBox(w, h, rot)
      const bleed = narrow ? bw * 0.4 : 0
      const cx = -bleed + bw / 2 + Math.random() * (W + 2 * bleed - bw)
      const cy = bh / 2 + Math.random() * Math.max(0, H - bh)
      const box = { x0: cx - bw / 2 - gap / 2, y0: cy - bh / 2 - gap / 2, x1: cx + bw / 2 + gap / 2, y1: cy + bh / 2 + gap / 2 }
      if (avoid.some((r) => hits(box, r))) continue
      if (boxes.some((b) => hits(box, b))) continue
      found++
      // best-candidate sampling: prefer the spot furthest from stickers already placed
      let score = 1e9
      for (const p of placed) score = Math.min(score, Math.hypot(p.cx - cx, p.cy - cy))
      if (score > bestScore) { bestScore = score; best = { cx, cy, w, h, rot, box } }
    }
    if (best) {
      placed.push(best)
      boxes.push(best.box)
      out.push({ src: it.src, ...best })
    }
  }
  return out
}
