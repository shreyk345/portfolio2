import '../styles/globals.css'
import Reveal from '../components/Reveal'
import DoodlePen from '../components/DoodlePen'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <DoodlePen />
      <Reveal />
    </>
  )
}
