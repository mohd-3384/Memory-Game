import type { CSSProperties } from 'react'
import type { MemoryCard } from '../interfaces/game.interface'
import { getTranslations } from '../data/translations'
import type { AppLanguage } from '../interfaces/game.interface'

type MemoryBoardProps = {
    cards: MemoryCard[]
    themeFront: string
    flippedCards: string[]
    boardColumns: number
    language: AppLanguage
    onFlip: (card: MemoryCard) => void
}

/**
 * Renders the interactive memory board and emits flip actions for selected cards.
 */
export function MemoryBoard({ cards, themeFront, flippedCards, boardColumns, language, onFlip }: MemoryBoardProps) {
    const text = getTranslations(language)

    return (
        <section
            className="board"
            aria-label={text.boardAriaLabel}
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
                        aria-label={text.boardCardAriaLabel}
                    >
                        <span className="memory-card__inner">
                            <img className="memory-card__face memory-card__face--front" src={themeFront} alt={text.boardCardBackAlt} />
                            <img className="memory-card__face memory-card__face--back" src={card.image} alt={text.boardCardFrontAlt} />
                        </span>
                    </button>
                )
            })}
        </section>
    )
}
