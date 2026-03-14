import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { AppLanguage, BoardSize, GameSettings, PlayerCount, PlayerId, ThemeId } from './interfaces/game.interface'
import { getThemeById } from './data/themes'
import { LandingPage } from './pages/LandingPage'
import { SettingsPage } from './pages/SettingsPage'
import { GamePage } from './pages/GamePage'
import { OnlineLobbyPage } from './pages/OnlineLobbyPage'
import { OnlineGamePage } from './pages/OnlineGamePage'
import './App.scss'

function App() {
  const [settings, setSettings] = useState<GameSettings>({
    themeId: 'code-vibes',
    playerCount: 1,
    player: 'blue',
    boardSize: 16,
    soundEnabled: true,
    language: 'en',
  })

  function handleThemeChange(themeId: ThemeId) {
    const theme = getThemeById(themeId)

    setSettings((currentSettings) => ({
      ...currentSettings,
      themeId,
      boardSize: theme.cards.length >= currentSettings.boardSize / 2 ? currentSettings.boardSize : 24,
    }))
  }

  function handlePlayerChange(player: PlayerId) {
    setSettings((currentSettings) => ({ ...currentSettings, player }))
  }

  function handlePlayerCountChange(playerCount: PlayerCount) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      playerCount,
      player: playerCount === 1 ? 'blue' : currentSettings.player,
    }))
  }

  function handleLanguageChange(language: AppLanguage) {
    setSettings((currentSettings) => ({ ...currentSettings, language }))
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage language={settings.language} onLanguageChange={handleLanguageChange} />}
      />
      <Route
        path="/settings"
        element={
          <SettingsPage
            settings={settings}
            onLanguageChange={handleLanguageChange}
            onThemeChange={handleThemeChange}
            onPlayerCountChange={handlePlayerCountChange}
            onPlayerChange={handlePlayerChange}
            onBoardSizeChange={(boardSize: BoardSize) =>
              setSettings((currentSettings) => ({ ...currentSettings, boardSize }))
            }
            onSoundChange={(soundEnabled: boolean) =>
              setSettings((currentSettings) => ({ ...currentSettings, soundEnabled }))
            }
          />
        }
      />
      <Route
        path="/game"
        element={
          <GamePage
            settings={settings}
            onSoundChange={(soundEnabled: boolean) =>
              setSettings((currentSettings) => ({ ...currentSettings, soundEnabled }))
            }
          />
        }
      />
      <Route path="/online" element={<OnlineLobbyPage settings={settings} />} />
      <Route
        path="/online-game/:roomId"
        element={
          <OnlineGamePage
            settings={settings}
            onSoundChange={(soundEnabled: boolean) =>
              setSettings((currentSettings) => ({ ...currentSettings, soundEnabled }))
            }
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
