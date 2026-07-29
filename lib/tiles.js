// lib/tiles.js
// Shared scrabble-tile system: the SVG "tile face" (front/back/folded
// corner), draggable-tile creation/placement, and the drag physics
// itself. Used by the Hero (SHREYA), Work (heading), Play (heading +
// scattered pieces), and About ("That's me") — one implementation so
// dragging feels identical everywhere.

export const TILE_FACE_SVG =
  '<svg class="tile-face" viewBox="0 0 100 100" preserveAspectRatio="none">' +
    '<rect class="tf-back" x="10" y="10" width="76" height="76" rx="14"/>' +
    '<line class="tf-edge" x1="71.9" y1="4.1" x2="81.9" y2="14.1"/>' +
    '<line class="tf-edge" x1="71.9" y1="71.9" x2="81.9" y2="81.9"/>' +
    '<line class="tf-edge" x1="4.1" y1="71.9" x2="14.1" y2="81.9"/>' +
    '<rect class="tf-front" x="0" y="0" width="76" height="76" rx="14"/>' +
  '</svg>'

export function tileTransform(angle, scale) {
  return `rotate(${angle}deg) scale(${scale})`
}

export function randomTileAngle() {
  const mag = 6 + Math.random() * 10
  return Math.random() < 0.5 ? -mag : mag
}

export function createTileEl(letter, angle, word) {
  const tile = document.createElement('div')
  tile.className = 'tile'
  tile.dataset.angle = angle
  if (word) tile.dataset.word = word
  tile.insertAdjacentHTML('afterbegin', TILE_FACE_SVG)
  const letterSpan = document.createElement('span')
  letterSpan.className = 'tile-letter'
  letterSpan.textContent = letter
  tile.appendChild(letterSpan)
  return tile
}

// Attaches pointer-drag physics to a tile element. `onDragStart` is an
// optional callback (e.g. to flag "this word has been manually moved, stop
// auto-repositioning it on resize") — kept generic here since different
// callers track that per-word, per-row, or not at all.
export function makeDraggable(el, onDragStart) {
  let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0
  const angle = parseFloat(el.dataset.angle) || 0

  function onPointerDown(e) {
    dragging = true
    if (onDragStart) onDragStart(el.dataset.word)
    el.setPointerCapture(e.pointerId)
    sx = e.clientX; sy = e.clientY
    ox = parseFloat(el.style.left); oy = parseFloat(el.style.top)
    el.classList.add('dragging')
    el.style.transform = tileTransform(angle, 1.08)
  }
  function onPointerMove(e) {
    if (!dragging) return
    el.style.left = (ox + (e.clientX - sx)) + 'px'
    el.style.top = (oy + (e.clientY - sy)) + 'px'
  }
  function release() {
    if (!dragging) return
    dragging = false
    el.classList.remove('dragging')
    el.style.transition = 'transform .1s cubic-bezier(.4,0,.6,1)'
    el.style.transform = tileTransform(angle, .94)
    setTimeout(() => {
      el.style.transition = 'transform .16s cubic-bezier(.2,.8,.2,1)'
      el.style.transform = tileTransform(angle, 1)
      setTimeout(() => { el.style.transition = '' }, 180)
    }, 100)
  }

  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerup', release)
  el.addEventListener('pointercancel', release)

  return function cleanup() {
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerup', release)
    el.removeEventListener('pointercancel', release)
  }
}

// Positions a freshly-created tile into #tileLayer and fades/scales it in.
// position:absolute is document-relative, not viewport-relative, so the
// current scroll offset has to be folded into x/y — this is also what
// makes tiles scroll with the page instead of staying pinned to the screen.
export function placeTile(tile, x, y, tileSize, delay, onDragStart) {
  const angle = parseFloat(tile.dataset.angle) || 0
  tile.style.width = tileSize + 'px'
  tile.style.height = tileSize + 'px'
  tile.style.fontSize = (tileSize * 0.52) + 'px'
  tile.style.left = (x + window.scrollX) + 'px'
  tile.style.top = (y + window.scrollY) + 'px'
  tile.style.opacity = '0'
  tile.style.transform = tileTransform(angle, .4)
  const layer = document.getElementById('tileLayer')
  if (!layer) return () => {}
  layer.appendChild(tile)
  const cleanupDrag = makeDraggable(tile, onDragStart)
  const t = setTimeout(() => {
    tile.style.opacity = '1'
    tile.style.transform = tileTransform(angle, 1)
  }, delay)
  return function cleanup() {
    clearTimeout(t)
    cleanupDrag()
    tile.remove()
  }
}
