import StickerLayer from './StickerLayer'

export default function AboutSection({ stickers }) {
  return (
    <section className="about-section" id="about">
      <div className="about-inner">
        <div className="about-text" data-sticker-avoid>
          <p className="about-greeting">
            Welcome to my <span className="accent-word"><span className="accent-orange">Junkyard</span>!</span>
          </p>
          <p className="about-body">
            I&apos;m currently a design intern at U.S. Bank, and a senior at UC San Diego. I double major in
            Cognitive Science (specializing in Design and Interaction) and Interdisciplinary Computing and the
            Arts. If that&apos;s too much of a mouthful, just think of me as a creative with a huge passion for
            storytelling.
          </p>
          <p className="about-body">
            In my free time, I love hiking, running, cycling, swimming, the Legend of Zelda, history, books,
            music, pool, and art. I also love junk journaling, if you can&apos;t tell from my super-cool scrappy
            portfolio.
          </p>
          <p className="about-body">
            You can find me in the trees and the breeze, but especially at{' '}
            <a href="mailto:shkrishnamurthy@ucsd.edu">shkrishnamurthy@ucsd.edu</a> and on{' '}
            <a href="https://www.linkedin.com/in/shreya-krishnamurthy" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            . You can also look more at my <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">experience</a> here!
          </p>
        </div>
        <div className="about-photo">
          <div className="about-photo-frame" data-sticker-avoid>
            <img src="/images/about/me.png" alt="Shreya Krishnamurthy" />
          </div>
        </div>
      </div>
      <StickerLayer stickers={stickers} mode="collage" />
    </section>
  )
}
