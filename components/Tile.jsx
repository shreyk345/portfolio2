// components/Tile.jsx
// The exact scrabble-tile visuals used by the nav (WORK/PLAY/ABOUT, icon
// links) — extracted here so anything else that wants a real tile (like
// buttons) uses the literal same markup instead of a re-implementation
// that can drift out of sync visually.

export function TileFace() {
  return (
    <svg className="tile-face" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect className="tf-back" x="10" y="10" width="76" height="76" rx="14" />
      <line className="tf-edge" x1="71.9" y1="4.1" x2="81.9" y2="14.1" />
      <line className="tf-edge" x1="71.9" y1="71.9" x2="81.9" y2="81.9" />
      <line className="tf-edge" x1="4.1" y1="71.9" x2="14.1" y2="81.9" />
      <rect className="tf-front" x="0" y="0" width="76" height="76" rx="14" />
    </svg>
  )
}

export function LetterTile({ letter, rotate = 0 }) {
  return (
    <span className="nav-tile" style={{ transform: `rotate(${rotate}deg)` }}>
      <TileFace />
      <span className="tile-letter">{letter}</span>
    </span>
  )
}

export function IconTile({ src, alt, rotate = 0 }) {
  return (
    <span className="nav-tile nav-tile-icon" style={{ transform: `rotate(${rotate}deg)` }}>
      <TileFace />
      <img className="tile-icon" src={src} alt={alt} />
    </span>
  )
}
