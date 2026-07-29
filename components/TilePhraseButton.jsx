// components/TilePhraseButton.jsx
// The real tile face (Tile.jsx) is designed for a roughly-square shape —
// stretching that same SVG to fit a wide multi-word button distorts the
// rounded corners and the diagonal fold lines, since a fixed viewBox
// scaled non-uniformly warps everything in it.
//
// This recreates the identical visual (an offset "back" card peeking out
// behind a "front" card, connected by short diagonal lines at three
// corners) but measures the button's *actual* rendered pixel size first,
// so the SVG's viewBox always maps 1:1 to real pixels — the corner
// radius and fold-line length stay constant and correct no matter how
// wide the label is.

import { useEffect, useRef, useState } from 'react'

const OFFSET = 8
const RADIUS = 10

export default function TilePhraseButton({
  children,
  href,
  onClick,
  disabled,
  target,
  rel,
  accent = 'var(--accent)',
  className,
  style,
  ...rest
}) {
  const ref = useRef(null)
  const [dims, setDims] = useState(null)

  useEffect(() => {
    function measure() {
      if (ref.current) {
        const r = ref.current.getBoundingClientRect()
        if (r.width > 0 && r.height > 0) setDims({ w: r.width, h: r.height })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)
    return () => window.removeEventListener('resize', measure)
  }, [children])

  const w = dims?.w ?? 0
  const h = dims?.h ?? 0
  const svgW = w + OFFSET
  const svgH = h + OFFSET

  const Tag = href ? 'a' : 'button'

  return (
    <Tag
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      disabled={disabled}
      className={`tile-phrase-button ${className || ''}`}
      style={{ '--tile-accent': accent, ...style }}
      {...rest}
    >
      {dims && (
        <svg
          className="tile-phrase-face"
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={svgW}
          height={svgH}
          preserveAspectRatio="none"
        >
          <rect className="tf-back" x={OFFSET} y={OFFSET} width={w - OFFSET} height={h - OFFSET} rx={RADIUS} />
          <line className="tf-edge" x1={w - OFFSET - 2} y1={2} x2={w - 2} y2={OFFSET + 2} />
          <line className="tf-edge" x1={w - OFFSET - 2} y1={h - OFFSET - 2} x2={w - 2} y2={h - 2} />
          <line className="tf-edge" x1={2} y1={h - OFFSET - 2} x2={OFFSET + 2} y2={h - 2} />
          <rect className="tf-front" x={0} y={0} width={w - OFFSET} height={h - OFFSET} rx={RADIUS} />
        </svg>
      )}
      <span className="tile-phrase-label">{children}</span>
    </Tag>
  )
}
