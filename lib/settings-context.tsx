"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { GameMode } from "./game-types"

// Scores from the old fixed-difficulty modes are not comparable with the
// adaptive ones, so best scores start fresh under a new key.
const BEST_SCORES_KEY = "washiway-best-scores-v2"

interface SettingsContextValue {
  getBestScore: (mode: GameMode) => number
  updateBestScore: (mode: GameMode, score: number) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [bestScores, setBestScores] = useState<Partial<Record<GameMode, number>>>(() => {
    if (typeof window === "undefined") return {}
    try {
      const saved = localStorage.getItem(BEST_SCORES_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const getBestScore = (mode: GameMode): number => bestScores[mode] ?? 0

  const updateBestScore = (mode: GameMode, score: number) => {
    setBestScores((prev) => {
      if (score <= (prev[mode] ?? 0)) return prev
      const updated = { ...prev, [mode]: score }
      try {
        localStorage.setItem(BEST_SCORES_KEY, JSON.stringify(updated))
      } catch {
        // Storage unavailable: the best score lasts for this visit only.
      }
      return updated
    })
  }

  return <SettingsContext.Provider value={{ getBestScore, updateBestScore }}>{children}</SettingsContext.Provider>
}
