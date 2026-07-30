import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import PacManFooter from '../../components/PacManFooter'
import { LetterTile } from '../../components/Tile'
import { getAllSlugs, getCaseStudy } from '../../lib/case-studies'

// The tile's visual structure (back layer, fold-line accents, front layer,
// label) — shared by the button and the two link usages below so they
// can't drift out of sync the way they just did.
function TilePhraseInner({ label }) {
  return (
    <>
      <span className="tpb-back" />
      <span className="tpb-front" />
      <span className="tpb-label">{label}</span>
    </>
  )
}

// Word button: whole label on one real tile (rounded corners, offset
// back layer, fold-line accents — same visual identity as the nav tiles)
function TileWordButton({ label, onClick, disabled, className, accent, ...rest }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`tile-phrase-button ${className || ''}`}
      style={accent ? { '--tile-accent': accent } : undefined}
      {...rest}
    >
      <TilePhraseInner label={label} />
    </button>
  )
}

// Icon button: a single square tile, for ✕ close buttons etc.
function TileIconButton({ icon, alt, onClick, className, ...rest }) {
  return (
    <button onClick={onClick} className={`tile-icon-button ${className || ''}`} aria-label={alt} {...rest}>
      <LetterTile letter={icon} rotate={0} />
    </button>
  )
}

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
    <>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}.shake{animation:shake .5s ease}`}</style>
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'40px 24px' }}>
        <div style={{ maxWidth:420, width:'100%', textAlign:'center' }}>
          <h1 style={{ fontFamily:'"EB Garamond", serif', fontStyle:'normal', fontWeight:700, textTransform:'uppercase', letterSpacing:'.01em', fontSize:44, color:'var(--text)', marginBottom:8, lineHeight:1.1 }}>{title}</h1>
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:18, color:'var(--text)', opacity:0.65, marginBottom:36, lineHeight:1.6 }}>Enter password to view this content.</p>
          <div className={shake ? 'shake' : ''} style={{ display:'flex', gap:8 }}>
            <input type="password" value={value} onChange={(e) => { setValue(e.target.value); setError(false) }}
              onKeyDown={(e) => e.key==='Enter' && attempt()} placeholder="Password" autoFocus
              style={{ flex:1, padding:'12px 16px', borderRadius:10, border:`2px solid ${error ? '#FE602F' : 'rgba(128,128,128,0.3)'}`, background:'transparent', color:'var(--text)', fontFamily:'Inter, sans-serif', fontSize:16, outline:'none' }} />
            <TileWordButton label={loading ? '...' : 'Enter'} onClick={attempt} disabled={loading} />
          </div>
          {error && <p style={{ fontFamily:'Inter, sans-serif', fontSize:14, color:'#FE602F', marginTop:12 }}>Incorrect password. Try again.</p>}
        </div>
      </div>
    </>
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
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out' }}>
      <img src={src} alt={alt} style={{ maxWidth:'90vw', maxHeight:'90vh', objectFit:'contain', borderRadius:8 }} onClick={(e) => e.stopPropagation()} />
      <TileIconButton icon="✕" alt="Close" onClick={onClose} className="tile-icon-button-dark" style={{ position:'fixed', top:20, right:24 }} />
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
    <nav aria-label="Section navigation" style={{ position:'relative' }}>
      {topLevel.map((h, i) => {
        const isActive = activeId === h.id
        const isLast = i === topLevel.length - 1
        return (
          <div
            key={h.id}
            onClick={() => goTo(h.id)}
            style={{
              position: 'relative',
              paddingLeft: 24,
              paddingBottom: isLast ? 0 : 28,
              cursor: 'pointer',
            }}
          >
            {!isLast && (
              <div style={{
                position: 'absolute', left: 5, top: 14,
                width: 2, height: 'calc(100% - 2px)',
                background: 'rgba(128,128,128,0.22)',
              }} />
            )}
            <div style={{
              position: 'absolute', left: 0, top: 4,
              width: 12, height: 12,
              borderRadius: '50%',
              background: isActive ? accentColor : 'var(--bg)',
              border: `2px solid ${isActive ? accentColor : 'rgba(128,128,128,0.4)'}`,
              transition: 'background .25s ease, border-color .25s ease, transform .25s ease',
              transform: isActive ? 'scale(1.15)' : 'scale(1)',
            }} />
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              lineHeight: 1.4,
              fontWeight: isActive ? 700 : 400,
              color: isActive ? 'var(--text)' : 'rgba(128,128,128,0.75)',
              transition: 'color .25s ease, font-weight .25s ease',
            }}>
              {h.text}
            </div>
          </div>
        )
      })}
      {prototypeUrl && (
        <a
          href={prototypeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tile-phrase-button"
          style={{ '--tile-accent': accentColor, marginTop: 28, fontSize: 12, padding: '10px 20px' }}
        >
          <TilePhraseInner label="View Prototype ↗" />
        </a>
      )}
    </nav>
  )
}

// ── Main page ──────────────────────────────────────────────
export default function CaseStudyPage({ caseStudy }) {
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
        <PasswordGate title={caseStudy.title} onUnlock={() => setUnlocked(true)} />
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
      <style>{`
        @keyframes cs-slide-up {
          from { opacity:0; transform:translateY(32px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .cs-hero-img   { animation: cs-slide-up .6s ease both; }
        .cs-info-title { animation: cs-slide-up .6s ease .18s both; }
        .cs-info-desc  { animation: cs-slide-up .6s ease .26s both; }
        .cs-info-meta  { animation: cs-slide-up .6s ease .34s both; }
        @media (max-width: 620px) {
          .cs-content-grid { grid-template-columns: 1fr !important; }
          .cs-timeline-col { display: none !important; }
        }
      `}</style>

      <Navbar />

      {/* ── ONE big primary image ──────────────────────────── */}
      {caseStudy.thumbnail && (
        <div className="cs-hero-img" style={{ width:'100%', height:'70vh', minHeight:360, overflow:'hidden', background:'var(--bg)' }}>
          <img src={caseStudy.thumbnail} alt={caseStudy.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        </div>
      )}

      {/* ── Case study info: title, description, meta ── */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'36px 24px 24px' }}>
        <h1 className="cs-info-title" style={{ fontFamily:'"EB Garamond", serif', fontStyle:'normal', fontWeight:700, textTransform:'uppercase', letterSpacing:'.01em', fontSize:'clamp(26px, 3vw, 36px)', color:'var(--text)', lineHeight:1.15, marginBottom:20 }}>
          {caseStudy.title}
        </h1>
        <p className="cs-info-desc" style={{ fontFamily:'Inter, sans-serif', fontSize:17, color:'var(--text)', opacity:0.82, maxWidth:640, lineHeight:1.7, marginBottom:16 }}>
          {caseStudy.description}
        </p>
        <p className="cs-info-meta" style={{ fontFamily:'Inter, sans-serif', fontSize:13, color:'var(--text)', opacity:0.55, marginBottom:32, display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          {caseStudy.date && (
            <span>{new Date(caseStudy.date).toLocaleDateString('en-US', { year:'numeric', month:'long' })}</span>
          )}
          {caseStudy.duration && <><span style={{ fontSize:18, lineHeight:1 }}>·</span><span>{caseStudy.duration}</span></>}
          {caseStudy.role && <><span style={{ fontSize:18, lineHeight:1 }}>·</span><span>{caseStudy.role}</span></>}
        </p>
      </div>

      {/* ── Content: timeline sidebar + article ─────────────── */}
      <div className="cs-content-grid" style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'220px 1fr', gap:56, padding:'20px 24px 80px' }}>
        <div className="cs-timeline-col" style={{ position:'sticky', top:100, alignSelf:'start' }}>
          <TimelineNav headings={caseStudy.headings} accentColor={accentColor} prototypeUrl={caseStudy.prototypeUrl} />
        </div>

        <div style={{ minWidth:0, marginTop:-20 }}>
          <SlideIn delay={0.05}>
            <article
              className="case-study-body"
              style={{ fontFamily:'Inter, sans-serif', fontSize:17, lineHeight:1.9, color:'var(--text)' }}
              dangerouslySetInnerHTML={{ __html: caseStudy.contentHtml }}
            />
          </SlideIn>
          <div style={{ marginTop:48 }}>
            <Link href="/#work" className="tile-phrase-button" style={{ '--tile-accent': accentColor }}>
              <TilePhraseInner label="← Back to work" />
            </Link>
          </div>
        </div>
      </div>

      <PacManFooter />

      {/* Image zoom modal */}
      {zoomImg && <ImageZoom src={zoomImg.src} alt={zoomImg.alt} onClose={() => setZoomImg(null)} />}
    </>
  )
}

export async function getStaticProps({ params }) {
  const caseStudy = await getCaseStudy(params.slug)
  return { props: { caseStudy } }
}

export async function getStaticPaths() {
  const slugs = getAllSlugs()
  return { paths: slugs.map((slug) => ({ params: { slug } })), fallback: false }
}
