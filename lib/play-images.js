// lib/play-images.js
// Reads images from /public/images/play/ at build time.
// Titles and descriptions come from /public/images/play/metadata.json
// Format: { "filename-without-extension": { "title": "...", "description": "..." } }
// Images are returned with stable dimensions for masonry layout.

import fs   from 'fs'
import path from 'path'

const SUPPORTED       = ['.jpg','.jpeg','.png','.gif','.webp','.avif']
const SUPPORTED_VIDEO = ['.mp4','.webm','.mov']
const PLAY_DIR  = path.join(process.cwd(), 'public', 'images', 'play')

// Masonry layout: we assign each image a "size" class based on index
// so images alternate between wide, tall, and square to form a mosaic
const SIZES = ['wide','square','tall','square','wide','tall']

export function getPlayImages() {
  if (!fs.existsSync(PLAY_DIR)) return []

  // Load metadata if it exists
  let meta = {}
  const metaPath = path.join(PLAY_DIR, 'metadata.json')
  if (fs.existsSync(metaPath)) {
    try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) } catch {}
  }

  return fs
    .readdirSync(PLAY_DIR)
    .filter(f => SUPPORTED.includes(path.extname(f).toLowerCase()) || SUPPORTED_VIDEO.includes(path.extname(f).toLowerCase()))
    .map((f, i) => {
      const slug   = path.basename(f, path.extname(f))
      const info   = meta[slug] || {}
      const isVideo = SUPPORTED_VIDEO.includes(path.extname(f).toLowerCase())
      return {
        src:         `/images/play/${f}`,
        alt:         slug.replace(/[-_]/g, ' '),
        title:       info.title || slug.replace(/[-_]/g, ' '),
        description: info.description || '',
        size:        SIZES[i % SIZES.length],
        isVideo,
      }
    })
}
