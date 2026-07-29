import { useEffect, useRef } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import PacManFooter from '../components/PacManFooter'
import { placeTile, createTileEl, randomTileAngle } from '../lib/tiles'

export default function About() {
  const photoCircleRef = useRef(null)

  useEffect(() => {
    let cleanups = []

    function buildAboutMeTiles() {
      cleanups.forEach((fn) => fn())
      cleanups = []

      const circle = photoCircleRef.current
      if (!circle) return
      const rect = circle.getBoundingClientRect()
      const cx = rect.left + rect.width / 2 + window.scrollX
      const cy = rect.top + rect.height / 2 + window.scrollY
      const tileSize = Math.max(28, Math.min(48, rect.width * 0.09))
      const radius = rect.width / 2 + tileSize * 0.55 + 14 // clears the circle's edge with a real gap

      const word = 'THATSME' // "That's me" — tiles don't carry punctuation/spaces
      const gapAfter = 4 // index after which we leave a bigger angular gap (word break)

      const startDeg = -32, endDeg = 96 // arc across the top-right quadrant, 0° = 12 o'clock, clockwise
      const totalSteps = word.length - 1 + 0.6 // extra fractional step reserved for the word-break gap
      const stepDeg = (endDeg - startDeg) / totalSteps

      let angleCursor = startDeg
      for (let i = 0; i < word.length; i++) {
        const letter = word[i]
        const deg = angleCursor
        angleCursor += stepDeg * (i === gapAfter ? 1.6 : 1)
        const rad = (deg * Math.PI) / 180
        const x = cx + radius * Math.sin(rad)
        const y = cy - radius * Math.cos(rad)

        const tile = createTileEl(letter, randomTileAngle(), 'thats-me')
        const cleanup = placeTile(tile, x - tileSize / 2, y - tileSize / 2, tileSize, 300 + i * 60)
        cleanups.push(cleanup)
      }
    }

    buildAboutMeTiles()
    const debounced = debounce(buildAboutMeTiles, 150)
    window.addEventListener('resize', debounced)
    document.fonts?.ready.then(buildAboutMeTiles)
    return () => {
      window.removeEventListener('resize', debounced)
      cleanups.forEach((fn) => fn())
    }
  }, [])

  return (
    <>
      <Head>
        <title>About — Shreya Krishnamurthy</title>
      </Head>
      <Navbar />
      <main className="about-wrap">
        <div className="about-text">
          <p className="about-greeting">
            Welcome to my <span className="accent-word">Junkyard</span>!
          </p>
          <p className="about-body">
            I&apos;m currently a design intern at U.S. Bank, and a senior at UC San Diego. I double major in
            Cognitive Science (specializing in Design and Interaction) and Interdisciplinary Computing and the
            Arts. If that&apos;s too much of a mouthful, just think of me as a creative with a huge passion for
            storytelling.
          </p>
          <p className="about-body">
            In my free time, I love hiking, running, cycling, swimming, the Legend of Zelda, history, books,
            music, pool, and art. I also love junk journaling, if you can&apos;t tell from my super-cool scrappy
            portfolio.
          </p>
          <p className="about-body">
            You can find me in the trees and the breeze, but especially at{' '}
            <a href="mailto:shkrishnamurthy@ucsd.edu">shkrishnamurthy@ucsd.edu</a> and on{' '}
            <a href="https://www.linkedin.com/in/shreya-krishnamurthy" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            . You can also look more at my <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">experience</a> here!
          </p>
        </div>
        <div className="about-photo">
          <div className="about-photo-circle" ref={photoCircleRef}>
            <img src="/images/about/profile.jpg" alt="Shreya Krishnamurthy" />
          </div>
        </div>
      </main>

      <PacManFooter accentTeal="var(--accent-teal)" />
    </>
  )
}

function debounce(fn, wait) {
  let t
  return function () {
    clearTimeout(t)
    t = setTimeout(fn, wait)
  }
}
