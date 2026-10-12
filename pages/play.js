import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import { getPlayImages } from '../lib/play-images'
import { getStickers } from '../lib/stickers-server'
import { loadStickerSize, createStickerEl, makeStickerDraggable } from '../lib/stickers'

const BRAND_PALETTE = ['#64CEBB', '#E6C7EB', '#F5C645', '#FE602F']
const PLACEMENT_W = 1500, PLACEMENT_H = 1150 // scatter area within one tile
const ITEM_W = 210, ITEM_H = 190             // approx piece footprint, for spacing
const MIN_GAP_X = 34, MIN_GAP_Y = 30
const KEEP_OUT = { x0: 280, y0: 230, x1: 900, y1: 650 } // clearing for heading, tile (0,0) only
const TILE_X = PLACEMENT_W + 250
const TILE_Y = PLACEMENT_H + 250
const RANGE = 2 // renders a 5x5 block of tiles around the current view

function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function scatterPlace(count, avoidKeepOut, seedBase) {
  const placed = []
  let seed = seedBase
  for (let i = 0; i < count; i++) {
    let found = false
    for (let attempt = 0; attempt < 400 && !found; attempt++) {
      seed++
      const x = seededRandom(seed) * (PLACEMENT_W - ITEM_W)
      const y = seededRandom(seed + 0.41) * (PLACEMENT_H - ITEM_H)
      if (avoidKeepOut && x < KEEP_OUT.x1 && x + ITEM_W > KEEP_OUT.x0 && y < KEEP_OUT.y1 && y + ITEM_H > KEEP_OUT.y0) continue
      let collides = false
      for (let k = 0; k < placed.length; k++) {
        const p = placed[k]
        if (x < p.x + ITEM_W + MIN_GAP_X && x + ITEM_W + MIN_GAP_X > p.x &&
            y < p.y + ITEM_H + MIN_GAP_Y && y + ITEM_H + MIN_GAP_Y > p.y) { collides = true; break }
      }
      if (collides) continue
      placed.push({ x, y })
      found = true
    }
    if (!found) {
      placed.push({ x: seededRandom(seed + 77) * (PLACEMENT_W - ITEM_W), y: seededRandom(seed + 133) * (PLACEMENT_H - ITEM_H) })
    }
  }
  return placed
}

function buildThumb(item, accent, videoObserver) {
  const thumb = document.createElement('div')
  thumb.className = 'play-item-thumb'
  if (item.isVideo) {
    const vid = document.createElement('video')
    vid.src = item.src
    vid.muted = true
    vid.loop = true
    vid.playsInline = true
    vid.preload = 'metadata'
    thumb.appendChild(vid)
    if (videoObserver) videoObserver.observe(vid)
  } else if (item.src) {
    const img = document.createElement('img')
    img.src = item.src
    img.alt = item.title || ''
    img.loading = 'lazy'
    thumb.appendChild(img)
  } else {
    thumb.classList.add('placeholder')
    thumb.style.background = `linear-gradient(135deg, ${accent}55, ${accent}15)`
  }
  return thumb
}

export default function Play({ playImages, stickers }) {
  const vpRef = useRef(null)
  const worldRef = useRef(null)
  const itemsLayerRef = useRef(null)
  const lightboxRef = useRef(null)
  const lightboxFrameRef = useRef(null)
  const [lightboxTitle, setLightboxTitle] = useState('')
  const [lightboxDescription, setLightboxDescription] = useState('')

  useEffect(() => {
    const vp = vpRef.current
    const world = worldRef.current
    // The canvas is zoomed up a little on big screens (1440px wide and below = 1:1)
    // so everything stays comfortably sized on a 16" laptop or a monitor.
    function computeScale() { return Math.max(1, Math.min(1.6, window.innerWidth / 1440)) }
    let S = computeScale()
    const navH = document.querySelector('.site-nav')?.offsetHeight || 64
    // lands the heading just below the navbar, at the viewport's left, on load
    let panX = 72 - 400 * S, panY = navH + 36 - 286 * S

    function applyPan() {
      world.style.transform = `translate(${panX}px,${panY}px) scale(${S})`
      // the dot grid pans (and zooms) with the canvas
      vp.style.setProperty('--play-dot', 28 * S + 'px')
      vp.style.backgroundPosition = `${panX + 14 * S}px ${panY + 14 * S}px`
    }

    const homeCells = scatterPlace(playImages.length, true, 4000)
    const repeatCells = scatterPlace(playImages.length, false, 8000)

    const videoObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const v = entry.target
            if (entry.isIntersecting) v.play().catch(() => {})
            else v.pause()
          })
        }, { threshold: 0.15 })
      : null

    function openLightbox(item, accent) {
      const frame = lightboxFrameRef.current
      frame.innerHTML = ''
      frame.classList.remove('placeholder')
      frame.style.background = ''
      if (item.isVideo) {
        const vid = document.createElement('video')
        vid.src = item.src
        vid.controls = true
        vid.autoplay = true
        vid.loop = true
        vid.playsInline = true
        frame.appendChild(vid)
      } else if (item.src) {
        const img = document.createElement('img')
        img.src = item.src
        img.alt = item.title || ''
        frame.appendChild(img)
      } else {
        frame.classList.add('placeholder')
        frame.style.background = `linear-gradient(135deg, ${accent}77, ${accent}22)`
      }
      setLightboxTitle(item.title)
      setLightboxDescription(item.description || '')
      lightboxRef.current.classList.add('open')
    }

    function renderItemsForTile(tx, ty, container) {
      const cells = (tx === 0 && ty === 0) ? homeCells : repeatCells
      const offX = tx * TILE_X, offY = ty * TILE_Y
      playImages.forEach((item, i) => {
        const cell = cells[i % cells.length]
        const rot = (seededRandom(i * 2.3 + tx * 13.1 + ty * 31.7) - 0.5) * 6
        const accent = BRAND_PALETTE[i % BRAND_PALETTE.length]

        const el = document.createElement('a')
        el.href = '#'
        el.className = 'play-item'
        el.style.left = (offX + cell.x) + 'px'
        el.style.top = (offY + cell.y) + 'px'
        el.style.transform = `rotate(${rot.toFixed(2)}deg)`
        el.style.setProperty('--item-accent', accent)

        const thumb = buildThumb(item, accent, videoObserver)
        const title = document.createElement('div')
        title.className = 'play-item-title'
        title.textContent = item.title

        el.appendChild(thumb)
        el.appendChild(title)
        el.addEventListener('click', (e) => {
          e.preventDefault()
          openLightbox(item, accent)
        })
        container.appendChild(el)
      })
      renderStickersForTile(tx, ty, cells, container)
    }

    // ── Stickers scattered over the canvas, in the gaps between pieces ──
    const dragged = new Map() // remembers where you moved a sticker to
    const stickerSizes = {}
    function renderStickersForTile(tx, ty, cells, container) {
      if (!stickers || !stickers.length) return
      const isHome = tx === 0 && ty === 0
      const seedBase = 9000 + tx * 131 + ty * 977
      const n = Math.min(stickers.length, 9)
      const pad = 26
      const boxes = cells.slice(0, playImages.length).map((c) => ({ x0: c.x - pad, y0: c.y - pad, x1: c.x + ITEM_W + pad, y1: c.y + ITEM_H + 36 + pad }))
      if (isHome) boxes.push({ x0: KEEP_OUT.x0 - 40, y0: KEEP_OUT.y0 - 60, x1: KEEP_OUT.x1 + 40, y1: KEEP_OUT.y1 + 20 })
      const placedBoxes = []
      const offX = tx * TILE_X, offY = ty * TILE_Y
      // a stable pick of which stickers appear in this tile
      const order = stickers.map((src, i) => ({ src, k: seededRandom(seedBase + i * 7.7) })).sort((a, b) => a.k - b.k)
      for (let i = 0; i < n; i++) {
        const src = order[i].src
        const size = stickerSizes[src] || { w: 1, h: 1 }
        if (size.broken) continue
        const aspect = size.w / size.h
        const L = 70 + seededRandom(seedBase + i * 3.1) * 40
        const w = aspect >= 1 ? L : L * aspect
        const h = aspect >= 1 ? L / aspect : L
        const rot = (seededRandom(seedBase + i * 5.3) - 0.5) * 32
        const bw = Math.max(w, h) * 1.15
        for (let attempt = 0; attempt < 80; attempt++) {
          const cx = -125 + seededRandom(seedBase + i * 11 + attempt * 1.7) * (PLACEMENT_W + 250)
          const cy = -125 + seededRandom(seedBase + i * 13 + attempt * 2.3) * (PLACEMENT_H + 250)
          const box = { x0: cx - bw / 2, y0: cy - bw / 2, x1: cx + bw / 2, y1: cy + bw / 2 }
          const hit = (b) => box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0
          if (boxes.some(hit) || placedBoxes.some(hit)) continue
          placedBoxes.push(box)
          const key = `${tx},${ty},${i}`
          const el = createStickerEl({ src, w, h, cx: offX + cx, cy: offY + cy, rot })
          const saved = dragged.get(key)
          if (saved) { el.style.left = saved.l; el.style.top = saved.t }
          makeStickerDraggable(el, () => S, (node) => dragged.set(key, { l: node.style.left, t: node.style.top }))
          container.appendChild(el)
          requestAnimationFrame(() => el.classList.add('placed'))
          break
        }
      }
    }

    let lastCenterTX = null, lastCenterTY = null
    function renderTiles() {
      const centerTX = Math.round(-panX / (TILE_X * S))
      const centerTY = Math.round(-panY / (TILE_Y * S))
      lastCenterTX = centerTX; lastCenterTY = centerTY
      const layer = itemsLayerRef.current
      layer.innerHTML = ''
      for (let tx = centerTX - RANGE; tx <= centerTX + RANGE; tx++) {
        for (let ty = centerTY - RANGE; ty <= centerTY + RANGE; ty++) {
          renderItemsForTile(tx, ty, layer)
        }
      }
    }
    function maybeRetile() {
      const centerTX = Math.round(-panX / (TILE_X * S))
      const centerTY = Math.round(-panY / (TILE_Y * S))
      if (centerTX !== lastCenterTX || centerTY !== lastCenterTY) renderTiles()
    }

    // Pan: drag or wheel, unbounded transform — no scroll container, so
    // there's no edge to ever reach.
    let isDown = false, startX, startY, panStartX, panStartY
    function onPointerDown(e) {
      isDown = true
      startX = e.clientX; startY = e.clientY
      panStartX = panX; panStartY = panY
      vp.classList.add('dragging')
    }
    function onPointerMove(e) {
      if (!isDown) return
      panX = panStartX + (e.clientX - startX)
      panY = panStartY + (e.clientY - startY)
      applyPan()
      maybeRetile()
    }
    function onPointerUp() {
      isDown = false
      vp.classList.remove('dragging')
    }
    function onWheel(e) {
      e.preventDefault()
      panX -= e.deltaX
      panY -= e.deltaY
      applyPan()
      maybeRetile()
    }

    vp.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    vp.addEventListener('wheel', onWheel, { passive: false })

    function onResize() {
      S = computeScale()
      applyPan()
      renderTiles()
    }
    window.addEventListener('resize', onResize)

    applyPan()
    let cancelled = false
    Promise.all((stickers || []).map((src) => loadStickerSize(src).then((r) => { stickerSizes[src] = r }))).then(() => {
      if (!cancelled) renderTiles()
    })

    return () => {
      cancelled = true
      window.removeEventListener('resize', onResize)
      vp.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      vp.removeEventListener('wheel', onWheel)
      videoObserver?.disconnect()
    }
  }, [playImages, stickers])

  function closeLightbox() {
    lightboxRef.current.classList.remove('open')
    const v = lightboxFrameRef.current.querySelector('video')
    if (v) v.pause()
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <Head>
        <title>Play — Shreya Krishnamurthy</title>
      </Head>
      <Navbar />
      <div className="canvas-viewport" ref={vpRef}>
        <div className="canvas-world" ref={worldRef}>
          <h1 className="play-heading">Play</h1>
          <p className="play-subtitle">bits and bobs and gleebs and globs of my free time</p>
          <p className="play-hint">scroll or drag to move!</p>
          <div ref={itemsLayerRef} />
        </div>
      </div>

      <div className="lightbox" ref={lightboxRef}>
        <div className="lightbox-inner">
          <div className="lightbox-frame" ref={lightboxFrameRef} />
          <div className="lightbox-text">
            <div className="lightbox-title">{lightboxTitle}</div>
            {lightboxDescription && <p className="lightbox-description">{lightboxDescription}</p>}
          </div>
        </div>
        <button className="btn btn--close lightbox-close" aria-label="Close" onClick={closeLightbox}>✕</button>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const playImages = getPlayImages()
  const stickers = getStickers()
  return { props: { playImages, stickers } }
}
