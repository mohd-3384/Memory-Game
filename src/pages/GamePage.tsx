import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { MemoryBoard } from '../components/MemoryBoard'
import { getThemeById } from '../data/themes'
import type { GameSettings, MemoryCard } from '../interfaces/game.interface'
import { buildDeck, getBoardColumns } from '../utils/game'

type GamePageProps = {
    settings: GameSettings
}

export function GamePage({ settings }: GamePageProps) {
    const navigate = useNavigate()
    const activeTheme = useMemo(() => getThemeById(settings.themeId), [settings.themeId])
    const [deck, setDeck] = useState<MemoryCard[]>(() => buildDeck(activeTheme, settings.boardSize))
    const [flippedCards, setFlippedCards] = useState<string[]>([])
    const [moves, setMoves] = useState(0)

    const hasWon = deck.length > 0 && deck.every((card) => card.matched)

    useEffect(() => {
        setDeck(buildDeck(activeTheme, settings.boardSize))
        setFlippedCards([])
        setMoves(0)
    }, [activeTheme, settings.boardSize])

    useEffect(() => {
        if (flippedCards.length !== 2) {
            return
        }

        const [firstUid, secondUid] = flippedCards
        const firstCard = deck.find((card) => card.uid === firstUid)
        const secondCard = deck.find((card) => card.uid === secondUid)

        if (!firstCard || !secondCard) {
            setFlippedCards([])
            return
        }

        if (firstCard.pairId === secondCard.pairId) {
            setDeck((previousDeck) =>
                previousDeck.map((card) =>
                    card.pairId === firstCard.pairId ? { ...card, matched: true } : card,
                ),
            )
            setFlippedCards([])
            return
        }

        const timeout = window.setTimeout(() => {
            setFlippedCards([])
        }, 900)

        return () => window.clearTimeout(timeout)
    }, [deck, flippedCards])

    function startNewGame() {
        setDeck(buildDeck(activeTheme, settings.boardSize))
        setFlippedCards([])
        setMoves(0)
    }

    function flipCard(card: MemoryCard) {
        if (card.matched || flippedCards.includes(card.uid) || flippedCards.length === 2) {
            return
        }

        setFlippedCards((previous) => [...previous, card.uid])

        if (flippedCards.length === 1) {
            setMoves((previous) => previous + 1)
        }
    }

    return (
        <main className="app" style={{ '--theme-accent': activeTheme.accent } as CSSProperties}>
            <section className="app__panel">
                <p className="app__kicker">Memory Spiel</p>
                <h1>React + TypeScript + SCSS</h1>
                <p className="app__subtitle">Theme: {activeTheme.label} · Player: {settings.player} · Board: {settings.boardSize} cards</p>

                <div className="app__actions">
                    <button type="button" className="button button--ghost" onClick={() => navigate('/settings')}>
                        Settings
                    </button>
                    <button type="button" className="button button--primary" onClick={startNewGame}>
                        Neues Spiel
                    </button>
                    <p className="app__stats">Züge: {moves}</p>
                </div>

                {hasWon ? <p className="app__win">Stark! Du hast alle Paare gefunden.</p> : null}
            </section>

            <MemoryBoard
                cards={deck}
                themeFront={activeTheme.front}
                flippedCards={flippedCards}
                boardColumns={getBoardColumns(settings.boardSize)}
                onFlip={flipCard}
            />
        </main>
    )
}
