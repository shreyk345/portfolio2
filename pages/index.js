import Head from 'next/head'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import WorkSection from '../components/WorkSection'
import PacManFooter from '../components/PacManFooter'
import { getAllCaseStudies } from '../lib/case-studies'

export default function Home({ featuredCaseStudies }) {
  return (
    <>
      <Head>
        <title>Shreya Krishnamurthy</title>
      </Head>
      <Navbar />
      <Hero />
      <WorkSection caseStudies={featuredCaseStudies} />
      <PacManFooter />
    </>
  )
}

export async function getStaticProps() {
  const all = getAllCaseStudies()
  const featured = all.filter((cs) => cs.featured).slice(0, 3)
  const featuredCaseStudies = featured.length >= 3 ? featured : all.slice(0, 3)

  return { props: { featuredCaseStudies } }
}
