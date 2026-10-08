"use client"

import { useState, useCallback } from "react"
import { SplashScreen } from "./game/splash-screen"
import { StartScreen } from "./game/start-screen"
import { GameScreen } from "./game/game-screen"
import { ResultsScreen } from "./game/results-screen"
import { SettingsProvider } from "@/lib/settings-context"
import { AudioProvider } from "@/lib/audio-context"
import { I18nProvider } from "@/lib/i18n-context"
import { ProgressionProvider } from "@/lib/progression-context"
import { ThemeProvider } from "@/lib/theme-context"
import { type SessionResult, SkillProvider, useSkills } from "@/lib/skill-context"
import type { GameMode, GameState, GameStats } from "@/lib/game-types"

function MathGameInner() {
  const [gameState, setGameState] = useState<GameState>("splash")
  const [selectedMode, setSelectedMode] = useState<GameMode>("quick")
  const [timed, setTimed] = useState(true)
  // Bumped on every start so "play again" remounts a fresh game.
  const [round, setRound] = useState(0)
  const [stats, setStats] = useState<GameStats | null>(null)
  const { commitSession } = useSkills()

  const startGame = useCallback((mode: GameMode, isTimed: boolean) => {
    setSelectedMode(mode)
    setTimed(isTimed)
    setRound((r) => r + 1)
    setGameState("playing")
  }, [])

  const endGame = useCallback(
    (finalStats: GameStats, session: SessionResult) => {
      commitSession(session)
      setStats(finalStats)
      setGameState("results")
    },
    [commitSession],
  )

  return (
    <div className="flex min-h-dvh flex-col">
      {gameState === "splash" && <SplashScreen onStart={() => setGameState("menu")} />}
      {gameState === "menu" && <StartScreen onStartGame={startGame} />}
      {gameState === "playing" && <GameScreen key={round} mode={selectedMode} timed={timed} onGameEnd={endGame} />}
      {gameState === "results" && stats && (
        <ResultsScreen
          stats={stats}
          mode={selectedMode}
          onPlayAgain={() => startGame(selectedMode, timed)}
          onBackToMenu={() => setGameState("menu")}
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
          <SkillProvider>
            <ProgressionProvider>
              <ThemeProvider>
                <MathGameInner />
              </ThemeProvider>
            </ProgressionProvider>
          </SkillProvider>
        </SettingsProvider>
      </AudioProvider>
    </I18nProvider>
  )
}
