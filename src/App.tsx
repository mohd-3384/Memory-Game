import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { BoardSize, GameSettings, PlayerId, ThemeId } from './interfaces/game.interface'
import { getThemeById } from './data/themes'
import { LandingPage } from './pages/LandingPage'
import { SettingsPage } from './pages/SettingsPage'
import { GamePage } from './pages/GamePage'
import './App.scss'

function App() {
  const [settings, setSettings] = useState<GameSettings>({
    themeId: 'code-vibes',
    player: 'blue',
    boardSize: 16,
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

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/settings"
        element={
          <SettingsPage
            settings={settings}
            onThemeChange={handleThemeChange}
            onPlayerChange={handlePlayerChange}
            onBoardSizeChange={(boardSize: BoardSize) =>
              setSettings((currentSettings) => ({ ...currentSettings, boardSize }))
            }
          />
        }
      />
      <Route path="/game" element={<GamePage settings={settings} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
