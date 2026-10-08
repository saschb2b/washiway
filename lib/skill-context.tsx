"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { type SkillRecord, START_LEVEL } from "./math/adaptive"
import { type GameMode, type Question, SKILLS, type Skill } from "./math"

const SKILLS_KEY = "washiway-skills"
const REVIEW_KEY = "washiway-review"
const DECK_SIZE = 12

export type SkillRecords = Record<Skill, SkillRecord>
type ReviewDecks = Record<Skill, Question[]>

// What a finished session hands back: updated levels, questions that were
// missed (to revisit next time) and review questions now answered correctly.
export interface SessionResult {
  records: SkillRecords
  missed: Question[]
  cleared: string[]
}

interface SkillContextValue {
  records: SkillRecords
  reviewFor: (mode: GameMode) => Question[]
  commitSession: (result: SessionResult) => void
}

const SkillContext = createContext<SkillContextValue | null>(null)

export function useSkills() {
  const ctx = useContext(SkillContext)
  if (!ctx) throw new Error("useSkills must be used within SkillProvider")
  return ctx
}

// Identifies a task independent of the id it gets each time it is shown.
export function questionKey(question: Question): string {
  const display = typeof question.display === "string" ? question.display : question.display.en
  const extra =
    question.kind === "target" ? question.tiles.join(",") : question.kind === "line" ? question.maxLabel : ""
  return `${question.skill}|${display}|${extra}`
}

function fresh<T>(make: () => T): Record<Skill, T> {
  return Object.fromEntries(SKILLS.map((s) => [s, make()])) as Record<Skill, T>
}

function load<T>(key: string, fallback: Record<Skill, T>, valid: (value: unknown) => boolean): Record<Skill, T> {
  if (typeof window === "undefined") return fallback
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "null")
    if (!saved || typeof saved !== "object") return fallback
    const result = { ...fallback }
    for (const skill of SKILLS) if (valid(saved[skill])) result[skill] = saved[skill]
    return result
  } catch {
    return fallback
  }
}

const isRecord = (v: unknown) =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as SkillRecord).level === "number" &&
  typeof (v as SkillRecord).answered === "number"

export function SkillProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<SkillRecords>(() =>
    load(
      SKILLS_KEY,
      fresh(() => ({ level: START_LEVEL, answered: 0 })),
      isRecord,
    ),
  )
  const [decks, setDecks] = useState<ReviewDecks>(() =>
    load(
      REVIEW_KEY,
      fresh<Question[]>(() => []),
      Array.isArray,
    ),
  )

  const reviewFor = useCallback(
    (mode: GameMode) => {
      if (mode !== "mix") return decks[mode]
      // Interleave the newest misses from every skill.
      const longest = Math.max(...SKILLS.map((s) => decks[s].length))
      const mixed: Question[] = []
      for (let i = 0; i < longest; i++) for (const s of SKILLS) if (decks[s][i]) mixed.push(decks[s][i])
      return mixed.slice(0, DECK_SIZE)
    },
    [decks],
  )

  const commitSession = useCallback((result: SessionResult) => {
    setRecords(result.records)
    setDecks((previous) => {
      const cleared = new Set(result.cleared)
      const next = fresh<Question[]>(() => [])
      for (const skill of SKILLS) {
        const missed = result.missed.filter((q) => q.skill === skill)
        const seen = new Set<string>()
        next[skill] = [...missed, ...previous[skill]]
          .filter((q) => {
            const key = questionKey(q)
            if (seen.has(key) || (cleared.has(key) && !missed.includes(q))) return false
            seen.add(key)
            return true
          })
          .slice(0, DECK_SIZE)
      }
      try {
        localStorage.setItem(REVIEW_KEY, JSON.stringify(next))
      } catch {
        // Storage full or unavailable: review simply starts empty next time.
      }
      return next
    })
    try {
      localStorage.setItem(SKILLS_KEY, JSON.stringify(result.records))
    } catch {
      // Same as above.
    }
  }, [])

  return <SkillContext.Provider value={{ records, reviewFor, commitSession }}>{children}</SkillContext.Provider>
}
