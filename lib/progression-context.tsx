"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { GameMode } from "./game-types"

export interface WashiRoll {
  id: string
  name: string
  nameDE: string
  pattern:
    | "pokeballs"
    | "cats"
    | "dogs"
    | "frogs"
    | "flowers"
    | "snowflakes"
    | "bees"
    | "leaves"
    | "music"
    | "stars"
    | "mint"
  colors: {
    primary: string
    secondary: string
    highlight: string
    muted: string
  }
  unlockRequirement: Achievement
}

export interface Achievement {
  id: string
  name: string
  nameDE: string
  description: string
  descriptionDE: string
  type: "totalAnswers" | "streak" | "accuracy" | "gamesPlayed" | "perfectRun" | "modeSpecific"
  target: number
  mode?: GameMode
}

export const WASHI_ROLLS: WashiRoll[] = [
  {
    id: "starter-mint",
    name: "Minty Fresh",
    nameDE: "Frische Minze",
    pattern: "mint",
    colors: {
      primary: "oklch(0.95 0.03 175)", // soft mint
      secondary: "oklch(0.70 0.08 175)", // deeper mint
      highlight: "oklch(0.90 0.06 175)", // mint highlight
      muted: "oklch(0.97 0.015 175)", // barely tinted cream
    },
    unlockRequirement: {
      id: "starter",
      name: "First Steps",
      nameDE: "Erste Schritte",
      description: "Play your first game",
      descriptionDE: "Spiele dein erstes Spiel",
      type: "gamesPlayed",
      target: 1,
    },
  },
  {
    id: "pokeball-red",
    name: "Pocket Balls",
    nameDE: "Taschenbälle",
    pattern: "pokeballs",
    colors: {
      primary: "oklch(0.94 0.04 25)",
      secondary: "oklch(0.65 0.20 25)",
      highlight: "oklch(0.85 0.15 25)",
      muted: "oklch(0.97 0.02 25)",
    },
    unlockRequirement: {
      id: "answers50",
      name: "Quick Thinker",
      nameDE: "Schnelldenker",
      description: "Answer 50 prompts total",
      descriptionDE: "Beantworte 50 Aufgaben insgesamt",
      type: "totalAnswers",
      target: 50,
    },
  },
  {
    id: "cute-cats",
    name: "Kitty Parade",
    nameDE: "Kätzchen-Parade",
    pattern: "cats",
    colors: {
      primary: "oklch(0.93 0.045 350)",
      secondary: "oklch(0.55 0.12 350)",
      highlight: "oklch(0.85 0.12 350)",
      muted: "oklch(0.96 0.02 350)",
    },
    unlockRequirement: {
      id: "streak10",
      name: "Streak Starter",
      nameDE: "Serien-Starter",
      description: "Reach a streak of 10",
      descriptionDE: "Erreiche eine Serie von 10",
      type: "streak",
      target: 10,
    },
  },
  {
    id: "happy-dogs",
    name: "Puppy Paws",
    nameDE: "Welpen-Pfoten",
    pattern: "dogs",
    colors: {
      primary: "oklch(0.93 0.04 55)",
      secondary: "oklch(0.55 0.10 45)",
      highlight: "oklch(0.86 0.14 55)",
      muted: "oklch(0.97 0.02 55)",
    },
    unlockRequirement: {
      id: "accuracy85",
      name: "Sharp Mind",
      nameDE: "Scharfer Verstand",
      description: "Get 85% accuracy in 3 runs",
      descriptionDE: "Erreiche 85% Genauigkeit in 3 Spielen",
      type: "accuracy",
      target: 3,
    },
  },
  {
    id: "froggy-friends",
    name: "Froggy Pond",
    nameDE: "Froschteich",
    pattern: "frogs",
    colors: {
      primary: "oklch(0.93 0.05 145)",
      secondary: "oklch(0.55 0.14 145)",
      highlight: "oklch(0.85 0.12 145)",
      muted: "oklch(0.96 0.02 145)",
    },
    unlockRequirement: {
      id: "streak25",
      name: "Streak Master",
      nameDE: "Serien-Meister",
      description: "Reach a streak of 25",
      descriptionDE: "Erreiche eine Serie von 25",
      type: "streak",
      target: 25,
    },
  },
  {
    id: "spring-flowers",
    name: "Flower Garden",
    nameDE: "Blumengarten",
    pattern: "flowers",
    colors: {
      primary: "oklch(0.94 0.04 320)",
      secondary: "oklch(0.70 0.12 320)",
      highlight: "oklch(0.85 0.12 320)",
      muted: "oklch(0.97 0.02 320)",
    },
    unlockRequirement: {
      id: "answers200",
      name: "Math Marathon",
      nameDE: "Mathe-Marathon",
      description: "Answer 200 prompts total",
      descriptionDE: "Beantworte 200 Aufgaben insgesamt",
      type: "totalAnswers",
      target: 200,
    },
  },
  {
    id: "winter-snow",
    name: "Snowflake Dream",
    nameDE: "Schneeflocken-Traum",
    pattern: "snowflakes",
    colors: {
      primary: "oklch(0.94 0.03 220)",
      secondary: "oklch(0.70 0.08 220)",
      highlight: "oklch(0.84 0.12 220)",
      muted: "oklch(0.97 0.01 220)",
    },
    unlockRequirement: {
      id: "perfectRun",
      name: "Perfectionist",
      nameDE: "Perfektionist",
      description: "Complete a run with 100% accuracy",
      descriptionDE: "Beende ein Spiel mit 100% Genauigkeit",
      type: "perfectRun",
      target: 1,
    },
  },
  {
    id: "busy-bees",
    name: "Busy Bees",
    nameDE: "Fleißige Bienen",
    pattern: "bees",
    colors: {
      primary: "oklch(0.95 0.06 90)",
      secondary: "oklch(0.45 0.10 70)",
      highlight: "oklch(0.88 0.14 90)",
      muted: "oklch(0.97 0.02 90)",
    },
    unlockRequirement: {
      id: "games20",
      name: "Dedicated Player",
      nameDE: "Fleißiger Spieler",
      description: "Play 20 games",
      descriptionDE: "Spiele 20 Spiele",
      type: "gamesPlayed",
      target: 20,
    },
  },
  {
    id: "autumn-leaves",
    name: "Autumn Breeze",
    nameDE: "Herbstwind",
    pattern: "leaves",
    colors: {
      primary: "oklch(0.93 0.05 45)",
      secondary: "oklch(0.60 0.14 30)",
      highlight: "oklch(0.85 0.12 45)",
      muted: "oklch(0.97 0.02 45)",
    },
    unlockRequirement: {
      id: "answers500",
      name: "Math Wizard",
      nameDE: "Mathe-Zauberer",
      description: "Answer 500 prompts total",
      descriptionDE: "Beantworte 500 Aufgaben insgesamt",
      type: "totalAnswers",
      target: 500,
    },
  },
  {
    id: "melody-notes",
    name: "Sweet Melody",
    nameDE: "Süße Melodie",
    pattern: "music",
    colors: {
      primary: "oklch(0.92 0.04 290)",
      secondary: "oklch(0.55 0.10 290)",
      highlight: "oklch(0.84 0.12 290)",
      muted: "oklch(0.96 0.02 290)",
    },
    unlockRequirement: {
      id: "streak50",
      name: "Unstoppable",
      nameDE: "Unaufhaltsam",
      description: "Reach a streak of 50",
      descriptionDE: "Erreiche eine Serie von 50",
      type: "streak",
      target: 50,
    },
  },
]

// All achievements (derived from rolls + extra)
export const ALL_ACHIEVEMENTS: Achievement[] = [
  ...WASHI_ROLLS.map((r) => r.unlockRequirement),
  {
    id: "allModes",
    name: "Explorer",
    nameDE: "Entdecker",
    description: "Play all game modes",
    descriptionDE: "Spiele alle Spielmodi",
    type: "gamesPlayed",
    target: 6,
  },
]

interface ProgressionStats {
  totalAnswers: number
  totalCorrect: number
  maxStreak: number
  gamesPlayed: number
  perfectRuns: number
  accurateRuns: number // runs with 85%+ accuracy
  modesPlayed: GameMode[]
}

interface ProgressionContextValue {
  // Stats
  stats: ProgressionStats

  // Swatches (currency/progress indicator)
  swatches: number

  // Unlocked rolls
  unlockedRolls: string[]

  // Currently selected roll
  selectedRoll: string
  setSelectedRoll: (id: string) => void

  // Get roll data
  getRoll: (id: string) => WashiRoll | undefined
  getSelectedRoll: () => WashiRoll

  // Achievement progress
  getAchievementProgress: (achievement: Achievement) => { current: number; target: number; complete: boolean }

  // Record game results
  recordGameResult: (
    mode: GameMode,
    correct: number,
    total: number,
    maxStreak: number,
  ) => {
    swatchesEarned: number
    newUnlocks: WashiRoll[]
  }
}

const ProgressionContext = createContext<ProgressionContextValue | null>(null)

export function useProgression() {
  const ctx = useContext(ProgressionContext)
  if (!ctx) throw new Error("useProgression must be used within ProgressionProvider")
  return ctx
}

const DEFAULT_STATS: ProgressionStats = {
  totalAnswers: 0,
  totalCorrect: 0,
  maxStreak: 0,
  gamesPlayed: 0,
  perfectRuns: 0,
  accurateRuns: 0,
  modesPlayed: [],
}

export function ProgressionProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<ProgressionStats>(DEFAULT_STATS)
  const [swatches, setSwatches] = useState(0)
  const [unlockedRolls, setUnlockedRolls] = useState<string[]>(["starter-mint"]) // Start with mint roll
  const [selectedRoll, setSelectedRollState] = useState("starter-mint")

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("washiway-progression")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setStats(data.stats || DEFAULT_STATS)
        setSwatches(data.swatches || 0)
        setUnlockedRolls(data.unlockedRolls || ["starter-mint"])
        setSelectedRollState(data.selectedRoll || "starter-mint")
      } catch {
        // ignore
      }
    }
  }, [])

  // Save to localStorage
  const saveProgress = (
    newStats: ProgressionStats,
    newSwatches: number,
    newUnlocked: string[],
    newSelected: string,
  ) => {
    localStorage.setItem(
      "washiway-progression",
      JSON.stringify({
        stats: newStats,
        swatches: newSwatches,
        unlockedRolls: newUnlocked,
        selectedRoll: newSelected,
      }),
    )
  }

  const getRoll = (id: string) => WASHI_ROLLS.find((r) => r.id === id)

  const getSelectedRoll = () => getRoll(selectedRoll) || WASHI_ROLLS[0]

  const setSelectedRoll = (id: string) => {
    if (unlockedRolls.includes(id)) {
      setSelectedRollState(id)
      saveProgress(stats, swatches, unlockedRolls, id)
    }
  }

  const getAchievementProgress = (achievement: Achievement) => {
    let current = 0
    switch (achievement.type) {
      case "totalAnswers":
        current = stats.totalAnswers
        break
      case "streak":
        current = stats.maxStreak
        break
      case "accuracy":
        current = stats.accurateRuns
        break
      case "gamesPlayed":
        current = achievement.id === "allModes" ? stats.modesPlayed.length : stats.gamesPlayed
        break
      case "perfectRun":
        current = stats.perfectRuns
        break
    }
    return {
      current,
      target: achievement.target,
      complete: current >= achievement.target,
    }
  }

  const checkUnlocks = (newStats: ProgressionStats): WashiRoll[] => {
    const newUnlocks: WashiRoll[] = []
    for (const roll of WASHI_ROLLS) {
      if (unlockedRolls.includes(roll.id)) continue
      const req = roll.unlockRequirement
      let met = false
      switch (req.type) {
        case "totalAnswers":
          met = newStats.totalAnswers >= req.target
          break
        case "streak":
          met = newStats.maxStreak >= req.target
          break
        case "accuracy":
          met = newStats.accurateRuns >= req.target
          break
        case "gamesPlayed":
          met = req.id === "allModes" ? newStats.modesPlayed.length >= req.target : newStats.gamesPlayed >= req.target
          break
        case "perfectRun":
          met = newStats.perfectRuns >= req.target
          break
      }
      if (met) newUnlocks.push(roll)
    }
    return newUnlocks
  }

  const recordGameResult = (mode: GameMode, correct: number, total: number, maxStreak: number) => {
    const accuracy = total > 0 ? correct / total : 0
    const isPerfect = total > 0 && correct === total
    const isAccurate = accuracy >= 0.85

    const newStats: ProgressionStats = {
      totalAnswers: stats.totalAnswers + total,
      totalCorrect: stats.totalCorrect + correct,
      maxStreak: Math.max(stats.maxStreak, maxStreak),
      gamesPlayed: stats.gamesPlayed + 1,
      perfectRuns: stats.perfectRuns + (isPerfect ? 1 : 0),
      accurateRuns: stats.accurateRuns + (isAccurate ? 1 : 0),
      modesPlayed: stats.modesPlayed.includes(mode) ? stats.modesPlayed : [...stats.modesPlayed, mode],
    }

    // Calculate swatches earned (1 per correct + bonus for streaks)
    const swatchesEarned = correct + Math.floor(maxStreak / 5) * 2

    const newUnlocks = checkUnlocks(newStats)
    const newUnlockedRolls = [...unlockedRolls, ...newUnlocks.map((r) => r.id)]
    const newSwatches = swatches + swatchesEarned

    setStats(newStats)
    setSwatches(newSwatches)
    setUnlockedRolls(newUnlockedRolls)
    saveProgress(newStats, newSwatches, newUnlockedRolls, selectedRoll)

    return { swatchesEarned, newUnlocks }
  }

  return (
    <ProgressionContext.Provider
      value={{
        stats,
        swatches,
        unlockedRolls,
        selectedRoll,
        setSelectedRoll,
        getRoll,
        getSelectedRoll,
        getAchievementProgress,
        recordGameResult,
      }}
    >
      {children}
    </ProgressionContext.Provider>
  )
}
