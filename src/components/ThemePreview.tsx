import type { BoardSize, PlayerId, Theme } from '../interfaces/game.interface'

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
                <div className="preview-stage__toolbar">
                    <span className="preview-stage__badge preview-stage__badge--blue">Blue</span>
                    <span className="preview-stage__badge preview-stage__badge--orange">Orange</span>
                    <span className="preview-stage__status">Current player: {player}</span>
                    <button type="button" className="preview-stage__exit">
                        Exit game
                    </button>
                </div>

                <div className="preview-stage__cards">
                    <img className="preview-stage__card preview-stage__card--front" src={theme.front} alt="Theme front card" />
                    <img className="preview-stage__card preview-stage__card--back" src={sampleCard} alt="Theme preview card" />
                </div>
            </div>

            <div className="preview-footer">
                <span>Game theme</span>
                <span>Player</span>
                <span>Board size</span>
                <button type="button" className="preview-footer__start" onClick={onStart}>
                    Start
                </button>
            </div>

            <p className="preview-note">Selected theme: {theme.label} · {boardSize} cards</p>
        </div>
    )
}
