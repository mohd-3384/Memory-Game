import type { BoardSize, PlayerId, Theme } from '../interfaces/game.interface'
import { LuSquarePlay } from 'react-icons/lu'

type ThemePreviewProps = {
    theme: Theme
    player: PlayerId
    boardSize: BoardSize
    onStart: () => void
}

export function ThemePreview({ theme, player, boardSize, onStart }: ThemePreviewProps) {
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
                <span>{player === 'blue' ? 'Blue' : 'Orange'}</span>
                <span>{boardSize} cards</span>
                <button type="button" className="preview-footer__start" onClick={onStart}>
                    <LuSquarePlay aria-hidden="true" />
                    Start
                </button>
            </div>
        </div>
    )
}
