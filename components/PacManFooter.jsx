import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const MAZE = [
  "###############################",
  "#.............................#",
  "#.###.###.###.###.###.###.#.#.#",
  "#.............................#",
  "#.#.#####.#######.#####.#####.#",
  "#.#.....#.#.....#.#.....#.....#",
  "#.###.#.#.#.###.#.#.#.###.#.###",
  "#.....#.....#.......#.....#...#",
  "#.###.#.#.###.#.#.#.#.###.#.#.#",
  "#.#.....#.#.....#.#.....#.#...#",
  "#.#.#####.#######.#####.#####.#",
  "#.............................#",
  "###############################",
]
const ROWS = MAZE.length, COLS = MAZE[0].length
const PLAYER_START = { r: 11, c: 15 }
const GHOST_STARTS = [
  { r: 5, c: 7, kind: 'work' },
  { r: 5, c: 15, kind: 'school' },
  { r: 5, c: 23, kind: 'sleep' },
]

function isWall(r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true
  return MAZE[r][c] === '#'
}

function nextStepTowards(fromR, fromC, toR, toC) {
  if (fromR === toR && fromC === toC) return null
  const visited = {}
  const key = (r, c) => `${r},${c}`
  visited[key(fromR, fromC)] = null
  const queue = [[fromR, fromC]]
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  while (queue.length) {
    const [r, c] = queue.shift()
    if (r === toR && c === toC) break
    for (let i = 0; i < dirs.length; i++) {
      const nr = r + dirs[i][0], nc = c + dirs[i][1]
      if (!isWall(nr, nc) && !(key(nr, nc) in visited)) {
        visited[key(nr, nc)] = key(r, c)
        queue.push([nr, nc])
      }
    }
  }
  if (!(key(toR, toC) in visited)) return null
  let cursor = key(toR, toC)
  let prev = visited[cursor]
  while (prev !== null && prev !== key(fromR, fromC)) {
    cursor = prev
    prev = visited[cursor]
  }
  const [r, c] = cursor.split(',')
  return { r: parseInt(r, 10), c: parseInt(c, 10) }
}

export default function PacManFooter() {
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const footerRef = useRef(null)
  const wrapRef = useRef(null)
  const scoreboardRef = useRef(null)
  const [score, setScore] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalWin, setModalWin] = useState(false)
  const [showScoreboard, setShowScoreboard] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return
    const ctx = canvas.getContext('2d')

    let CELL_X = 32, CELL_Y = 32
    function sizeCanvas() {
      const r = stage.getBoundingClientRect()
      const cs = getComputedStyle(stage)
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      const availW = r.width - padX, availH = r.height - padY
      CELL_X = availW / COLS
      CELL_Y = availH / ROWS
      canvas.width = Math.round(availW)
      canvas.height = Math.round(availH)
    }
    sizeCanvas()
    let resizeT
    function onResize() {
      clearTimeout(resizeT)
      resizeT = setTimeout(sizeCanvas, 150)
    }
    window.addEventListener('resize', onResize)

    let player, ghosts, pellets, gameState = 'idle'
    let desiredDir = { r: 0, c: 0 }, currentDir = { r: 0, c: 0 }
    let localScore = 0

    function resetGame() {
      player = { r: PLAYER_START.r, c: PLAYER_START.c, facing: 1 }
      ghosts = GHOST_STARTS.map((g) => ({ r: g.r, c: g.c, kind: g.kind, facing: 'right' }))
      pellets = {}
      const corners = [[1, 1], [1, 29], [11, 1], [11, 29]]
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (MAZE[r][c] === '.') {
            const isStart = (r === PLAYER_START.r && c === PLAYER_START.c) || GHOST_STARTS.some((g) => g.r === r && g.c === c)
            if (isStart) continue
            const isCorner = corners.some((p) => p[0] === r && p[1] === c)
            pellets[`${r},${c}`] = isCorner ? 'coffee' : 'cookie'
          }
        }
      }
      localScore = 0
      desiredDir = { r: 0, c: 0 }; currentDir = { r: 0, c: 0 }
      gameState = 'idle'
      setScore(0)
      setModalOpen(false)
      setShowScoreboard(false)
    }

    function checkCollision() {
      if (gameState !== 'playing') return
      ghosts.forEach((g) => {
        if (g.r === player.r && g.c === player.c) {
          gameState = 'lost'
          setModalWin(false)
          setModalOpen(true)
        }
      })
    }

    function tickPlayer() {
      if (gameState !== 'playing') return
      if (!isWall(player.r + desiredDir.r, player.c + desiredDir.c) && (desiredDir.r || desiredDir.c)) currentDir = desiredDir
      const nr = player.r + currentDir.r, nc = player.c + currentDir.c
      if (!isWall(nr, nc)) {
        player.r = nr; player.c = nc
        if (currentDir.c > 0) player.facing = 1
        else if (currentDir.c < 0) player.facing = -1
      }
      const pkey = `${player.r},${player.c}`
      if (pellets[pkey]) {
        localScore += pellets[pkey] === 'coffee' ? 50 : 10
        delete pellets[pkey]
        setScore(localScore)
        if (Object.keys(pellets).length === 0) {
          gameState = 'won'
          setModalWin(true)
          setModalOpen(true)
        }
      }
      checkCollision()
    }

    function tickGhosts() {
      if (gameState !== 'playing') return
      ghosts.forEach((g) => {
        const step = nextStepTowards(g.r, g.c, player.r, player.c)
        if (step) {
          if (step.c > g.c) g.facing = 'right'
          else if (step.c < g.c) g.facing = 'left'
          g.r = step.r; g.c = step.c
        }
      })
      checkCollision()
    }

    const imgs = {}
    function loadImg(key, src) {
      const im = new Image()
      im.src = src
      imgs[key] = im
    }
    loadImg('me_normal', '/images/pacman/pm_me_normal.png')
    loadImg('me_smile', '/images/pacman/pm_me_smile.png')
    loadImg('cookie', '/images/pacman/pm_cookie.png')
    loadImg('coffee', '/images/pacman/pm_coffee.png')
    ;['work', 'school', 'sleep'].forEach((k) => {
      loadImg(`${k}_left`, `/images/pacman/pm_${k}_ghost_left.png`)
      loadImg(`${k}_right`, `/images/pacman/pm_${k}_ghost_right.png`)
    })

    function drawWalls() {
      const inset = Math.max(2, Math.round(Math.min(CELL_X, CELL_Y) * 0.12))
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (MAZE[r][c] !== '#') continue
          const cellX = c * CELL_X, cellY = r * CELL_Y
          ctx.fillStyle = '#0a0906'
          ctx.fillRect(cellX, cellY, CELL_X, CELL_Y)
          ctx.fillStyle = '#64CEBB'
          ctx.fillRect(cellX + inset, cellY + inset, CELL_X - inset * 2, CELL_Y - inset * 2)
        }
      }
    }

    let rafId
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawWalls()
      const spriteBase = Math.min(CELL_X, CELL_Y)
      const charSize = spriteBase * 1.6
      Object.keys(pellets).forEach((k) => {
        const [r, c] = k.split(',').map(Number)
        const kind = pellets[k]
        const img = imgs[kind]
        const size = kind === 'coffee' ? spriteBase * 0.7 : spriteBase * 0.42
        const x = c * CELL_X + CELL_X / 2 - size / 2, y = r * CELL_Y + CELL_Y / 2 - size / 2
        if (img && img.complete) ctx.drawImage(img, x, y, size, size)
      })
      ghosts.forEach((g) => {
        const img = imgs[`${g.kind}_${g.facing}`]
        const gx = g.c * CELL_X + CELL_X / 2 - charSize / 2, gy = g.r * CELL_Y + CELL_Y / 2 - charSize / 2
        if (img && img.complete) ctx.drawImage(img, gx, gy, charSize, charSize)
      })
      const pimg = imgs[gameState === 'won' ? 'me_smile' : 'me_normal']
      if (pimg && pimg.complete) {
        ctx.save()
        const px = player.c * CELL_X + CELL_X / 2 - charSize / 2, py = player.r * CELL_Y + CELL_Y / 2 - charSize / 2
        if (player.facing > 0) {
          ctx.translate(px + charSize, py)
          ctx.scale(-1, 1)
          ctx.drawImage(pimg, 0, 0, charSize, charSize)
        } else {
          ctx.drawImage(pimg, px, py, charSize, charSize)
        }
        ctx.restore()
      }
      rafId = requestAnimationFrame(draw)
    }

    resetGame()
    draw()
    const playerInterval = setInterval(tickPlayer, 160)
    const ghostInterval = setInterval(tickGhosts, 220)

    let localFooterVisible = false
    function onKeyDown(e) {
      if (!localFooterVisible) return
      const k = e.key.toLowerCase()
      if (k === ' ') {
        e.preventDefault()
        if (gameState === 'idle') {
          gameState = 'playing'
          setShowScoreboard(true)
        } else if (gameState === 'won' || gameState === 'lost') {
          resetGame()
          gameState = 'playing'
          setShowScoreboard(true)
        }
        return
      }
      if (gameState !== 'playing') return
      if (k === 'arrowup' || k === 'w') { e.preventDefault(); desiredDir = { r: -1, c: 0 } }
      else if (k === 'arrowdown' || k === 's') { e.preventDefault(); desiredDir = { r: 1, c: 0 } }
      else if (k === 'arrowleft' || k === 'a') { e.preventDefault(); desiredDir = { r: 0, c: -1 } }
      else if (k === 'arrowright' || k === 'd') { e.preventDefault(); desiredDir = { r: 0, c: 1 } }
    }
    window.addEventListener('keydown', onKeyDown)

    const footerEl = footerRef.current
    const wrapEl = wrapRef.current

    // Single source of truth for the slide: a bidirectional observer on
    // the normal-flow wrap sentinel. Scrolling down past it adds
    // 'slide-in' (footer eases up into place like its own page); scrolling
    // back up past it removes the class (footer eases back down out of
    // view) — the same observer naturally handles both directions since
    // isIntersecting flips both ways.
    const footerIo = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting
        localFooterVisible = visible
        footerEl.classList.toggle('slide-in', visible)
        document.body.classList.toggle('pm-footer-active', visible)
      },
      { threshold: 0.35 }
    )
    footerIo.observe(wrapEl)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
      clearTimeout(resizeT)
      clearInterval(playerInterval)
      clearInterval(ghostInterval)
      cancelAnimationFrame(rafId)
      footerIo.disconnect()
    }
  }, [])

  return (
    <div className="footer-scroll-wrap" ref={wrapRef}>
      <section className="pm-footer" ref={footerRef}>
        <div className="pm-heading-row">
          <div>
            <p className="pm-heading">
              Leaving so <span className="pm-pink">soon</span>?
            </p>
            <p className="pm-sub">press the spacebar to help me through my day!</p>
          </div>
          <div className={`pm-scoreboard-frame pixel-notch${showScoreboard ? ' show' : ''}`} ref={scoreboardRef}>
            <div className="pm-scoreboard-inner pixel-notch">
              SCORE<span className="val">{score}</span>
            </div>
          </div>
          <nav className="pm-topbar-nav">
            <span className="pm-goback">GO BACK</span>
            <Link href="/#work" style={{ '--nav-accent': '#64CEBB' }}>WORK</Link>
            <Link href="/play" style={{ '--nav-accent': '#E6C7EB' }}>PLAY</Link>
            <Link href="/about" style={{ '--nav-accent': '#F5C645' }}>ABOUT</Link>
          </nav>
        </div>
        <div className="pm-stage" ref={stageRef}>
          <canvas ref={canvasRef} />
          <div className={`pm-modal${modalOpen ? ' open' : ''}`}>
            <div className="pm-modal-frame pixel-notch">
              <div className="pm-modal-board pixel-notch">
                {modalWin ? (
                  <>
                    <div className="l1">YOU WIN! NAP TIME</div>
                    <div className="l2">zzzzzz</div>
                    <div className="l3">press spacebar to play again</div>
                  </>
                ) : (
                  <>
                    <div className="l1">CAUGHT!</div>
                    <div className="l2">it&#8217;s not nap time yet...</div>
                    <div className="l3">press spacebar to play again</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
