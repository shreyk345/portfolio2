// components/Reveal.jsx — site-wide entrance animations (one place controls everything)
//
//   • WRITTEN text (letters appear one after another, left to right, like a pen) is used ONLY for:
//       – everything in the hero and the landing section (these ALSO fade in), and
//       – the titles of pages / sections (h1, h2, "Welcome to my Junkyard!", the Play title, the password-page title)
//     all other text just sits there normally.
//   • everything that is NOT text (images, video, canvases, cards…) fades in.
//
// Each piece starts the first time it scrolls into view. Nothing is edited by hand per page:
// this scans the page (and anything added later, e.g. when you move to another page).
//
// To skip an element: give it  data-nowrite  (no writing) or  data-nofade  (no fade).
// To fade a specific element: give it  data-fade  (optionally  data-rv-delay="800" in ms).

import { useLayoutEffect } from 'react'

// every element that can carry text (decides which element owns which piece of text)
const TEXT_SEL = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'blockquote', 'figcaption', 'th', 'td', 'label',
  '.play-heading', '.gate-title',
].join(',')

// the ones that are actually WRITTEN: page / section titles …
const TITLE_SEL = 'h1, h2, .about-greeting, .play-heading, .gate-title'
// … plus all the text inside these two sections (which also fades in)
const WRITE_SCOPE = '.hero, .landing'

const FADE_SEL = ['img', 'video', 'canvas', '[data-fade]', '.gate-box'].join(',')

// never touched: stickers (they have their own motion), the lightbox / zoom overlays (opened on demand), inputs
const SKIP = '.sticker-layer, .sticker, .lightbox, .zoom-overlay, textarea, input, select, [data-nowrite]'
const SKIP_FADE = '.sticker-layer, .sticker, .lightbox, .zoom-overlay, [data-nofade]'

const MS_PER_CHAR = 34
const MIN_MS = 350
const MAX_MS = 2000
const STAGGER_MS = 110
const MAX_STAGGER_MS = 1400

// letters are revealed one by one; a word in a non-Latin script (e.g. Kannada) stays whole so its letters keep joining correctly
function splitUnits(str) {
  const out = []
  for (const part of str.split(/(\s+)/)) {
    if (!part) continue
    if (/^\s+$/.test(part)) { out.push(part); continue }
    if (/[^\u0000-ɏ -⁯]/.test(part)) { out.push(part); continue }
    for (const ch of Array.from(part)) out.push(ch)
  }
  return out
}

function ownTextNodes(el) {
  const nodes = []
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.data.trim()) return NodeFilter.FILTER_REJECT
      const p = n.parentElement
      if (!p || p.closest('[data-nowrite]')) return NodeFilter.FILTER_REJECT
      // text that belongs to a nested writable element is written by that element
      const owner = p.closest(TEXT_SEL)
      return owner === el || (owner && !el.contains(owner)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    },
  })
  while (walker.nextNode()) nodes.push(walker.currentNode)
  return nodes
}

function write(el, delay) {
  const nodes = ownTextNodes(el).filter((n) => n.parentElement.closest(TEXT_SEL) === el)
  const total = nodes.reduce((s, n) => s + n.data.replace(/\s/g, '').length, 0)
  if (!total) { el.classList.remove('rv-t'); return }
  const dur = Math.min(MAX_MS, Math.max(MIN_MS, total * MS_PER_CHAR))
  const restore = []
  let done = 0
  for (const node of nodes) {
    // one wrapper per text node, so flex/grid containers (e.g. nav buttons) still see a single item
    const wrap = document.createElement('span')
    wrap.className = 'ww'
    const made = [wrap]
    for (const u of splitUnits(node.data)) {
      if (/^\s+$/.test(u)) { wrap.appendChild(document.createTextNode(u)); continue }
      const s = document.createElement('span')
      s.className = 'wc'
      s.textContent = u
      s.style.animationDelay = `${Math.round(delay + (done / total) * dur)}ms`
      done += u.replace(/\s/g, '').length
      wrap.appendChild(s)
    }
    node.replaceWith(wrap)
    restore.push([node, made])
  }
  el.classList.remove('rv-t')
  // when finished, put the original text back (clean DOM, exact original layout)
  setTimeout(() => {
    for (const [orig, made] of restore) {
      const first = made[0]
      if (first && first.parentNode) {
        first.parentNode.insertBefore(orig, first)
        made.forEach((m) => m.parentNode && m.parentNode.removeChild(m))
      }
    }
  }, delay + dur + 450)
}

function fade(el, delay) {
  el.style.setProperty('--rv-delay', `${delay}ms`)
  el.classList.add('rv-f-go')
  const clean = () => { el.classList.remove('rv-f', 'rv-f-go'); el.style.removeProperty('--rv-delay') }
  setTimeout(clean, delay + 1000)
}

export default function Reveal() {
  useLayoutEffect(() => {
    const root = document.documentElement
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) { root.classList.add('rv-ready'); return }

    const seen = new WeakSet()
    const kind = new WeakMap()

    function run(els) {
      els.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      els.forEach((el, i) => {
        if (!el.isConnected) return
        const extra = parseInt(el.getAttribute('data-rv-delay') || '0', 10) || 0
        const delay = Math.min(MAX_STAGGER_MS, i * STAGGER_MS) + extra
        const k = kind.get(el)
        if (k === 't' || k === 'tf') write(el, delay)   // 'tf' = written AND fades in (hero + landing)
        if (k === 'f' || k === 'tf') fade(el, delay)
      })
    }

    const io = new IntersectionObserver((entries) => {
      const hits = entries.filter((e) => e.isIntersecting).map((e) => e.target)
      hits.forEach((el) => io.unobserve(el))
      run(hits)
    }, { threshold: 0.05, rootMargin: '0px' })

    // the landing section plays all at once, and only once a good part of it is actually on screen
    // (otherwise its pieces would finish fading in while still below the fold, before anyone sees it)
    const groups = new Map()   // section element -> pieces still waiting (null once it has played)
    const gio = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const pending = groups.get(e.target)
        if (!pending) continue
        const need = Math.min(e.boundingClientRect.height * 0.45, window.innerHeight * 0.55)
        if (e.intersectionRect.height < need - 1) continue
        groups.set(e.target, null)
        gio.unobserve(e.target)
        run(pending)
      }
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] })

    function register(el, k) {
      if (seen.has(el)) return
      seen.add(el)
      kind.set(el, k)
      if (k !== 'f') el.classList.add('rv-t')
      if (k !== 't') el.classList.add('rv-f')
      const section = el.closest('.landing')
      if (section) {
        const pending = groups.get(section)
        if (pending === null) { io.observe(el); return }   // section already played (a piece added later)
        if (pending) pending.push(el)
        else { groups.set(section, [el]); gio.observe(section) }
        return
      }
      io.observe(el)
    }

    function scan(node) {
      if (node.nodeType !== 1) return
      if (node.classList && (node.classList.contains("wc") || node.classList.contains("ww"))) return
      const all = [node, ...node.querySelectorAll(`${TEXT_SEL},${FADE_SEL}`)]
      for (const el of all) {
        if (!el.matches) continue
        const inScope = !!el.closest(WRITE_SCOPE)
        if (el.matches(TEXT_SEL) && (inScope || el.matches(TITLE_SEL)) && !el.closest(SKIP) && ownTextNodes(el).some((n) => n.parentElement.closest(TEXT_SEL) === el)) register(el, inScope ? 'tf' : 't')
        else if (el.matches(FADE_SEL) && !el.closest(SKIP_FADE)) register(el, 'f')
      }
    }

    const host = document.getElementById('__next') || document.body
    scan(host)
    root.classList.add('rv-ready')

    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => scan(n))
    })
    mo.observe(host, { childList: true, subtree: true })
    return () => { mo.disconnect(); io.disconnect(); gio.disconnect() }
  }, [])

  return null
}
