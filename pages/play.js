import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import { LetterTile } from '../components/Tile'
import { createTileEl, makeDraggable, tileTransform, randomTileAngle } from '../lib/tiles'
import { getPlayImages } from '../lib/play-images'

// Icon button: a single square tile, for the ✕ close button.
function TileIconButton({ icon, alt, onClick, className, ...rest }) {
  return (
    <button onClick={onClick} className={`tile-icon-button ${className || ''}`} aria-label={alt} {...rest}>
      <LetterTile letter={icon} rotate={0} />
    </button>
  )
}

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

export default function Play({ playImages }) {
  const vpRef = useRef(null)
  const worldRef = useRef(null)
  const itemsLayerRef = useRef(null)
  const tileLayerRef = useRef(null)
  const headingAnchorRef = useRef(null)
  const lightboxRef = useRef(null)
  const lightboxFrameRef = useRef(null)
  const [lightboxTitle, setLightboxTitle] = useState('')
  const [lightboxDescription, setLightboxDescription] = useState('')

  useEffect(() => {
    const vp = vpRef.current
    const world = worldRef.current
    let panX = -400 + 72, panY = -300 + 64 // lands the heading at the viewport's top-left on load

    function applyPan() {
      world.style.transform = `translate(${panX}px,${panY}px)`
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
    }

    let lastCenterTX = null, lastCenterTY = null
    function renderTiles() {
      const centerTX = Math.round(-panX / TILE_X)
      const centerTY = Math.round(-panY / TILE_Y)
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
      const centerTX = Math.round(-panX / TILE_X)
      const centerTY = Math.round(-panY / TILE_Y)
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

    // PLAY heading tiles — placed directly in world-space (not viewport
    // space), so they pan along with everything else, into a tile-layer
    // that lives inside canvas-world rather than the page-level one.
    const anchor = headingAnchorRef.current
    const layer = tileLayerRef.current
    const word = 'PLAY'
    const tileSize = 56, gap = 8
    const anchorStyle = getComputedStyle(anchor)
    const ax = parseFloat(anchorStyle.left) || 520
    const ay = parseFloat(anchorStyle.top) || 460
    const headingCleanups = []
    for (let i = 0; i < word.length; i++) {
      const angle = randomTileAngle()
      const tile = createTileEl(word[i], angle, 'play-heading')
      const x = ax + i * (tileSize + gap)
      const y = ay
      tile.style.width = tileSize + 'px'
      tile.style.height = tileSize + 'px'
      tile.style.fontSize = (tileSize * 0.52) + 'px'
      tile.style.left = x + 'px'
      tile.style.top = y + 'px'
      tile.style.opacity = '0'
      tile.style.transform = tileTransform(angle, .4)
      layer.appendChild(tile)
      const cleanupDrag = makeDraggable(tile)
      const delay = 200 + i * 70
      const t = setTimeout(() => {
        tile.style.opacity = '1'
        tile.style.transform = tileTransform(angle, 1)
      }, delay)
      headingCleanups.push(() => { clearTimeout(t); cleanupDrag(); tile.remove() })
    }

    applyPan()
    renderTiles()

    return () => {
      vp.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      vp.removeEventListener('wheel', onWheel)
      headingCleanups.forEach((fn) => fn())
      videoObserver?.disconnect()
    }
  }, [playImages])

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
          <div className="play-heading-anchor" ref={headingAnchorRef} />
          <p className="play-subtitle">bits and bobs and gleebs and globs of my free time</p>
          <p className="play-hint">scroll or drag to move!</p>
          <div ref={itemsLayerRef} />
          <div className="tile-layer" ref={tileLayerRef} />
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
        <TileIconButton icon="✕" alt="Close" onClick={closeLightbox} className="lightbox-close tile-icon-button-dark" />
      </div>
    </>
  )
}

export async function getStaticProps() {
  const playImages = getPlayImages()
  return { props: { playImages } }
}
