import type { BoardSize, MemoryCard, Theme } from '../interfaces/game.interface'

/**
 * Returns a shuffled copy of the provided array using Fisher-Yates.
 */
export function shuffle<T>(items: T[]): T[] {
    const result = [...items]

    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1))
            ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
    }

    return result
}

/**
 * Checks whether a theme has enough unique cards for the selected board size.
 */
export function isBoardSizeAvailable(theme: Theme, boardSize: BoardSize): boolean {
    return theme.cards.length >= boardSize / 2
}

/**
 * Builds a shuffled deck by duplicating the selected themed card set into pairs.
 */
export function buildDeck(theme: Theme, boardSize: BoardSize): MemoryCard[] {
    const pairCount = boardSize / 2
    const selected = shuffle(theme.cards).slice(0, pairCount)
    const duplicated = selected.flatMap((image, index) => {
        const pairId = `${theme.id}-${index}`

        return [
            { uid: `${pairId}-a`, pairId, image, matched: false },
            { uid: `${pairId}-b`, pairId, image, matched: false },
        ]
    })

    return shuffle(duplicated)
}

/**
 * Maps board size to grid column count.
 */
export function getBoardColumns(boardSize: BoardSize): number {
    if (boardSize === 16) {
        return 4
    }

    return 6
}
