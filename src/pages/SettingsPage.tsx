import { useMemo } from 'react'
import { HiOutlinePaintBrush } from 'react-icons/hi2'
import { LuVolume2 } from 'react-icons/lu'
import { LuUsers } from 'react-icons/lu'
import { LuUserRound } from 'react-icons/lu'
import { PiCardsThreeLight } from 'react-icons/pi'
import { useNavigate } from 'react-router-dom'
import { SettingsSection } from '../components/SettingsSection'
import { ThemePreview } from '../components/ThemePreview'
import { getThemeById, themes } from '../data/themes'
import { getTranslations } from '../data/translations'
import type { BoardSize, GameSettings, PlayerCount, PlayerId, ThemeId } from '../interfaces/game.interface'
import { isBoardSizeAvailable } from '../utils/game'

type SettingsPageProps = {
    settings: GameSettings
    onLanguageChange: (language: GameSettings['language']) => void
    onThemeChange: (themeId: ThemeId) => void
    onPlayerCountChange: (playerCount: PlayerCount) => void
    onPlayerChange: (player: PlayerId) => void
    onBoardSizeChange: (boardSize: BoardSize) => void
    onSoundChange: (soundEnabled: boolean) => void
}

const boardSizes: BoardSize[] = [16, 24, 36]
const players: PlayerId[] = ['blue', 'orange']
const playerCounts: PlayerCount[] = [1, 2]

export function SettingsPage({
    settings,
    onLanguageChange,
    onThemeChange,
    onPlayerCountChange,
    onPlayerChange,
    onBoardSizeChange,
    onSoundChange,
}: SettingsPageProps) {
    const navigate = useNavigate()
    const activeTheme = useMemo(() => getThemeById(settings.themeId), [settings.themeId])
    const text = getTranslations(settings.language)

    return (
        <main className="settings-page">
            <section className="settings-layout">
                <div className="settings-panel">
                    <div className="settings-header">
                        <h1 className="settings-header__title">{text.settingsTitle}</h1>
                        <span className="settings-header__line" aria-hidden="true" />
                    </div>

                    <SettingsSection icon={LuUserRound} title={text.settingsLanguage}>
                        <label className={`settings-option ${settings.language === 'de' ? 'is-selected' : ''}`}>
                            <input
                                type="radio"
                                name="language"
                                value="de"
                                checked={settings.language === 'de'}
                                onChange={() => onLanguageChange('de')}
                            />
                            <span>{text.languageGerman}</span>
                        </label>

                        <label className={`settings-option ${settings.language === 'en' ? 'is-selected' : ''}`}>
                            <input
                                type="radio"
                                name="language"
                                value="en"
                                checked={settings.language === 'en'}
                                onChange={() => onLanguageChange('en')}
                            />
                            <span>{text.languageEnglish}</span>
                        </label>
                    </SettingsSection>

                    <SettingsSection icon={HiOutlinePaintBrush} title={text.settingsThemes}>
                        {themes.map((theme) => (
                            <label
                                key={theme.id}
                                className={`settings-option ${settings.themeId === theme.id ? 'is-selected' : ''}`}
                            >
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

                    <SettingsSection icon={LuUsers} title={text.settingsPlayerCount}>
                        {playerCounts.map((playerCount) => (
                            <label
                                key={playerCount}
                                className={`settings-option ${settings.playerCount === playerCount ? 'is-selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="player-count"
                                    value={playerCount}
                                    checked={settings.playerCount === playerCount}
                                    onChange={() => onPlayerCountChange(playerCount)}
                                />
                                <span>{playerCount === 1 ? text.settingsOnePlayer : text.settingsTwoPlayersOnline}</span>
                            </label>
                        ))}
                    </SettingsSection>

                    {settings.playerCount === 2 ? (
                        <SettingsSection icon={LuUserRound} title={text.settingsStartingPlayer}>
                            {players.map((player) => (
                                <label
                                    key={player}
                                    className={`settings-option ${settings.player === player ? 'is-selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="player"
                                        value={player}
                                        checked={settings.player === player}
                                        onChange={() => onPlayerChange(player)}
                                    />
                                    <span>{player === 'blue' ? text.gameBlue : text.gameOrange}</span>
                                </label>
                            ))}
                        </SettingsSection>
                    ) : null}

                    <SettingsSection icon={PiCardsThreeLight} title={text.settingsBoardSize}>
                        {boardSizes.map((boardSize) => {
                            const disabled = !isBoardSizeAvailable(activeTheme, boardSize)

                            return (
                                <label
                                    key={boardSize}
                                    className={`settings-option ${disabled ? 'is-disabled' : ''} ${settings.boardSize === boardSize ? 'is-selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="board-size"
                                        value={boardSize}
                                        checked={settings.boardSize === boardSize}
                                        onChange={() => onBoardSizeChange(boardSize)}
                                        disabled={disabled}
                                    />
                                    <span>{boardSize} {text.settingsCards}</span>
                                </label>
                            )
                        })}
                    </SettingsSection>

                    <SettingsSection icon={LuVolume2} title={text.settingsSoundEffects}>
                        <label className={`settings-option ${settings.soundEnabled ? 'is-selected' : ''}`}>
                            <input
                                type="radio"
                                name="sound"
                                value="on"
                                checked={settings.soundEnabled}
                                onChange={() => onSoundChange(true)}
                            />
                            <span>{text.settingsOn}</span>
                        </label>

                        <label className={`settings-option ${!settings.soundEnabled ? 'is-selected' : ''}`}>
                            <input
                                type="radio"
                                name="sound"
                                value="off"
                                checked={!settings.soundEnabled}
                                onChange={() => onSoundChange(false)}
                            />
                            <span>{text.settingsOff}</span>
                        </label>
                    </SettingsSection>
                </div>

                <ThemePreview
                    theme={activeTheme}
                    language={settings.language}
                    playerCount={settings.playerCount}
                    boardSize={settings.boardSize}
                    onStart={() => navigate(settings.playerCount === 2 ? '/online' : '/game')}
                />
            </section>
        </main>
    )
}
