import type { BoardSize, MemoryCard, Theme } from '../interfaces/game.interface'

export function shuffle<T>(items: T[]): T[] {
    const result = [...items]

    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1))
            ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
    }

    return result
}

export function isBoardSizeAvailable(theme: Theme, boardSize: BoardSize): boolean {
    return theme.cards.length >= boardSize / 2
}

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

export function getBoardColumns(boardSize: BoardSize): number {
    if (boardSize === 16) {
        return 4
    }

    return 6
}
