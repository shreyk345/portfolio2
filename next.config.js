/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // About is now a section of the single-scroll home page, so the old
  // /about address jumps to it instead of 404-ing.
  async redirects() {
    return [{ source: '/about', destination: '/#about', permanent: false }]
  },
}

module.exports = nextConfig
