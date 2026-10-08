"use client"

import { useState, useCallback } from "react"
import { SplashScreen } from "./game/splash-screen"
import { StartScreen } from "./game/start-screen"
import { GameScreen } from "./game/game-screen"
import { ResultsScreen } from "./game/results-screen"
import { SettingsProvider, useSettings } from "@/lib/settings-context"
import { AudioProvider } from "@/lib/audio-context"
import { I18nProvider } from "@/lib/i18n-context"
import { ProgressionProvider } from "@/lib/progression-context"
import { ThemeProvider } from "@/lib/theme-context"
import type { GameMode, GameState, GameStats } from "@/lib/game-types"

function MathGameInner() {
  const [gameState, setGameState] = useState<GameState>("splash")
  const [selectedMode, setSelectedMode] = useState<GameMode>("truth")
  const [playedDifficulty, setPlayedDifficulty] = useState(2)
  const { baseDifficulty } = useSettings()
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    streak: 0,
    maxStreak: 0,
    correct: 0,
    incorrect: 0,
    avgTime: 0,
  })

  const startGame = useCallback(
    (mode: GameMode) => {
      setSelectedMode(mode)
      setPlayedDifficulty(baseDifficulty) // capture difficulty at game start
      setStats({
        score: 0,
        streak: 0,
        maxStreak: 0,
        correct: 0,
        incorrect: 0,
        avgTime: 0,
      })
      setGameState("playing")
    },
    [baseDifficulty],
  )

  const endGame = useCallback((finalStats: GameStats) => {
    setStats(finalStats)
    setGameState("results")
  }, [])

  const returnToMenu = useCallback(() => {
    setGameState("menu")
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      {gameState === "splash" && <SplashScreen onStart={() => setGameState("menu")} />}
      {gameState === "menu" && <StartScreen onStartGame={startGame} />}
      {gameState === "playing" && <GameScreen mode={selectedMode} onGameEnd={endGame} />}
      {gameState === "results" && (
        <ResultsScreen
          stats={stats}
          mode={selectedMode}
          difficulty={playedDifficulty}
          onPlayAgain={() => startGame(selectedMode)}
          onBackToMenu={returnToMenu}
        />
      )}
    </div>
  )
}

export function MathGame() {
  return (
    <I18nProvider>
      <AudioProvider>
        <SettingsProvider>
          <ProgressionProvider>
            <ThemeProvider>
              <MathGameInner />
            </ThemeProvider>
          </ProgressionProvider>
        </SettingsProvider>
      </AudioProvider>
    </I18nProvider>
  )
}
