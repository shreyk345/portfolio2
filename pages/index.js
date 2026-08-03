import Head from 'next/head'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import WorkSection from '../components/WorkSection'
import PacManFooter from '../components/PacManFooter'
import { getAllCaseStudies } from '../lib/case-studies'

export default function Home({ allCaseStudies }) {
  return (
    <>
      <Head>
        <title>Shreya Krishnamurthy</title>
      </Head>
      <Navbar />
      <Hero />
      <WorkSection caseStudies={allCaseStudies} />
      <PacManFooter />
    </>
  )
}

export async function getStaticProps() {
  const allCaseStudies = getAllCaseStudies()

  return { props: { allCaseStudies } }
}
