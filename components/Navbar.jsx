import { useRouter } from 'next/router'
import Link from 'next/link'

// Fixed top bar: logo on the left; work · play · about · resume on the right.
export default function Navbar() {
  const router = useRouter()
  const isHome = router.pathname === '/'

  // On the home page, work/about scroll to their section.
  // From any other page they jump back to home AT that section (/#work, /#about).
  function goSection(id) {
    return (e) => {
      if (isHome) {
        e.preventDefault()
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        window.history.replaceState(null, '', `/#${id}`)
      }
    }
  }
  function goTop(e) {
    if (isHome) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      window.history.replaceState(null, '', '/')
    }
  }

  return (
    <header className="site-nav">
      <Link href="/" className="site-logo" aria-label="Home" onClick={goTop}>
        <img src="/images/logo.png" alt="" />
      </Link>
      <nav className="site-nav-links" aria-label="Main">
        <Link href="/#work" onClick={goSection('work')} className="btn btn--nav" style={{ '--btn-accent': '#64CEBB' }}>work</Link>
        <Link href="/play" className="btn btn--nav" style={{ '--btn-accent': '#E6C7EB' }}>play</Link>
        <Link href="/#about" onClick={goSection('about')} className="btn btn--nav" style={{ '--btn-accent': '#F5C645' }}>about</Link>
        <a href="/resume.pdf" className="btn btn--nav" style={{ '--btn-accent': '#FE602F' }} target="_blank" rel="noopener noreferrer">resume</a>
      </nav>
    </header>
  )
}
