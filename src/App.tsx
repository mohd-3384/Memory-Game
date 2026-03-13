import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { IoGameControllerOutline } from 'react-icons/io5'
import './App.scss'

type ThemeId = 'code-vibes' | 'DA' | 'food' | 'games'

type Theme = {
  id: ThemeId
  label: string
  front: string
  cards: string[]
  accent: string
}

type MemoryCard = {
  uid: string
  pairId: string
  image: string
  matched: boolean
}

type View = 'landing' | 'game'

const CARD_PAIRS = 8
const imageModules = import.meta.glob('./assets/images/**/*.svg', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function imageUrl(path: string): string {
  const modulePath = `./assets/images/${path}`
  const fileUrl = imageModules[modulePath]

  if (!fileUrl) {
    throw new Error(`Missing image asset: ${path}`)
  }

  return fileUrl
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function collectThemeCards(folder: string, baseName: string): string[] {
  const escapedBaseName = escapeRegex(baseName)
  const filePattern = new RegExp(
    `^\\./assets/images/${folder}/${escapedBaseName}(?: \\((\\d+)\\))?\\.svg$`,
  )

  const sortedModuleEntries = Object.entries(imageModules)
    .map(([modulePath, fileUrl]) => {
      const match = modulePath.match(filePattern)
      if (!match) {
        return null
      }

      const index = match[1] ? Number(match[1]) : 0
      return { index, fileUrl }
    })
    .filter((entry): entry is { index: number; fileUrl: string } => entry !== null)
    .sort((a, b) => a.index - b.index)

  const cards = sortedModuleEntries.map((entry) => entry.fileUrl)

  if (cards.length === 0) {
    throw new Error(`Missing theme card assets for folder: ${folder}`)
  }

  return cards
}

const themes: Theme[] = [
  {
    id: 'code-vibes',
    label: 'Code Vibes',
    front: imageUrl('code-vibes/Front.svg'),
    cards: collectThemeCards('code-vibes', 'Property 1=Component 22'),
    accent: '#00bcd4',
  },
  {
    id: 'DA',
    label: 'Developer Akademie',
    front: imageUrl('DA/Property 1=Component 1.svg'),
    cards: collectThemeCards('DA', 'Property 1=Component 2'),
    accent: '#ff2f92',
  },
  {
    id: 'food',
    label: 'Food Theme',
    front: imageUrl('food/frond.svg'),
    cards: collectThemeCards('food', 'Property 1=Component 3'),
    accent: '#ff8f1f',
  },
  {
    id: 'games',
    label: 'Games Theme',
    front: imageUrl('games/Property 1=Component 1.svg'),
    cards: collectThemeCards('games', 'Property 1=Component 2'),
    accent: '#6ef5b0',
  },
]

function shuffle<T>(items: T[]): T[] {
  const result = [...items]

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

function buildDeck(theme: Theme): MemoryCard[] {
  const selected = shuffle(theme.cards).slice(0, CARD_PAIRS)
  const duplicated = selected.flatMap((image, index) => {
    const pairId = `${theme.id}-${index}`
    return [
      { uid: `${pairId}-a`, pairId, image, matched: false },
      { uid: `${pairId}-b`, pairId, image, matched: false },
    ]
  })

  return shuffle(duplicated)
}

function App() {
  const [view, setView] = useState<View>('landing')
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>('code-vibes')
  const activeTheme = useMemo(
    () => themes.find((theme) => theme.id === activeThemeId) ?? themes[0],
    [activeThemeId],
  )

  const [deck, setDeck] = useState<MemoryCard[]>(() => buildDeck(activeTheme))
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [moves, setMoves] = useState(0)

  const hasWon = deck.length > 0 && deck.every((card) => card.matched)

  useEffect(() => {
    setDeck(buildDeck(activeTheme))
    setFlippedCards([])
    setMoves(0)
  }, [activeTheme])

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
    setDeck(buildDeck(activeTheme))
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

  function startPlaying() {
    startNewGame()
    setView('game')
  }

  if (view === 'landing') {
    return (
      <main className="landing">
        <div className="landing__ornament" aria-hidden="true">
          <IoGameControllerOutline />
        </div>

        <section className="landing__content">
          <p className="landing__kicker">It's play time.</p>
          <h1 className="landing__title">Ready to play?</h1>

          <button type="button" className="play-button" onClick={startPlaying}>
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

  return (
    <main className="app" style={{ '--theme-accent': activeTheme.accent } as CSSProperties}>
      <section className="app__panel">
        <p className="app__kicker">Memory Spiel</p>
        <h1>React + TypeScript + SCSS</h1>
        <p className="app__subtitle">Wähle ein Theme, decke Paare auf und gewinne in möglichst wenigen Zügen.</p>

        <div className="theme-picker" role="radiogroup" aria-label="Theme Auswahl">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-picker__button ${activeThemeId === theme.id ? 'is-active' : ''}`}
              onClick={() => setActiveThemeId(theme.id)}
              role="radio"
              aria-checked={activeThemeId === theme.id}
            >
              {theme.label}
            </button>
          ))}
        </div>

        <div className="app__actions">
          <button type="button" className="button button--ghost" onClick={() => setView('landing')}>
            Startseite
          </button>
          <button type="button" className="button button--primary" onClick={startNewGame}>
            Neues Spiel
          </button>
          <p className="app__stats">Züge: {moves}</p>
        </div>

        {hasWon ? <p className="app__win">Stark! Du hast alle Paare gefunden.</p> : null}
      </section>

      <section className="board" aria-label="Memory Spielfeld">
        {deck.map((card) => {
          const isFlipped = card.matched || flippedCards.includes(card.uid)

          return (
            <button
              key={card.uid}
              type="button"
              className={`memory-card ${isFlipped ? 'is-flipped' : ''}`}
              onClick={() => flipCard(card)}
              aria-label="Memory Karte"
            >
              <span className="memory-card__inner">
                <img className="memory-card__face memory-card__face--front" src={activeTheme.front} alt="Kartenrueckseite" />
                <img className="memory-card__face memory-card__face--back" src={card.image} alt="Memory Motiv" />
              </span>
            </button>
          )
        })}
      </section>
    </main>
  )
}

export default App
