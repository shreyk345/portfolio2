import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { createTileEl, placeTile, randomTileAngle } from '../lib/tiles'

const BRAND_PALETTE = ['#64CEBB', '#E6C7EB', '#F5C645', '#FE602F']

// Same non-curved row-of-tiles heading used by Play's "PLAY" heading —
// left-aligned to the anchor's own left edge rather than centered.
function useRowTiles(word, anchorRef, keyName) {
  const movedRef = useRef(false)
  const cleanupsRef = useRef([])

  useEffect(() => {
    function build() {
      if (movedRef.current) return
      const anchor = anchorRef.current
      if (!anchor) return
      cleanupsRef.current.forEach((fn) => fn())
      cleanupsRef.current = []

      const rect = anchor.getBoundingClientRect()
      const tileSize = Math.max(40, Math.min(64, rect.height))
      const gap = tileSize * 0.16
      const startX = rect.left
      const y = rect.top + rect.height / 2 - tileSize / 2

      for (let i = 0; i < word.length; i++) {
        const tile = createTileEl(word[i], randomTileAngle(), keyName)
        const cleanup = placeTile(tile, startX + i * (tileSize + gap), y, tileSize, 60 * i, () => {
          movedRef.current = true
        })
        cleanupsRef.current.push(cleanup)
      }
    }

    build()
    const debounced = debounce(build, 150)
    window.addEventListener('resize', debounced)
    document.fonts?.ready.then(build)
    return () => {
      window.removeEventListener('resize', debounced)
      cleanupsRef.current.forEach((fn) => fn())
    }
  }, [word, anchorRef, keyName])
}

function debounce(fn, wait) {
  let t
  return function () {
    clearTimeout(t)
    t = setTimeout(fn, wait)
  }
}

function WorkRow({ caseStudy, index }) {
  const rowRef = useRef(null)

  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    if (!('IntersectionObserver' in window)) {
      row.classList.add('in-view')
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    obs.observe(row)
    return () => obs.disconnect()
  }, [])

  const accent = BRAND_PALETTE[index % BRAND_PALETTE.length]
  const year = caseStudy.date ? new Date(caseStudy.date).getFullYear() : ''
  const meta = year ? String(year) : ''

  return (
    <Link
      href={`/case-studies/${caseStudy.slug}`}
      ref={rowRef}
      className="work-row"
      style={{ '--row-accent': accent }}
    >
      <div className="work-thumb">
        <div
          className="work-thumb-inner"
          style={
            caseStudy.thumbnail
              ? { backgroundImage: `url(${caseStudy.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : {}
          }
        />
      </div>
      <div>
        {meta && <div className="work-meta">{meta}</div>}
        <h3 className="work-title">{caseStudy.title}</h3>
        <p className="work-desc">{caseStudy.description}</p>
      </div>
    </Link>
  )
}

export default function WorkSection({ caseStudies }) {
  const headingAnchorRef = useRef(null)
  useRowTiles('WORK', headingAnchorRef, 'work-heading')

  return (
    <section className="work-section" id="work">
      <div className="work-heading-row" ref={headingAnchorRef} />
      <div className="work-list">
        {caseStudies.map((cs, i) => (
          <WorkRow key={cs.slug} caseStudy={cs} index={i} />
        ))}
      </div>
    </section>
  )
}
