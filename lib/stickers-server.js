// lib/stickers-server.js  (build-time only — reads the sticker folder)
// Drop sticker images into /public/images/stickers/ and they are picked up
// automatically on the next build. Files whose names start with
// "placeholder-" are the temporary stand-ins; as soon as at least one real
// sticker is in the folder, the placeholders are ignored automatically.

import fs from 'fs'
import path from 'path'

const EXT = ['.png', '.webp', '.gif', '.svg', '.jpg', '.jpeg', '.avif']
const DIR = path.join(process.cwd(), 'public', 'images', 'stickers')

export function getStickers() {
  if (!fs.existsSync(DIR)) return []
  const files = fs
    .readdirSync(DIR)
    .filter((f) => EXT.includes(path.extname(f).toLowerCase()))
    .sort()
  const real = files.filter((f) => !f.toLowerCase().startsWith('placeholder-'))
  const use = real.length ? real : files
  return use.map((f) => `/images/stickers/${encodeURIComponent(f)}`)
}
