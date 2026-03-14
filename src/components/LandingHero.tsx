import { FiArrowRight } from 'react-icons/fi'
import { IoGameControllerOutline } from 'react-icons/io5'
import { getTranslations } from '../data/translations'
import type { AppLanguage } from '../interfaces/game.interface'

type LandingHeroProps = {
    language: AppLanguage
    onLanguageChange: (language: AppLanguage) => void
    onPlay: () => void
}

/**
 * Displays the landing hero with language switching and the primary play action.
 */
export function LandingHero({ language, onLanguageChange, onPlay }: LandingHeroProps) {
    const text = getTranslations(language)

    return (
        <main className="landing">
            <div className="landing__ornament" aria-hidden="true">
                <IoGameControllerOutline />
            </div>

            <div className="landing-language" aria-label="Language switch">
                <button
                    type="button"
                    className={`landing-language__button ${language === 'de' ? 'is-active' : ''}`}
                    onClick={() => onLanguageChange('de')}
                >
                    {text.languageGerman}
                </button>
                <button
                    type="button"
                    className={`landing-language__button ${language === 'en' ? 'is-active' : ''}`}
                    onClick={() => onLanguageChange('en')}
                >
                    {text.languageEnglish}
                </button>
            </div>

            <section className="landing__content">
                <p className="landing__kicker">{text.landingKicker}</p>
                <h1 className="landing__title">{text.landingTitle}</h1>

                <button type="button" className="play-button" onClick={onPlay}>
                    <span className="play-button__left">
                        <IoGameControllerOutline />
                        <span>{text.landingPlay}</span>
                    </span>
                    <FiArrowRight />
                </button>
            </section>
        </main>
    )
}
