// components/ScrollGradient.jsx  (home page only)
// Slowly shifts the page background as you scroll:
//   cream (hero + work)  →  pink (about)  →  black (landing)
// It does this by updating the colour variables on <html>, which every
// element (text, dots, navbar…) already reads from.

import { useEffect } from 'react'

const CREAM = [239, 240, 233]
const PINK = [230, 199, 235]
const BLACK = [0, 0, 0]
const VARS = ['--bg', '--text', '--muted', '--hairline', '--hairline-strong', '--dot']

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const clamp01 = (n) => Math.max(0, Math.min(1, n))
const smooth = (t) => t * t * (3 - 2 * t)
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`

export default function ScrollGradient() {
  useEffect(() => {
    const root = document.documentElement
    let raf = 0

    function update() {
      raf = 0
      const about = document.getElementById('about')
      const landing = document.getElementById('landing')
      if (!about || !landing) return
      const top = (el) => el.getBoundingClientRect().top + window.scrollY
      const A = top(about), L = top(landing)
      const vh = window.innerHeight
      const sy = window.scrollY

      // cream → pink: begins as the About section starts to enter from the
      // bottom, and is fully pink by the time About fills the screen.
      const t1 = smooth(clamp01((sy + vh - A) / (vh * 0.95)))
      // pink → black: holds pure pink while About is centred, then darkens
      // slowly as you scroll out of it; fully black as the landing arrives.
      // (tied to the bottom of About, so it also works when About is taller than the screen)
      const s0 = Math.max(A, L - vh) + vh * 0.2
      const s1 = L - vh * 0.05
      const t2 = smooth(clamp01((sy - s0) / Math.max(1, s1 - s0)))
      const bg = t2 > 0 ? mix(PINK, BLACK, t2) : mix(CREAM, PINK, t1)

      const lum = (0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]) / 255
      const dark = lum < 0.42
      const dotBase = mix([0, 0, 0], CREAM, t2)

      root.style.setProperty('--bg', rgb(bg))
      root.style.setProperty('--text', dark ? '#EFF0E9' : '#000000')
      root.style.setProperty('--muted', dark ? 'rgba(239,240,233,0.6)' : 'rgba(0,0,0,0.52)')
      root.style.setProperty('--hairline', dark ? 'rgba(239,240,233,0.16)' : 'rgba(0,0,0,0.14)')
      root.style.setProperty('--hairline-strong', dark ? 'rgba(239,240,233,0.32)' : 'rgba(0,0,0,0.3)')
      // dots are very light on cream/pink (0.11) and reach 0.2 on the black footer
      root.style.setProperty('--dot', `rgba(${dotBase[0]},${dotBase[1]},${dotBase[2]},${(0.11 + 0.09 * t2).toFixed(3)})`)
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    const ro = new ResizeObserver(onScroll)
    ro.observe(document.body)
    document.fonts?.ready.then(onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
      VARS.forEach((v) => root.style.removeProperty(v))
    }
  }, [])

  return null
}
