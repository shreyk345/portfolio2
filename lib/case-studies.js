// lib/case-studies.js
// All data fetching for case studies lives here.
// The designer never needs to touch this file.
// To add a new case study: create a new .md file in /content/case-studies/

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'case-studies')

// Get all slugs (used for static path generation)
export function getAllSlugs() {
  const files = fs.readdirSync(CONTENT_DIR)
  return files
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

// Get metadata for ALL case studies (homepage + index page)
export function getAllCaseStudies() {
  const slugs = getAllSlugs()
  const studies = slugs
    .map((slug) => {
      const fullPath = path.join(CONTENT_DIR, `${slug}.md`)
      const raw = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(raw)
      return {
        slug,
        title:       data.title       || 'Untitled',
        date:        data.date        || '',
        thumbnail:   data.thumbnail   || null,
        description: data.description || '',
        featured:    data.featured    || false,
        protected:   data.protected   || false,
      }
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)) // oldest first for numbering

  // Assign case numbers by year: track count per year
  const yearCount = {}
  return studies
    .map((cs) => {
      const year = cs.date ? new Date(cs.date).getFullYear() : new Date().getFullYear()
      yearCount[year] = (yearCount[year] || 0) + 1
      const caseNumber = `#${String(yearCount[year]).padStart(3,'0')}-${year}`
      return { ...cs, caseNumber }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // newest first for display
}

// ── Markdown-in-HTML safety net ─────────────────────────────
// CommonMark's rule for raw HTML blocks is that they keep consuming lines
// until a BLANK line appears. If you write a heading (or any markdown)
// directly on the line right after a closing tag with no blank line
// between them, that heading gets swallowed into the HTML block as
// literal text instead of rendering as a real heading. This inserts the
// missing blank line automatically so that doesn't happen, without
// requiring you to remember to do it by hand every time.
function ensureBlankLinesAroundHtml(md) {
  return md.replace(/(^[ \t]*<\/[a-zA-Z][a-zA-Z0-9]*>[ \t]*$)\n(?!\n)/gm, '$1\n\n')
}

// CommonMark also treats any line indented 4+ spaces as a literal code
// block, UNLESS it's clearly still part of a raw HTML block. Mixed
// indentation inside nested HTML (e.g. a <figure> whose inner <video> and
// <figcaption> lines happen to sit at 4+ spaces while a sibling <source>
// sits at 2) can trip this — the over-indented lines get pulled out as an
// escaped code block instead of rendering as HTML. This flattens any
// HTML-tag-looking line's indentation down to a safe 2 spaces so nesting
// still reads clearly in the source but never accidentally crosses
// CommonMark's 4-space threshold.
function dedentHtmlLines(md) {
  return md
    .split('\n')
    .map((line) => {
      const trimmed = line.replace(/^[ \t]+/, '')
      const leadingSpaces = line.length - trimmed.length
      if (leadingSpaces >= 4 && /^<\/?[a-zA-Z]/.test(trimmed)) {
        return '  ' + trimmed
      }
      return line
    })
    .join('\n')
}

// ── Heading extraction for the timeline nav ─────────────────
// Walks the already-rendered HTML for h2/h3 tags, gives each one a
// unique id (slugified from its text), and returns both the updated
// HTML (with ids injected) and a flat list describing each heading so
// the page can build a scroll-spy timeline from it.
function extractHeadings(html) {
  const headings = []
  const seen = {}

  function slugify(text) {
    let id = text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    if (!id) id = 'section'
    if (seen[id] != null) {
      seen[id] += 1
      id = `${id}-${seen[id]}`
    } else {
      seen[id] = 0
    }
    return id
  }

  const updatedHtml = html.replace(/<(h1|h2|h3)([^>]*)>([\s\S]*?)<\/\1>/g, (match, tag, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim()
    if (!text) return match
    const id = slugify(text)
    const level = tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3
    headings.push({ id, text, level })
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`
  })

  return { html: updatedHtml, headings }
}

// Get a single case study with full HTML content
export async function getCaseStudy(slug) {
  const fullPath = path.join(CONTENT_DIR, `${slug}.md`)
  const raw = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(raw)

  const safeContent = dedentHtmlLines(ensureBlankLinesAroundHtml(content))

  // remark-rehype + rehype-raw handles raw HTML in the markdown source
  // more robustly than remark-html across a wider range of cases (nested
  // blocks, custom elements, etc.) — allowDangerousHtml is required on
  // both ends since this is trusted content you're writing yourself.
  const processed = await remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(safeContent)

  // rehype sometimes still wraps block-level HTML in <p> tags — strip those
  let contentHtml = processed.toString()
    .replace(/<p>(<figure[\s\S]*?<\/figure>)<\/p>/g, '$1')
    .replace(/<p>(<div[\s\S]*?<\/div>)<\/p>/g, '$1')
    .replace(/<p>(<video[\s\S]*?<\/video>)<\/p>/g, '$1')

  const { html: contentHtmlWithIds, headings } = extractHeadings(contentHtml)

  return {
    slug,
    title:         data.title         || 'Untitled',
    date:          data.date          || '',
    thumbnail:     data.thumbnail     || null,
    description:   data.description   || '',
    protected:     data.protected     || false,
    prototypeUrl:  data.prototypeUrl  || null,
    duration:      data.duration      || null,
    role:          data.role          || null,
    contentHtml:   contentHtmlWithIds,
    headings,
  }
}
