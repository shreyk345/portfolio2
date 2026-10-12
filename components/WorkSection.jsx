import { useEffect, useRef } from 'react'
import Link from 'next/link'
import StickerLayer from './StickerLayer'

const BRAND_PALETTE = ['#64CEBB', '#E6C7EB', '#F5C645', '#FE602F']

function WorkRow({ caseStudy, index }) {
  const rowRef = useRef(null)

  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    if (!('IntersectionObserver' in window)) {
      row.classList.add('in-view')
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    obs.observe(row)
    return () => obs.disconnect()
  }, [])

  const accent = BRAND_PALETTE[index % BRAND_PALETTE.length]
  const year = caseStudy.date ? new Date(caseStudy.date).getFullYear() : ''
  const meta = year ? String(year) : ''

  return (
    <Link
      href={`/case-studies/${caseStudy.slug}`}
      ref={rowRef}
      className="work-row"
      style={{ '--row-accent': accent }}
      data-sticker-avoid
    >
      <div className="work-thumb">
        <div
          className="work-thumb-inner"
          style={
            caseStudy.thumbnail
              ? { backgroundImage: `url(${caseStudy.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : {}
          }
        />
      </div>
      <div>
        {meta && <div className="work-meta">{meta}</div>}
        <h3 className="work-title">{caseStudy.title}</h3>
        <p className="work-desc">{caseStudy.description}</p>
      </div>
    </Link>
  )
}

export default function WorkSection({ caseStudies, stickers }) {
  return (
    <section className="work-section" id="work" style={{ position: 'relative' }}>
      <div className="work-heading-row">
        <h2 className="section-heading work-heading" data-sticker-avoid style={{ display: 'inline-block' }}>Work</h2>
      </div>
      <div className="work-list">
        {caseStudies.map((cs, i) => (
          <WorkRow key={cs.slug} caseStudy={cs} index={i} />
        ))}
      </div>
      <StickerLayer stickers={stickers} mode="scatter" />
    </section>
  )
}
