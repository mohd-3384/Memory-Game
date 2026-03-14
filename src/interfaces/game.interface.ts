export type ThemeId = 'code-vibes' | 'DA' | 'food' | 'games'
export type PlayerId = 'blue' | 'orange'
export type PlayerCount = 1 | 2
export type BoardSize = 16 | 24 | 36

export interface Theme {
    id: ThemeId
    label: string
    front: string
    cards: string[]
    accent: string
}

export interface MemoryCard {
    uid: string
    pairId: string
    image: string
    matched: boolean
}

export interface GameSettings {
    themeId: ThemeId
    playerCount: PlayerCount
    player: PlayerId
    boardSize: BoardSize
    soundEnabled: boolean
}
