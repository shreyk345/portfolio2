import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { LetterTile, IconTile } from './Tile'

// Real-time nav theme detection: samples what's actually rendered behind
// the nav (hiding it for one frame, checking via elementFromPoint, walking
// up for the nearest real background color) and switches the instant that
// changes, rather than inferring it from scroll position — the same
// mechanism runs on every page for real consistency, even though only the
// home page's hero ever actually triggers the dark pairing.
function useAdaptiveNavTheme(navRef, navRightRef) {
  useEffect(() => {
    function bgIsDark(el) {
      let node = el
      while (node && node !== document.documentElement) {
        const bg = getComputedStyle(node).backgroundColor
        if (bg && bg.indexOf('rgb') === 0) {
          const inner = bg.substring(bg.indexOf('(') + 1, bg.lastIndexOf(')'))
          const parts = inner.split(',').map((s) => parseFloat(s))
          const a = parts.length > 3 ? parts[3] : 1
          if (a > 0.3) {
            const lum = 0.299 * parts[0] + 0.587 * parts[1] + 0.114 * parts[2]
            return lum < 128
          }
        }
        node = node.parentElement
      }
      return false
    }

    function updateNavTheme() {
      const nav = navRef.current
      const navRight = navRightRef.current
      if (!nav || !navRight) return
      const rect = nav.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      nav.style.visibility = 'hidden'
      navRight.style.visibility = 'hidden'
      const el = document.elementFromPoint(x, y)
      nav.style.visibility = ''
      navRight.style.visibility = ''
      const isDark = el ? bgIsDark(el) : false
      nav.classList.toggle('nav-theme-dark', isDark)
      navRight.classList.toggle('nav-theme-dark', isDark)
    }

    updateNavTheme()
    let t
    function debounced() {
      clearTimeout(t)
      t = setTimeout(updateNavTheme, 30)
    }
    window.addEventListener('scroll', debounced)
    const interval = setInterval(updateNavTheme, 400)
    return () => {
      window.removeEventListener('scroll', debounced)
      clearInterval(interval)
      clearTimeout(t)
    }
  }, [navRef, navRightRef])
}

export default function Navbar() {
  const router = useRouter()
  const navRef = useRef(null)
  const navRightRef = useRef(null)
  useAdaptiveNavTheme(navRef, navRightRef)

  const isHome = router.pathname === '/'

  function handleWorkClick(e) {
    if (isHome) {
      e.preventDefault()
      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <Link href="/" className="site-logo" aria-label="Home">
        <img src="/images/logo.png" alt="" />
      </Link>

      <nav className="site-nav" ref={navRef}>
        <Link href="/#work" onClick={handleWorkClick} className="nav-link" style={{ '--nav-accent': '#64CEBB' }}>
          <LetterTile letter="W" rotate={-6} />
          <LetterTile letter="O" rotate={5} />
          <LetterTile letter="R" rotate={-4} />
          <LetterTile letter="K" rotate={6} />
        </Link>
        <Link href="/play" className="nav-link" style={{ '--nav-accent': '#E6C7EB' }}>
          <LetterTile letter="P" rotate={6} />
          <LetterTile letter="L" rotate={-5} />
          <LetterTile letter="A" rotate={4} />
          <LetterTile letter="Y" rotate={-6} />
        </Link>
        <Link href="/about" className="nav-link" style={{ '--nav-accent': '#F5C645' }}>
          <LetterTile letter="A" rotate={-5} />
          <LetterTile letter="B" rotate={6} />
          <LetterTile letter="O" rotate={-4} />
          <LetterTile letter="U" rotate={5} />
          <LetterTile letter="T" rotate={-6} />
        </Link>
      </nav>

      <nav className="site-nav site-nav-right" ref={navRightRef}>
        <a href="https://github.com/shreyk345" className="nav-link" style={{ '--nav-accent': '#64CEBB' }} target="_blank" rel="noopener noreferrer">
          <IconTile src="/images/github.svg" alt="GitHub" rotate={-6} />
        </a>
        <a href="mailto:shkrishnamurthy@ucsd.edu" className="nav-link" style={{ '--nav-accent': '#E6C7EB' }}>
          <IconTile src="/images/gmail.svg" alt="Email" rotate={5} />
        </a>
        <a href="https://www.linkedin.com/in/shreya-krishnamurthy" className="nav-link" style={{ '--nav-accent': '#F5C645' }} target="_blank" rel="noopener noreferrer">
          <IconTile src="/images/linkedin.svg" alt="LinkedIn" rotate={-5} />
        </a>
        <a href="/resume.pdf" className="nav-link" style={{ '--nav-accent': '#FE602F' }} target="_blank" rel="noopener noreferrer">
          <IconTile src="/images/resume.svg" alt="Resume" rotate={6} />
        </a>
      </nav>

      <style jsx global>{`
        .site-logo {
          position: fixed;
          left: 24px;
          top: 24px;
          z-index: 70;
          display: flex;
          text-decoration: none;
        }
        .site-logo img {
          height: 30px;
          width: auto;
          display: block;
        }
        .site-nav {
          position: fixed;
          left: 18px;
          bottom: 34px;
          z-index: 70;
          display: flex;
          gap: 22px;
          background: transparent;
          --bg: #eff0e9;
          --text: #000000;
        }
        .site-nav.nav-theme-dark {
          --bg: #000000;
          --text: #eff0e9;
        }
        .site-nav-right {
          left: auto;
          right: 18px;
        }
        .nav-link {
          display: flex;
          text-decoration: none;
        }
        .nav-tile {
          position: relative;
          width: 26px;
          height: 26px;
          margin-right: 2px;
          color: var(--text);
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .nav-tile .tile-letter {
          font-size: 14px;
        }
        .nav-tile .tf-back,
        .nav-tile .tf-front,
        .nav-tile .tf-edge {
          stroke: var(--text);
          transition: stroke 0.15s ease;
        }
        .nav-tile .tf-front {
          fill: var(--bg);
        }
        .nav-link:hover .nav-tile {
          color: var(--nav-accent, #fe602f);
          transform: translateY(-2px);
        }
        .nav-link:hover .nav-tile .tf-back,
        .nav-link:hover .nav-tile .tf-front,
        .nav-link:hover .nav-tile .tf-edge {
          stroke: var(--nav-accent, #fe602f);
        }
        .nav-tile-icon {
          width: 34px;
          height: 34px;
        }
        .tile-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
          z-index: -1;
        }
        .tile-face .tf-back {
          fill: none;
          stroke: var(--text);
          stroke-width: 2;
          vector-effect: non-scaling-stroke;
        }
        .tile-face .tf-front {
          fill: var(--bg);
          stroke: var(--text);
          stroke-width: 2;
          vector-effect: non-scaling-stroke;
        }
        .tile-face .tf-edge {
          stroke: var(--text);
          stroke-width: 2;
          vector-effect: non-scaling-stroke;
        }
        .tile-letter {
          position: absolute;
          left: 38%;
          top: 38%;
          transform: translate(-50%, -50%);
          font-family: 'EB Garamond', serif;
          font-weight: 500;
        }
        .tile-icon {
          position: absolute;
          left: 38%;
          top: 38%;
          transform: translate(-50%, -50%);
          width: 44%;
          height: 44%;
          object-fit: contain;
        }
        .nav-tile-icon .tile-icon {
          width: 56%;
          height: 56%;
        }
      `}</style>
    </>
  )
}
