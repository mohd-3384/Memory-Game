import type { BoardSize, PlayerCount, Theme } from '../interfaces/game.interface'
import { LuSquarePlay } from 'react-icons/lu'

type ThemePreviewProps = {
    theme: Theme
    playerCount: PlayerCount
    boardSize: BoardSize
    onStart: () => void
}

export function ThemePreview({ theme, playerCount, boardSize, onStart }: ThemePreviewProps) {
    const sampleCard = theme.cards[0]

    return (
        <div className="preview-panel">
            <div className="preview-stage">
                <div className="preview-stage__cards">
                    <img className="preview-stage__card preview-stage__card--front" src={theme.front} alt="Theme front card" />
                    <img className="preview-stage__card preview-stage__card--back" src={sampleCard} alt="Theme preview card" />
                </div>
            </div>

            <div className="preview-footer">
                <span>{theme.label}</span>
                <span>{playerCount === 1 ? '1 player' : '2 players'}</span>
                <span>{boardSize} cards</span>
                <button type="button" className="preview-footer__start" onClick={onStart}>
                    <LuSquarePlay aria-hidden="true" />
                    Start
                </button>
            </div>
        </div>
    )
}
