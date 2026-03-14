import type { BoardSize, MemoryCard, PlayerId, ThemeId } from './game.interface'

export type OnlineRoomStatus = 'waiting' | 'playing' | 'finished'

export interface OnlineRoomState {
    roomId: string
    settings: {
        themeId: ThemeId
        boardSize: BoardSize
    }
    status: OnlineRoomStatus
    deck: MemoryCard[]
    flippedCards: string[]
    moves: number
    currentPlayer: PlayerId
    scores: Record<PlayerId, number>
    hasWon: boolean
    playersConnected: Record<PlayerId, boolean>
    rematchVotes: Record<PlayerId, boolean>
    themeFront: string
}

export interface JoinedRoomPayload {
    roomId: string
    playerId: PlayerId
    playerKey: string
}
