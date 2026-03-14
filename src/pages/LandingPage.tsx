import { useNavigate } from 'react-router-dom'
import { LandingHero } from '../components/LandingHero'
import type { AppLanguage } from '../interfaces/game.interface'

type LandingPageProps = {
    language: AppLanguage
    onLanguageChange: (language: AppLanguage) => void
}

/**
 * Renders the start screen and forwards language and navigation actions to the hero.
 */
export function LandingPage({ language, onLanguageChange }: LandingPageProps) {
    const navigate = useNavigate()

    return <LandingHero language={language} onLanguageChange={onLanguageChange} onPlay={() => navigate('/settings')} />
}
