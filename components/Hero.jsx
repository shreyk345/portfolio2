import { useEffect, useRef, useState } from 'react'
import { createTileEl, placeTile, randomTileAngle } from '../lib/tiles'

// Each entry is [x, y, fill] for one 10x10 pixel block of the earth icon.
const EARTH_CELLS = [[0,50,"#233F69"],[0,60,"#2B4C7E"],[0,70,"#2B4C7E"],[0,80,"#2B4C7E"],[10,30,"#2B4C7E"],[10,40,"#233F69"],[10,50,"#2B4C7E"],[10,60,"#2B4C7E"],[10,70,"#2B4C7E"],[10,80,"#2B4C7E"],[10,90,"#233F69"],[10,100,"#2B4C7E"],[20,20,"#2B4C7E"],[20,30,"#233F69"],[20,40,"#2B4C7E"],[20,50,"#2B4C7E"],[20,60,"#2B4C7E"],[20,70,"#2B4C7E"],[20,80,"#233F69"],[20,90,"#2B4C7E"],[20,100,"#2B4C7E"],[20,110,"#2B4C7E"],[30,10,"#2B4C7E"],[30,20,"#233F69"],[30,30,"#2B4C7E"],[30,40,"#B4915C"],[30,50,"#8FAE63"],[30,60,"#2B4C7E"],[30,70,"#233F69"],[30,80,"#2B4C7E"],[30,90,"#2B4C7E"],[30,100,"#2B4C7E"],[30,110,"#2B4C7E"],[30,120,"#233F69"],[40,10,"#233F69"],[40,20,"#2B4C7E"],[40,30,"#2B4C7E"],[40,40,"#8FAE63"],[40,50,"#6E9450"],[40,60,"#8FAE63"],[40,70,"#2B4C7E"],[40,80,"#2B4C7E"],[40,90,"#6E9450"],[40,100,"#2B4C7E"],[40,110,"#233F69"],[40,120,"#2B4C7E"],[50,0,"#233F69"],[50,10,"#2B4C7E"],[50,20,"#2B4C7E"],[50,30,"#2B4C7E"],[50,40,"#6E9450"],[50,50,"#233F69"],[50,60,"#6E9450"],[50,70,"#2B4C7E"],[50,80,"#2B4C7E"],[50,90,"#8FAE63"],[50,100,"#B4915C"],[50,110,"#2B4C7E"],[50,120,"#2B4C7E"],[50,130,"#2B4C7E"],[60,0,"#2B4C7E"],[60,10,"#2B4C7E"],[60,20,"#2B4C7E"],[60,30,"#2B4C7E"],[60,40,"#233F69"],[60,50,"#6E9450"],[60,60,"#2B4C7E"],[60,70,"#2B4C7E"],[60,80,"#2B4C7E"],[60,90,"#233F69"],[60,100,"#2B4C7E"],[60,110,"#2B4C7E"],[60,120,"#2B4C7E"],[60,130,"#2B4C7E"],[70,0,"#2B4C7E"],[70,10,"#2B4C7E"],[70,20,"#2B4C7E"],[70,30,"#233F69"],[70,40,"#2B4C7E"],[70,50,"#2B4C7E"],[70,60,"#2B4C7E"],[70,70,"#2B4C7E"],[70,80,"#233F69"],[70,90,"#2B4C7E"],[70,100,"#2B4C7E"],[70,110,"#2B4C7E"],[70,120,"#2B4C7E"],[70,130,"#233F69"],[80,0,"#2B4C7E"],[80,10,"#2B4C7E"],[80,20,"#233F69"],[80,30,"#2B4C7E"],[80,40,"#2B4C7E"],[80,50,"#2B4C7E"],[80,60,"#2B4C7E"],[80,70,"#233F69"],[80,80,"#2B4C7E"],[80,90,"#2B4C7E"],[80,100,"#2B4C7E"],[80,110,"#2B4C7E"],[80,120,"#233F69"],[80,130,"#2B4C7E"],[90,10,"#233F69"],[90,20,"#2B4C7E"],[90,30,"#2B4C7E"],[90,40,"#2B4C7E"],[90,50,"#2B4C7E"],[90,60,"#6E9450"],[90,70,"#8FAE63"],[90,80,"#6E9450"],[90,90,"#2B4C7E"],[90,100,"#2B4C7E"],[90,110,"#233F69"],[90,120,"#2B4C7E"],[100,10,"#2B4C7E"],[100,20,"#2B4C7E"],[100,30,"#2B4C7E"],[100,40,"#2B4C7E"],[100,50,"#233F69"],[100,60,"#8FAE63"],[100,70,"#6E9450"],[100,80,"#8FAE63"],[100,90,"#2B4C7E"],[100,100,"#233F69"],[100,110,"#2B4C7E"],[100,120,"#2B4C7E"],[110,20,"#2B4C7E"],[110,30,"#2B4C7E"],[110,40,"#233F69"],[110,50,"#2B4C7E"],[110,60,"#2B4C7E"],[110,70,"#B4915C"],[110,80,"#2B4C7E"],[110,90,"#233F69"],[110,100,"#2B4C7E"],[110,110,"#2B4C7E"],[120,30,"#233F69"],[120,40,"#2B4C7E"],[120,50,"#2B4C7E"],[120,60,"#2B4C7E"],[120,70,"#2B4C7E"],[120,80,"#233F69"],[120,90,"#2B4C7E"],[120,100,"#2B4C7E"],[130,50,"#2B4C7E"],[130,60,"#2B4C7E"],[130,70,"#233F69"],[130,80,"#2B4C7E"]]

const STAGES = [
  { key: 'sun_set',   dur: 9000, theme: 'enter' },
  { key: 'coffee',    dur: 4200 },
  { key: 'hypnotic',  dur: 4200 },
  { key: 'mandala',   dur: 4200 },
  { key: 'cookie',    dur: 4200 },
  { key: 'discostar', dur: 7000 },
  { key: 'nineball',  dur: 4200 },
  { key: 'dragons',   dur: 4200 },
  { key: 'cdvinyl',   dur: 4200 },
  { key: 'sun_rise',  dur: 9000, theme: 'exit' },
]

function PixelEarth() {
  return (
    <svg viewBox="0 0 200 200">
      <g transform="translate(30,30)">
        <g className="earth-spin-slow">
          {EARTH_CELLS.map(([x, y, fill], i) => (
            <rect key={i} x={x} y={y} width="10" height="10" fill={fill} />
          ))}
        </g>
      </g>
    </svg>
  )
}

// ── p5.js sketches (instance mode) — same logic as the prototype, just
// factored out as plain functions so they can be dynamically imported
// client-side only (p5 needs `window`, which doesn't exist during SSR).
function vinylSketch(p) {
  let pos = [], vel = [], count = 10, spacing = 15, angle = 0, strokeW = 4

  p.setup = function () {
    const mount = document.getElementById('mount-cdvinyl')
    const size = mount.clientWidth || 300
    p.createCanvas(size, size)
    p.angleMode(p.DEGREES)
    const scaleFactor = size / 400
    spacing = 15 * scaleFactor
    strokeW = 4 * scaleFactor
    for (let i = 0; i < count; i++) { pos[i] = 1; vel[i] = (i + 1) * 0.5 }
  }

  p.draw = function () {
    p.background(0)
    p.noFill()
    p.translate(p.width / 2, p.height / 2)
    p.strokeWeight(strokeW)
    for (let i = 0; i < count; i++) {
      pos[i] = p.constrain(pos[i], 0, 180)
      p.stroke(200, 120 * (i / count), 0)
      p.arc(0, 0, (i + 1) * spacing, (i + 1) * spacing, angle + 0, angle + pos[i])
      p.arc(0, 0, (i + 1) * spacing, (i + 1) * spacing, angle - 180, angle - 180 + pos[i])
    }
    for (let i = 0; i < count; i++) {
      if (pos[i] >= 180 || pos[i] <= 0) vel[i] = vel[i] * -1
      pos[i] = pos[i] + vel[i]
    }
    angle = angle + 0.5
  }

  p.windowResized = function () {
    const mount = document.getElementById('mount-cdvinyl')
    const size = mount.clientWidth || 300
    p.resizeCanvas(size, size)
    spacing = 15 * (size / 400)
    strokeW = 4 * (size / 400)
  }
}

function hypnoticSketch(p) {
  let scaleFactor = 1

  class Circle {
    constructor(x, y, r) { this.x = x; this.y = y; this.r = r; this.dr = 1 }
    display() { p.noFill(); p.stroke(255); p.ellipse(this.x, this.y, this.r * 2, this.r * 2) }
    move() {
      if (this.r > 50 * scaleFactor || this.r < 0) this.dr = this.dr * -1
      this.r = this.r + this.dr
    }
  }
  class Pack {
    constructor(x, y, n, size, startAngle) {
      this.packx = x; this.packy = y; this.pack = []
      this.n = n; this.angle = size / this.n
      this.packr = 150 * scaleFactor
      this.startAngle = startAngle
      this.createCircles()
    }
    createCircles() {
      const scl = 0.1
      for (let i = 0; i < this.n; i++) {
        this.pack[i] = new Circle(
          this.packx + this.packr * p.cos(this.startAngle + this.angle * i),
          this.packy + this.packr * p.sin(this.startAngle + this.angle * i),
          (i + 1) * scl * 25 * scaleFactor
        )
      }
    }
    displayPack() { for (let i = 0; i < this.n; i++) { this.pack[i].display(); this.pack[i].move() } }
    movePack(speed) {
      this.startAngle += speed
      for (let i = 0; i < this.n; i++) {
        this.pack[i].x = this.packx + this.packr * p.cos(this.startAngle + this.angle * i)
        this.pack[i].y = this.packy + this.packr * p.sin(this.startAngle + this.angle * i)
      }
    }
  }

  let circles1, circles2
  const speed = 1

  p.setup = function () {
    const mount = document.getElementById('mount-hypnotic')
    const canvasSize = mount.clientWidth || 300
    p.createCanvas(canvasSize, canvasSize)
    p.angleMode(p.DEGREES)
    scaleFactor = canvasSize / 400
    circles1 = new Pack(p.width / 2, p.height / 2, 6, 180, 0)
    circles2 = new Pack(p.width / 2, p.height / 2, 6, 180, 180)
  }

  p.draw = function () {
    p.background(0, 10)
    circles1.displayPack(); circles1.movePack(speed)
    circles2.displayPack(); circles2.movePack(speed)
  }

  p.windowResized = function () {
    const mount = document.getElementById('mount-hypnotic')
    const canvasSize = mount.clientWidth || 300
    p.resizeCanvas(canvasSize, canvasSize)
    scaleFactor = canvasSize / 400
    circles1 = new Pack(p.width / 2, p.height / 2, 6, 180, circles1.startAngle)
    circles2 = new Pack(p.width / 2, p.height / 2, 6, 180, circles2.startAngle)
  }
}

function StageContent({ stageKey }) {
  switch (stageKey) {
    case 'sun_set':
    case 'sun_rise':
      return <PixelEarth />
    case 'coffee':
      return <div className="asset-disc disc-spin"><img src="/images/hero/coffee.png" alt="Coffee cup illustration" /></div>
    case 'mandala':
      return <div className="asset-disc disc-spin"><img src="/images/hero/mandala.png" alt="Mandala illustration" /></div>
    case 'cookie':
      return <div className="asset-disc disc-spin"><img src="/images/hero/cookie.png" alt="Cookie illustration" /></div>
    case 'nineball':
      return <div className="asset-disc disc-spin"><img src="/images/hero/nineball.png" alt="Nine ball illustration" /></div>
    case 'dragons':
      return <div className="asset-disc disc-spin"><img src="/images/hero/dragons.png" alt="Dragons illustration" /></div>
    case 'discostar':
      return <div className="asset-disc"><video id="video-discostar" src="/images/hero/stardust.mp4" muted loop playsInline preload="auto" /></div>
    case 'hypnotic':
      return <div className="p5-mount" id="mount-hypnotic" />
    case 'cdvinyl':
      return <div className="p5-mount" id="mount-cdvinyl" />
    default:
      return null
  }
}

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0)
  const portholeRef = useRef(null)
  const sunOrbitRef = useRef(null)
  const discoVideoRef = useRef(null)
  const vinylRef = useRef(null)
  const hypnoticRef = useRef(null)
  const idxRef = useRef(0)

  // Stage cycling — same recursive-setTimeout loop as the prototype, so
  // each stage's own duration drives the next transition exactly.
  useEffect(() => {
    let timer
    function loop() {
      setActiveIdx(idxRef.current)
      timer = setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % STAGES.length
        loop()
      }, STAGES[idxRef.current].dur)
    }
    loop()
    return () => clearTimeout(timer)
  }, [])

  // Mount both p5 sketches once, up front, idle (noLoop) until their stage
  // is actually active — avoids a cold-start stutter the first time each
  // one appears.
  useEffect(() => {
    let vinyl, hypnotic
    let cancelled = false
    import('p5').then(({ default: P5 }) => {
      if (cancelled) return
      vinyl = new P5(vinylSketch, document.getElementById('mount-cdvinyl'))
      vinyl.noLoop()
      vinylRef.current = vinyl
      hypnotic = new P5(hypnoticSketch, document.getElementById('mount-hypnotic'))
      hypnotic.noLoop()
      hypnoticRef.current = hypnotic
    })
    return () => {
      cancelled = true
      vinyl?.remove()
      hypnotic?.remove()
    }
  }, [])

  // Sun's travel path is a real circular arc computed from the dome's
  // actual rendered size, not an approximated CSS keyframe tween.
  useEffect(() => {
    function layoutSunPath() {
      const dome = portholeRef.current
      if (!dome) return
      const rect = dome.getBoundingClientRect()
      const R = rect.width / 2
      const r = R * 0.8
      const cx = R, cy = R
      const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
      if (sunOrbitRef.current) sunOrbitRef.current.style.offsetPath = `path('${d}')`
    }
    layoutSunPath()
    window.addEventListener('resize', layoutSunPath)
    return () => window.removeEventListener('resize', layoutSunPath)
  }, [])

  // Per-stage side effects: dark-mode toggle, sun animation, p5 loop/pause,
  // video play/pause.
  useEffect(() => {
    const stage = STAGES[activeIdx]

    if (stage.theme === 'enter') document.body.classList.add('dark')
    if (stage.theme === 'exit') document.body.classList.remove('dark')

    const sun = sunOrbitRef.current
    if (sun) {
      if (stage.key === 'sun_set' || stage.key === 'sun_rise') {
        sun.classList.add('active')
        sun.classList.remove('playing')
        void sun.offsetWidth
        sun.classList.add('playing')
      } else {
        sun.classList.remove('active', 'playing')
      }
    }

    if (stage.key === 'cdvinyl') vinylRef.current?.loop()
    else vinylRef.current?.noLoop()

    if (stage.key === 'hypnotic') hypnoticRef.current?.loop()
    else hypnoticRef.current?.noLoop()

    const video = discoVideoRef.current
    if (video) {
      if (stage.key === 'discostar') video.play().catch(() => {})
      else video.pause()
    }
  }, [activeIdx])

  // Hero is the only thing that ever puts body in dark mode. Since Next.js
  // client-side navigation doesn't reload the page, body.dark would
  // otherwise stay stuck on if you navigate away mid-cycle (any stage
  // before sun_rise) — this guarantees it's always cleared the moment
  // Hero itself leaves the page, regardless of which stage was active.
  useEffect(() => {
    return () => {
      document.body.classList.remove('dark')
    }
  }, [])

  // ── Curved headline + SHREYA tiles ──────────────────────
  const headlineWrapRef = useRef(null)
  const arcPathRef = useRef(null)
  const arcPathNameRef = useRef(null)
  const arcPathSubRef = useRef(null)
  const arcTextRef = useRef(null)
  const arcTextPathRef = useRef(null)
  const subTextRef = useRef(null)
  const userMovedTilesRef = useRef(false)
  const nameTileCleanupsRef = useRef([])

  useEffect(() => {
    function layoutArc() {
      const dome = portholeRef.current
      const wrap = headlineWrapRef.current
      if (!dome || !wrap) return
      const rect = dome.getBoundingClientRect()
      const domeRadius = rect.width / 2
      // How much room actually exists on each side of the centered dome —
      // the arc's extra radius (gap) must stay within this or its start/
      // end points push past the edge of the screen. On desktop there's
      // plenty of margin so the normal minimums apply; on narrow mobile
      // viewports this caps the gap down so "hi, i'm" never gets clipped.
      const availableMargin = Math.max(0, (window.innerWidth - rect.width) / 2)
      const safeMargin = availableMargin - 45
      const gap1 = Math.min(Math.max(85, domeRadius * 0.15), safeMargin)
      const gap2 = Math.max(2, domeRadius * 0.003)
      const gapName = Math.min(Math.max(100, domeRadius * 0.18), safeMargin)
      const r1 = domeRadius + gap1
      const r2 = domeRadius + gap2
      const rName = domeRadius + gapName
      const svgHeight = Math.max(r1, rName) + 56
      const svg = wrap.querySelector('svg')
      wrap.style.width = rect.width + 'px'
      wrap.style.height = svgHeight + 'px'
      svg.setAttribute('viewBox', `0 0 ${rect.width} ${svgHeight}`)
      svg.setAttribute('width', rect.width)
      svg.setAttribute('height', svgHeight)
      const cx = rect.width / 2, cy = svgHeight

      arcPathRef.current.setAttribute('d', `M ${cx - r1} ${cy} A ${r1} ${r1} 0 0 1 ${cx + r1} ${cy}`)
      const fontSize = Math.max(30, Math.min(104, domeRadius * 0.26))
      arcTextRef.current.style.fontSize = fontSize + 'px'

      arcPathNameRef.current.setAttribute('d', `M ${cx - rName} ${cy} A ${rName} ${rName} 0 0 1 ${cx + rName} ${cy}`)

      arcPathSubRef.current.setAttribute('d', `M ${cx - r2} ${cy} A ${r2} ${r2} 0 0 1 ${cx + r2} ${cy}`)
      const subtitleSize = Math.max(12, Math.min(18, domeRadius * 0.032))
      subTextRef.current.style.fontSize = subtitleSize + 'px'

      buildNameTiles(domeRadius, rect.width, gap1, gapName)
    }

    function buildNameTiles(domeRadius, domeWidth, gap1, gapName) {
      if (userMovedTilesRef.current) return
      const word = 'SHREYA'
      nameTileCleanupsRef.current.forEach((fn) => fn())
      nameTileCleanupsRef.current = []

      const svg = headlineWrapRef.current.querySelector('svg')
      const svgRect = svg.getBoundingClientRect()
      const headEl = arcTextRef.current
      const hiImLen = headEl.getComputedTextLength()

      const tileSize = Math.max(36, Math.min(72, domeRadius * 0.16))
      const tileGap = tileSize * 0.16

      const path = arcPathRef.current
      const totalLen = path.getTotalLength()
      const connector = tileSize * -0.35
      const wordWidth = word.length * tileSize + (word.length - 1) * tileGap
      const totalWidth = hiImLen + connector + wordWidth
      const rightShift = domeRadius * 0.12
      const startLen = Math.max(0, (totalLen - totalWidth) / 2) + rightShift
      headEl.setAttribute('text-anchor', 'start')
      arcTextPathRef.current.setAttribute('startOffset', startLen)

      const cx = domeWidth / 2
      const r1 = domeRadius + gap1
      const pathName = arcPathNameRef.current
      const totalLenName = pathName.getTotalLength()
      const rName = domeRadius + gapName

      const hiImEndLen = Math.min(totalLen, startLen + hiImLen)
      const hiImEndX = path.getPointAtLength(hiImEndLen).x
      const theta = Math.acos(Math.max(-1, Math.min(1, (cx - hiImEndX) / r1)))
      const matchedLenOnNameArc = rName * theta
      const nameConnector = tileSize * -0.85
      const wordStart = matchedLenOnNameArc + nameConnector

      for (let i = 0; i < word.length; i++) {
        const letter = word[i]
        const slotCenter = wordStart + i * (tileSize + tileGap) + tileSize / 2
        const clamped = Math.max(1, Math.min(totalLenName - 1, slotCenter))
        const pt = pathName.getPointAtLength(clamped)

        const tile = createTileEl(letter, randomTileAngle(), 'name')
        const cleanup = placeTile(
          tile,
          svgRect.left + pt.x - tileSize / 2,
          svgRect.top + pt.y - tileSize / 2,
          tileSize,
          550 + i * 70,
          () => { userMovedTilesRef.current = true }
        )
        nameTileCleanupsRef.current.push(cleanup)
      }
    }

    layoutArc()
    window.addEventListener('resize', layoutArc)
    document.fonts?.ready.then(layoutArc)
    return () => {
      window.removeEventListener('resize', layoutArc)
      nameTileCleanupsRef.current.forEach((fn) => fn())
    }
  }, [])

  return (
    <section className="hero">
      <div className="porthole" ref={portholeRef} id="porthole">
        <div className="porthole-glow" />
        {STAGES.map((s, i) => (
          <div key={s.key} className={`stage-icon${i === activeIdx ? ' active' : ''}`} data-stage={s.key}>
            {s.key === 'discostar'
              ? <div className="asset-disc"><video ref={discoVideoRef} src="/images/hero/stardust.mp4" muted loop playsInline preload="auto" /></div>
              : <StageContent stageKey={s.key} />}
          </div>
        ))}
        <div className="sun-orbit" ref={sunOrbitRef} />
      </div>

      <div className="headline-wrap" ref={headlineWrapRef}>
        <svg className="headline-svg">
          <path ref={arcPathRef} id="arcPath" fill="none" stroke="none" />
          <path ref={arcPathNameRef} fill="none" stroke="none" />
          <path ref={arcPathSubRef} id="arcPathSub" fill="none" stroke="none" />
          <text ref={arcTextRef} className="arc-text">
            <textPath ref={arcTextPathRef} href="#arcPath" startOffset="50%" textAnchor="middle">hi, i&#8217;m</textPath>
          </text>
          <text ref={subTextRef} className="subtitle-text">
            <textPath href="#arcPathSub" startOffset="50%" textAnchor="middle">product designer and storyteller</textPath>
          </text>
        </svg>
      </div>
    </section>
  )
}
