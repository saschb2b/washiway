import type { Skill } from "./math"

export type { GameMode } from "./math"

export type GameState = "splash" | "menu" | "playing" | "results"

export interface LevelChange {
  skill: Skill
  from: number
  to: number
}

export interface GameStats {
  score: number
  maxStreak: number
  correct: number
  incorrect: number
  skipped: number
  avgTime: number
  timed: boolean
  levelChanges: LevelChange[]
  // Questions saved for review next time.
  reviewSaved: number
}

export const GAME_DURATION = 60
export const PRACTICE_LENGTH = 20
