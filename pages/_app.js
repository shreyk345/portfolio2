import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      {/* Shared drop target for the scrabble-tile system (Hero's SHREYA,
          Work's heading, About's "That's me") — rendered once here so
          every page has it automatically, rather than each page having to
          remember to include it. Play doesn't use this one — its tiles
          live in their own world-space layer inside the pannable canvas. */}
      <div className="tile-layer" id="tileLayer" />
    </>
  )
}
