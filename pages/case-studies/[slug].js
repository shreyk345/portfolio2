import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import StickerLayer from '../../components/StickerLayer'
import { getAllSlugs, getCaseStudy } from '../../lib/case-studies'
import { getStickers } from '../../lib/stickers-server'

const ACCENT = ['#FE602F', '#64CEBB', '#E6C7EB', '#F5C645']

// ── Password Gate ──────────────────────────────────────────
function PasswordGate({ title, onUnlock }) {
  const [value, setValue]   = useState('')
  const [error, setError]   = useState(false)
  const [shake, setShake]   = useState(false)
  const [loading, setLoading] = useState(false)

  async function attempt() {
    if (!value) return
    setLoading(true)
    try {
      const res = await fetch('/api/unlock', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password: value }),
      })
      if (res.ok) {
        onUnlock()
      } else {
        setError(true); setShake(true); setValue('')
        setTimeout(() => setShake(false), 500)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gate-wrap">
      <div className="gate-box" data-sticker-avoid>
        <h1 className="gate-title">{title}</h1>
        <p className="gate-sub">Enter password to view this content.</p>
        <div className={`gate-row ${shake ? 'shake' : ''}`}>
          <input
            type="password"
            className={`gate-input ${error ? 'error' : ''}`}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false) }}
            onKeyDown={(e) => e.key === 'Enter' && attempt()}
            placeholder="Password"
            autoFocus
          />
          <button className="btn btn--enter" onClick={attempt} disabled={loading}>{loading ? '...' : 'Enter'}</button>
        </div>
        {error && <p className="gate-error">Incorrect password. Try again.</p>}
      </div>
    </div>
  )
}

// ── Zoom modal for images ──────────────────────────────────
function ImageZoom({ src, alt, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler) }
  }, [])
  return (
    <div className="zoom-overlay" onClick={onClose}>
      <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
      <button className="btn btn--close zoom-close" aria-label="Close" onClick={onClose}>✕</button>
    </div>
  )
}

// ── Animated section wrapper ───────────────────────────────
function SlideIn({ children, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s cubic-bezier(0.34,1.26,0.64,1) ${delay}s`,
    }}>
      {children}
    </div>
  )
}

// ── Timeline nav — circles connected by a line, one per heading.
// Clicking scrolls to that section; the current section (based on
// scroll position) is highlighted as you go.
function TimelineNav({ headings, accentColor, prototypeUrl }) {
  const topLevel = headings.filter((h) => h.level === 1 || h.level === 2)
  const [activeId, setActiveId] = useState(topLevel[0]?.id)

  useEffect(() => {
    if (!topLevel.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    )
    topLevel.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [topLevel])

  function goTo(id) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!topLevel.length && !prototypeUrl) return null

  return (
    <nav aria-label="Section navigation" style={{ position: 'relative', '--tl-accent': accentColor }}>
      {topLevel.map((h, i) => {
        const isLast = i === topLevel.length - 1
        return (
          <div
            key={h.id}
            onClick={() => goTo(h.id)}
            className={`tl-item ${activeId === h.id ? 'active' : ''} ${isLast ? 'last' : ''}`}
          >
            {!isLast && <div className="tl-line" />}
            <div className="tl-dot" />
            <div className="tl-label">{h.text}</div>
          </div>
        )
      })}
      {prototypeUrl && (
        <a
          href={prototypeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--prototype tl-proto"
          style={{ '--btn-accent': accentColor }}
        >
          View Prototype ↗
        </a>
      )}
    </nav>
  )
}

// ── Main page ──────────────────────────────────────────────
export default function CaseStudyPage({ caseStudy, stickers }) {
  const [unlocked, setUnlocked] = useState(false)
  const [zoomImg, setZoomImg]   = useState(null)

  // Make images in article zoomable
  useEffect(() => {
    const imgs = document.querySelectorAll('.case-study-body img')
    imgs.forEach((img) => {
      img.style.cursor = 'zoom-in'
      img.onclick = () => setZoomImg({ src: img.src, alt: img.alt })
    })
  })

  if (caseStudy.protected && !unlocked) {
    return (
      <>
        <Head><title>{`${caseStudy.title} — Shreya Krishnamurthy`}</title></Head>
        <Navbar />
        <div className="cs-page">
          <PasswordGate title={caseStudy.title} onUnlock={() => setUnlocked(true)} />
          <StickerLayer stickers={stickers} mode="scatter" />
        </div>
      </>
    )
  }

  const accentColor = ACCENT[caseStudy.slug.charCodeAt(0) % ACCENT.length]

  return (
    <>
      <Head>
        <title>{`${caseStudy.title} — Shreya Krishnamurthy`}</title>
        <meta name="description" content={caseStudy.description} />
      </Head>

      <Navbar />

      <div className={`cs-page ${caseStudy.thumbnail ? '' : 'no-hero'}`}>
        {/* ── ONE big primary image ──────────────────────────── */}
        {caseStudy.thumbnail && (
          <div className="cs-hero-img" data-sticker-avoid>
            <img src={caseStudy.thumbnail} alt={caseStudy.title} />
          </div>
        )}

        {/* ── Case study info: title, description, meta ── */}
        <div className="cs-info">
          <h1 className="cs-info-title" data-sticker-avoid>{caseStudy.title}</h1>
          <p className="cs-info-desc" data-sticker-avoid>{caseStudy.description}</p>
          <p className="cs-info-meta" data-sticker-avoid>
            {caseStudy.date && (
              <span>{new Date(caseStudy.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
            )}
            {caseStudy.duration && <><span className="dot">·</span><span>{caseStudy.duration}</span></>}
            {caseStudy.role && <><span className="dot">·</span><span>{caseStudy.role}</span></>}
          </p>
        </div>

        {/* ── Content: timeline sidebar + article ─────────────── */}
        <div className="cs-content-grid">
          <div className="cs-timeline-cell" data-sticker-avoid>
            <div className="cs-timeline-col">
              <TimelineNav headings={caseStudy.headings} accentColor={accentColor} prototypeUrl={caseStudy.prototypeUrl} />
            </div>
          </div>

          <div className="cs-article-col">
            <SlideIn delay={0.05}>
              <article
                className="case-study-body"
                data-sticker-avoid
                dangerouslySetInnerHTML={{ __html: caseStudy.contentHtml }}
              />
            </SlideIn>
            <div className="cs-back" data-sticker-avoid style={{ display: 'inline-block' }}>
              <Link href="/#work" className="btn btn--back" style={{ '--btn-accent': accentColor }}>← Back to work</Link>
            </div>
          </div>
        </div>

        <StickerLayer stickers={stickers} mode="scatter" />
      </div>

      {/* Image zoom modal */}
      {zoomImg && <ImageZoom src={zoomImg.src} alt={zoomImg.alt} onClose={() => setZoomImg(null)} />}
    </>
  )
}

export async function getStaticProps({ params }) {
  const caseStudy = await getCaseStudy(params.slug)
  const stickers = getStickers()
  return { props: { caseStudy, stickers } }
}

export async function getStaticPaths() {
  const slugs = getAllSlugs()
  return { paths: slugs.map((slug) => ({ params: { slug } })), fallback: false }
}
