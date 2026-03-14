import { useNavigate } from 'react-router-dom'
import { LandingHero } from '../components/LandingHero'

export function LandingPage() {
    const navigate = useNavigate()

    return <LandingHero onPlay={() => navigate('/settings')} />
}
