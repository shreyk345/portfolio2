// components/Landing.jsx — the bottom section of the home page.
// Text bottom-left (+ the github / linkedin / email / resume icons),
// your animation bottom-right.
//
// To use your animation: save it as  public/images/landing/animation.<ext>
// (mp4, webm, gif, webp, png or svg). Until then a placeholder animation shows.

import { useEffect, useState } from 'react'
import Fireflies from './Fireflies'

const CANDIDATES = ['animation.webm', 'animation.mp4', 'animation.gif', 'animation.webp', 'animation.png', 'animation.svg']

function LandingAnimation() {
  const [found, setFound] = useState(null) // {src, kind} | 'none'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      for (const f of CANDIDATES) {
        try {
          const res = await fetch(`/images/landing/${f}`, { method: 'HEAD' })
          const type = res.headers.get('content-type') || ''
          if (res.ok && !type.includes('text/html')) {
            if (!cancelled) setFound({ src: `/images/landing/${f}`, kind: /\.(mp4|webm)$/.test(f) ? 'video' : 'img' })
            return
          }
        } catch {}
      }
      if (!cancelled) setFound('none')
    })()
    return () => { cancelled = true }
  }, [])

  if (found && found !== 'none') {
    return found.kind === 'video'
      ? <video src={found.src} autoPlay loop muted playsInline />
      : <img src={found.src} alt="" />
  }
  if (found === 'none') {
    // PLACEHOLDER animation
    return (
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle className="ph-a ph-a1" cx="60" cy="140" r="20" fill="#FE602F" />
        <circle className="ph-a ph-a2" cx="100" cy="140" r="20" fill="#64CEBB" />
        <circle className="ph-a ph-a3" cx="140" cy="140" r="20" fill="#F5C645" />
        <path className="ph-spin" d="M100 20 C103 40 112 49 132 52 C112 55 103 64 100 84 C97 64 88 55 68 52 C88 49 97 40 100 20 Z" fill="#E6C7EB" />
      </svg>
    )
  }
  return null
}

export default function Landing() {
  return (
    <section className="landing" id="landing">
      <Fireflies />
      <div className="landing-text">
        <h2 className="landing-title">
          LET’S CLIMB<br />
          <span className="landing-title-accent">higher</span>
        </h2>
        <p className="landing-sub">
          Thanks for stopping by! I’d love to chat.
        </p>
        <div className="landing-links">
          <a className="btn btn--social" href="https://github.com/shreyk345" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <img src="/images/github.svg" alt="" />
          </a>
          <a className="btn btn--social" href="https://www.linkedin.com/in/shreya-krishnamurthy" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <img src="/images/linkedin.svg" alt="" />
          </a>
          <a className="btn btn--social" href="mailto:shkrishnamurthy@ucsd.edu" aria-label="Email">
            <img src="/images/gmail.svg" alt="" />
          </a>
          <a className="btn btn--social" href="/resume.pdf" target="_blank" rel="noopener noreferrer" aria-label="Resume">
            <img src="/images/resume.svg" alt="" />
          </a>
        </div>
      </div>
      <div className="landing-anim">
        <LandingAnimation />
      </div>
      <div className="landing-rule" aria-hidden="true" />
      <p className="landing-copyright" data-nowrite>© 2026 Shreya Krishnamurthy · Designed and made by Me :)</p>
    </section>
  )
}
