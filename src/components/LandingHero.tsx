import { FiArrowRight } from 'react-icons/fi'
import { IoGameControllerOutline } from 'react-icons/io5'

type LandingHeroProps = {
    onPlay: () => void
}

export function LandingHero({ onPlay }: LandingHeroProps) {
    return (
        <main className="landing">
            <div className="landing__ornament" aria-hidden="true">
                <IoGameControllerOutline />
            </div>

            <section className="landing__content">
                <p className="landing__kicker">It's play time.</p>
                <h1 className="landing__title">Ready to play?</h1>

                <button type="button" className="play-button" onClick={onPlay}>
                    <span className="play-button__left">
                        <IoGameControllerOutline />
                        <span>Play</span>
                    </span>
                    <FiArrowRight />
                </button>
            </section>
        </main>
    )
}
