import Head from 'next/head'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import WorkSection from '../components/WorkSection'
import AboutSection from '../components/AboutSection'
import Landing from '../components/Landing'
import ScrollGradient from '../components/ScrollGradient'
import { getAllCaseStudies } from '../lib/case-studies'
import { getStickers } from '../lib/stickers-server'

// One continuous page: hero → work → about → landing.
export default function Home({ allCaseStudies, stickers }) {
  return (
    <>
      <Head>
        <title>Shreya Krishnamurthy</title>
      </Head>
      <Navbar />
      <ScrollGradient />
      <main>
        <Hero />
        <WorkSection caseStudies={allCaseStudies} stickers={stickers} />
        <AboutSection stickers={stickers} />
        <Landing />
      </main>
    </>
  )
}

export async function getStaticProps() {
  const allCaseStudies = getAllCaseStudies()
  const stickers = getStickers()
  return { props: { allCaseStudies, stickers } }
}
