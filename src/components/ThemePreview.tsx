import type { BoardSize, PlayerCount, Theme } from '../interfaces/game.interface'
import { LuSquarePlay } from 'react-icons/lu'
import type { AppLanguage } from '../interfaces/game.interface'
import { getTranslations } from '../data/translations'

type ThemePreviewProps = {
    theme: Theme
    language: AppLanguage
    playerCount: PlayerCount
    boardSize: BoardSize
    onStart: () => void
}

/**
 * Shows a compact visual preview of the selected setup and starts the game flow.
 */
export function ThemePreview({ theme, language, playerCount, boardSize, onStart }: ThemePreviewProps) {
    const sampleCard = theme.cards[0]
    const text = getTranslations(language)

    return (
        <div className="preview-panel">
            <div className="preview-stage">
                <div className="preview-stage__cards">
                    <img className="preview-stage__card preview-stage__card--front" src={theme.front} alt={text.boardCardBackAlt} />
                    <img className="preview-stage__card preview-stage__card--back" src={sampleCard} alt={text.boardCardFrontAlt} />
                </div>
            </div>

            <div className="preview-footer">
                <span>{theme.label}</span>
                <span>{playerCount === 1 ? `1 ${text.previewPlayerSingular}` : `2 ${text.previewPlayerPlural}`}</span>
                <span>{boardSize} {text.settingsCards}</span>
                <button type="button" className="preview-footer__start" onClick={onStart}>
                    <LuSquarePlay aria-hidden="true" />
                    {text.previewStart}
                </button>
            </div>
        </div>
    )
}
