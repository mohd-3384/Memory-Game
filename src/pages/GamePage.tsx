import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuVolume2, LuVolumeX } from 'react-icons/lu'
import { MemoryBoard } from '../components/MemoryBoard'
import { getThemeById } from '../data/themes'
import type { GameSettings, MemoryCard, PlayerId } from '../interfaces/game.interface'
import { buildDeck, getBoardColumns } from '../utils/game'

type GamePageProps = {
    settings: GameSettings
    onSoundChange: (soundEnabled: boolean) => void
}

export function GamePage({ settings, onSoundChange }: GamePageProps) {
    const navigate = useNavigate()
    const activeTheme = useMemo(() => getThemeById(settings.themeId), [settings.themeId])
    const audioContextRef = useRef<AudioContext | null>(null)
    const hasPlayedWinSoundRef = useRef(false)

    const [deck, setDeck] = useState<MemoryCard[]>(() => buildDeck(activeTheme, settings.boardSize))
    const [flippedCards, setFlippedCards] = useState<string[]>([])
    const [moves, setMoves] = useState(0)
    const [currentPlayer, setCurrentPlayer] = useState<PlayerId>(settings.player)
    const [scores, setScores] = useState<Record<PlayerId, number>>({ blue: 0, orange: 0 })
    const [isResolvingTurn, setIsResolvingTurn] = useState(false)

    const isMultiplayer = settings.playerCount === 2
    const hasWon = deck.length > 0 && deck.every((card) => card.matched)
    const currentRound = hasWon ? moves : moves + 1
    const winnerText =
        !isMultiplayer
            ? `You matched all pairs in ${moves} moves.`
            : scores.blue === scores.orange
                ? 'It is a draw! Both players have the same number of pairs.'
                : `${scores.blue > scores.orange ? 'Blue' : 'Orange'} wins with ${Math.max(scores.blue, scores.orange)} pairs.`

    function getAudioContext(): AudioContext | null {
        if (!settings.soundEnabled) {
            return null
        }

        const AudioContextCtor = window.AudioContext
        if (!AudioContextCtor) {
            return null
        }

        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContextCtor()
        }

        if (audioContextRef.current.state === 'suspended') {
            void audioContextRef.current.resume()
        }

        return audioContextRef.current
    }

    function playTone(
        audioContext: AudioContext,
        frequency: number,
        duration: number,
        delay = 0,
        waveType: OscillatorType = 'sine',
    ) {
        const oscillator = audioContext.createOscillator()
        const gain = audioContext.createGain()
        const now = audioContext.currentTime + delay

        oscillator.type = waveType
        oscillator.frequency.setValueAtTime(frequency, now)
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

        oscillator.connect(gain)
        gain.connect(audioContext.destination)
        oscillator.start(now)
        oscillator.stop(now + duration)
    }

    function playFlipSound() {
        const audioContext = getAudioContext()
        if (!audioContext) {
            return
        }

        playTone(audioContext, 520, 0.07, 0, 'triangle')
    }

    function playMatchSound() {
        const audioContext = getAudioContext()
        if (!audioContext) {
            return
        }

        playTone(audioContext, 560, 0.1, 0, 'sine')
        playTone(audioContext, 760, 0.12, 0.09, 'sine')
    }

    function playMissSound() {
        const audioContext = getAudioContext()
        if (!audioContext) {
            return
        }

        playTone(audioContext, 410, 0.11, 0, 'sawtooth')
        playTone(audioContext, 290, 0.11, 0.1, 'sawtooth')
    }

    function playWinSound() {
        const audioContext = getAudioContext()
        if (!audioContext) {
            return
        }

        playTone(audioContext, 523, 0.12, 0, 'triangle')
        playTone(audioContext, 659, 0.12, 0.11, 'triangle')
        playTone(audioContext, 784, 0.16, 0.22, 'triangle')
    }

    useEffect(() => {
        setDeck(buildDeck(activeTheme, settings.boardSize))
        setFlippedCards([])
        setMoves(0)
        setCurrentPlayer(settings.playerCount === 2 ? settings.player : 'blue')
        setScores({ blue: 0, orange: 0 })
        setIsResolvingTurn(false)
        hasPlayedWinSoundRef.current = false
    }, [activeTheme, settings.boardSize, settings.player, settings.playerCount])

    useEffect(() => {
        if (hasWon && !hasPlayedWinSoundRef.current) {
            playWinSound()
            hasPlayedWinSoundRef.current = true
        }
    }, [hasWon])

    useEffect(() => {
        if (flippedCards.length !== 2) {
            return
        }

        setIsResolvingTurn(true)

        const [firstUid, secondUid] = flippedCards
        const firstCard = deck.find((card) => card.uid === firstUid)
        const secondCard = deck.find((card) => card.uid === secondUid)

        if (!firstCard || !secondCard) {
            setFlippedCards([])
            setIsResolvingTurn(false)
            return
        }

        if (firstCard.pairId === secondCard.pairId) {
            playMatchSound()
            setDeck((previousDeck) =>
                previousDeck.map((card) =>
                    card.pairId === firstCard.pairId ? { ...card, matched: true } : card,
                ),
            )
            setScores((previousScores) => ({
                ...previousScores,
                [currentPlayer]: previousScores[currentPlayer] + 1,
            }))
            setFlippedCards([])
            setIsResolvingTurn(false)
            return
        }

        playMissSound()

        const timeout = window.setTimeout(() => {
            setFlippedCards([])
            if (isMultiplayer) {
                setCurrentPlayer((previousPlayer) => (previousPlayer === 'blue' ? 'orange' : 'blue'))
            }
            setIsResolvingTurn(false)
        }, 900)

        return () => window.clearTimeout(timeout)
    }, [deck, flippedCards, currentPlayer, isMultiplayer])

    function startNewGame() {
        setDeck(buildDeck(activeTheme, settings.boardSize))
        setFlippedCards([])
        setMoves(0)
        setCurrentPlayer(settings.playerCount === 2 ? settings.player : 'blue')
        setScores({ blue: 0, orange: 0 })
        setIsResolvingTurn(false)
        hasPlayedWinSoundRef.current = false
    }

    function flipCard(card: MemoryCard) {
        if (card.matched || flippedCards.includes(card.uid) || flippedCards.length === 2 || isResolvingTurn) {
            return
        }

        playFlipSound()
        setFlippedCards((previous) => [...previous, card.uid])

        if (flippedCards.length === 1) {
            setMoves((previous) => previous + 1)
        }
    }

    return (
        <main className="app" style={{ '--theme-accent': activeTheme.accent } as CSSProperties}>
            <section className="app__panel">
                <p className="app__kicker">Memory Game</p>
                <h1>React + TypeScript + SCSS</h1>
                <p className="app__subtitle">Theme: {activeTheme.label} · Board: {settings.boardSize} cards</p>

                <div className="app__scoreboard" aria-label="Scoreboard">
                    <div className="app__turn-row">
                        {isMultiplayer ? (
                            <p className="app__turn">
                                Current player:
                                <span className={`app__turn-player app__turn-player--${currentPlayer}`}>
                                    <span className="app__turn-arrow" aria-hidden="true">
                                        ►
                                    </span>
                                    {currentPlayer === 'blue' ? 'Blue' : 'Orange'}
                                </span>
                            </p>
                        ) : (
                            <p className="app__turn">Mode: Single player</p>
                        )}
                        <p className="app__round">Round: {currentRound}</p>
                    </div>
                    <div className="app__scores">
                        {isMultiplayer ? (
                            <>
                                <span className={`score-chip ${currentPlayer === 'blue' ? 'is-active' : ''}`}>Blue: {scores.blue}</span>
                                <span className={`score-chip ${currentPlayer === 'orange' ? 'is-active' : ''}`}>Orange: {scores.orange}</span>
                            </>
                        ) : (
                            <span className="score-chip is-active">Pairs: {scores.blue}</span>
                        )}
                    </div>
                </div>

                <div className="app__actions">
                    <button type="button" className="button button--ghost" onClick={() => navigate('/settings')}>
                        Settings
                    </button>
                    <button
                        type="button"
                        className="button button--ghost button--sound"
                        onClick={() => onSoundChange(!settings.soundEnabled)}
                        aria-label={settings.soundEnabled ? 'Turn sound off' : 'Turn sound on'}
                    >
                        {settings.soundEnabled ? <LuVolume2 /> : <LuVolumeX />}
                        {settings.soundEnabled ? 'Sound on' : 'Sound off'}
                    </button>
                    <button type="button" className="button button--primary" onClick={startNewGame}>
                        New Game
                    </button>
                    <p className="app__stats">Moves: {moves}</p>
                </div>

                {hasWon ? <p className="app__win">{winnerText}</p> : null}
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
