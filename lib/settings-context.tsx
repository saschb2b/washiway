"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { GameMode } from "./game-types"

type BestScoreKey = `${GameMode}-${number}`

interface SettingsContextValue {
  baseDifficulty: number // 1-5 scale
  setBaseDifficulty: (d: number) => void
  getBestScore: (mode: GameMode, difficulty: number) => number
  updateBestScore: (mode: GameMode, difficulty: number, score: number) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [baseDifficulty, setBaseDifficulty] = useState(2)
  const [bestScores, setBestScores] = useState<Record<BestScoreKey, number>>({})

  // Load best scores from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("washiway-best-scores")
    if (saved) {
      try {
        setBestScores(JSON.parse(saved))
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  const getBestScore = (mode: GameMode, difficulty: number): number => {
    const key: BestScoreKey = `${mode}-${difficulty}`
    return bestScores[key] || 0
  }

  const updateBestScore = (mode: GameMode, difficulty: number, score: number) => {
    const key: BestScoreKey = `${mode}-${difficulty}`
    setBestScores((prev) => {
      if (score > (prev[key] || 0)) {
        const updated = { ...prev, [key]: score }
        localStorage.setItem("washiway-best-scores", JSON.stringify(updated))
        return updated
      }
      return prev
    })
  }

  return (
    <SettingsContext.Provider value={{ baseDifficulty, setBaseDifficulty, getBestScore, updateBestScore }}>
      {children}
    </SettingsContext.Provider>
  )
}
