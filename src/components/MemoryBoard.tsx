import type { CSSProperties } from 'react'
import type { MemoryCard } from '../interfaces/game.interface'

type MemoryBoardProps = {
    cards: MemoryCard[]
    themeFront: string
    flippedCards: string[]
    boardColumns: number
    onFlip: (card: MemoryCard) => void
}

export function MemoryBoard({ cards, themeFront, flippedCards, boardColumns, onFlip }: MemoryBoardProps) {
    return (
        <section
            className="board"
            aria-label="Memory Spielfeld"
            style={{ '--board-columns': String(boardColumns) } as CSSProperties}
        >
            {cards.map((card) => {
                const isFlipped = card.matched || flippedCards.includes(card.uid)

                return (
                    <button
                        key={card.uid}
                        type="button"
                        className={`memory-card ${isFlipped ? 'is-flipped' : ''}`}
                        onClick={() => onFlip(card)}
                        aria-label="Memory Karte"
                    >
                        <span className="memory-card__inner">
                            <img className="memory-card__face memory-card__face--front" src={themeFront} alt="Kartenrueckseite" />
                            <img className="memory-card__face memory-card__face--back" src={card.image} alt="Memory Motiv" />
                        </span>
                    </button>
                )
            })}
        </section>
    )
}
