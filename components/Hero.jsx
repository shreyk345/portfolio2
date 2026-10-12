// components/Hero.jsx
// Mountain painting bottom-left (sitting on the fold), interactive fog behind
// it, hero text at the right-middle.
//
// To use your painting: save it as  public/images/hero/mountain.png
// (mountain.webp or mountain.jpg also work). Until then a placeholder shows.

import { useEffect, useState } from 'react'
import Clouds from './Clouds'
import NowRotator from './NowRotator'

const MOUNTAIN_CANDIDATES = [
  '/images/hero/mountain.png',
  '/images/hero/mountain.webp',
  '/images/hero/mountain.jpg',
  '/images/hero/mountain-placeholder.svg',
]

export default function Hero() {
  const [src, setSrc] = useState(null)

  // Use the first of the candidate files that actually exists.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      for (const c of MOUNTAIN_CANDIDATES) {
        const ok = await new Promise((res) => {
          const im = new Image()
          im.onload = () => res(true)
          im.onerror = () => res(false)
          im.src = c
        })
        if (ok) { if (!cancelled) setSrc(c); return }
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="hero" id="top">
      <Clouds />
      {src && (
        <div className="hero-mountain-wrap">
          <img className="hero-mountain" src={src} alt="Painting of a mountain" />
          <Clouds front />
        </div>
      )}
      <div className="hero-text">
        <h1 className="hero-title">
          <span className="hero-hi">Hi, I&apos;m</span>{' '}
          <span className="hero-name-group">
            <span className="hero-name" lang="kn">ಶ್ರೇಯಾ</span>
            <span className="hero-aka">(Shreya)</span>
          </span>
        </h1>
        <div className="hero-tags">
          <img className="hero-tag hero-tag--artist" src="/images/hero/tag-artist.png" alt="artist" />
          <img className="hero-tag hero-tag--designer" src="/images/hero/tag-designer.png" alt="designer" />
          <img className="hero-tag hero-tag--journaler" src="/images/hero/tag-junk-journaler.png" alt="junk journaler" />
        </div>
        <NowRotator />
      </div>
    </section>
  )
}
