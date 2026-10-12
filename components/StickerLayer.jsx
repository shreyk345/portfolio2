// components/StickerLayer.jsx
// Scatters draggable stickers in the EMPTY MARGINS of its parent region.
// The parent must be position:relative. Anything inside the parent marked
// with data-sticker-avoid is kept clear.
//
//   mode="scatter"  a handful, density scales with the region's height
//   mode="collage"  EVERY sticker, shrunk as needed so all of them fit

import { useEffect, useRef } from 'react'
import { loadStickerSize, shuffle, createStickerEl, makeStickerDraggable, placeInMargins } from '../lib/stickers'

const PAD = 24 // clear space kept around content

export default function StickerLayer({ stickers, mode = 'scatter' }) {
  const layerRef = useRef(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer || !stickers || !stickers.length) return
    const parent = layer.parentElement
    let cancelled = false
    let touched = false
    let lastW = 0, lastH = 0
    let cleanups = []
    let timer = null

    async function build() {
      const sizes = await Promise.all(stickers.map((s) => loadStickerSize(s).then((r) => ({ src: s, ...r }))))
      if (cancelled) return
      const pr = parent.getBoundingClientRect()
      const W = pr.width, H = pr.height
      if (W < 50 || H < 50) return
      lastW = W; lastH = H
      const narrow = W < 700
      const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      const baseFull = Math.max(52, Math.min(120, W * 0.065)) * (rootPx / 16) * (narrow ? 0.85 : 1)

      const avoid = Array.from(parent.querySelectorAll('[data-sticker-avoid]'))
        .filter((el) => !layer.contains(el))
        .map((el) => {
          const r = el.getBoundingClientRect()
          return { x0: r.left - pr.left - PAD, y0: r.top - pr.top - PAD, x1: r.right - pr.left + PAD, y1: r.bottom - pr.top + PAD }
        })

      let result = []
      if (mode === 'collage') {
        // all stickers; shrink until every one fits
        const items = shuffle(sizes)
        for (const k of [1, 0.88, 0.76, 0.66, 0.56, 0.48]) {
          const r = placeInMargins({ W, H, avoid, items, gap: -baseFull * k * 0.1, baseSize: baseFull * 1.1 * k, narrow })
          if (r.length > result.length) result = r
          if (r.length >= items.filter((i) => !i.broken).length) break
        }
      } else {
        const per1000 = narrow ? 2.4 : 3.8
        const n = Math.max(1, Math.round((H / 1000) * per1000))
        const pool = shuffle(sizes)
        const items = []
        for (let i = 0; i < n; i++) items.push(pool[i % pool.length])
        result = placeInMargins({ W, H, avoid, items, gap: 18, baseSize: baseFull, narrow })
      }

      cleanups.forEach((fn) => fn())
      cleanups = []
      layer.innerHTML = ''
      result.forEach((p) => {
        const el = createStickerEl(p)
        layer.appendChild(el)
        cleanups.push(makeStickerDraggable(el, () => 1, () => { touched = true }))
        requestAnimationFrame(() => el.classList.add('placed'))
      })
    }

    function schedule(force) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (cancelled) return
        const r = parent.getBoundingClientRect()
        const widthChanged = Math.abs(r.width - lastW) > 8
        const heightChanged = Math.abs(r.height - lastH) > Math.max(40, lastH * 0.04)
        if (force || widthChanged || (heightChanged && !touched)) build()
      }, 250)
    }

    schedule(true)
    document.fonts?.ready.then(() => schedule(false))
    const ro = new ResizeObserver(() => schedule(false))
    ro.observe(parent)
    return () => {
      cancelled = true
      clearTimeout(timer)
      ro.disconnect()
      cleanups.forEach((fn) => fn())
    }
  }, [stickers, mode])

  return <div className="sticker-layer" ref={layerRef} aria-hidden="true" />
}
