import { useMemo } from 'react'
import { HiOutlinePaintBrush } from 'react-icons/hi2'
import { LuUsers } from 'react-icons/lu'
import { PiCardsThreeLight } from 'react-icons/pi'
import { useNavigate } from 'react-router-dom'
import { SettingsSection } from '../components/SettingsSection'
import { ThemePreview } from '../components/ThemePreview'
import { getThemeById, themes } from '../data/themes'
import type { BoardSize, GameSettings, PlayerId, ThemeId } from '../interfaces/game.interface'
import { isBoardSizeAvailable } from '../utils/game'

type SettingsPageProps = {
    settings: GameSettings
    onThemeChange: (themeId: ThemeId) => void
    onPlayerChange: (player: PlayerId) => void
    onBoardSizeChange: (boardSize: BoardSize) => void
}

const boardSizes: BoardSize[] = [16, 24, 36]
const players: PlayerId[] = ['blue', 'orange']

export function SettingsPage({ settings, onThemeChange, onPlayerChange, onBoardSizeChange }: SettingsPageProps) {
    const navigate = useNavigate()
    const activeTheme = useMemo(() => getThemeById(settings.themeId), [settings.themeId])

    return (
        <main className="settings-page">
            <section className="settings-layout">
                <div className="settings-panel">
                    <div className="settings-header">
                        <h1 className="settings-header__title">Settings</h1>
                        <span className="settings-header__line" aria-hidden="true" />
                    </div>

                    <SettingsSection icon={HiOutlinePaintBrush} title="Game themes">
                        {themes.map((theme) => (
                            <label key={theme.id} className="settings-option">
                                <input
                                    type="radio"
                                    name="theme"
                                    value={theme.id}
                                    checked={settings.themeId === theme.id}
                                    onChange={() => onThemeChange(theme.id)}
                                />
                                <span>{theme.label}</span>
                            </label>
                        ))}
                    </SettingsSection>

                    <SettingsSection icon={LuUsers} title="Choose player">
                        {players.map((player) => (
                            <label key={player} className="settings-option">
                                <input
                                    type="radio"
                                    name="player"
                                    value={player}
                                    checked={settings.player === player}
                                    onChange={() => onPlayerChange(player)}
                                />
                                <span>{player === 'blue' ? 'Blue' : 'Orange'}</span>
                            </label>
                        ))}
                    </SettingsSection>

                    <SettingsSection icon={PiCardsThreeLight} title="Board size">
                        {boardSizes.map((boardSize) => {
                            const disabled = !isBoardSizeAvailable(activeTheme, boardSize)

                            return (
                                <label key={boardSize} className={`settings-option ${disabled ? 'is-disabled' : ''}`}>
                                    <input
                                        type="radio"
                                        name="board-size"
                                        value={boardSize}
                                        checked={settings.boardSize === boardSize}
                                        onChange={() => onBoardSizeChange(boardSize)}
                                        disabled={disabled}
                                    />
                                    <span>{boardSize} cards</span>
                                </label>
                            )
                        })}
                    </SettingsSection>
                </div>

                <ThemePreview theme={activeTheme} player={settings.player} boardSize={settings.boardSize} onStart={() => navigate('/game')} />
            </section>
        </main>
    )
}
