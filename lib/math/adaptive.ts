// Adaptive difficulty and scoring.
//
// Each skill has a continuous level (1-10). After every answer the level moves
// like a weighted up/down staircase: a small step up for a correct answer
// (bigger when fast), a larger step down for a miss. With a down/up ratio of
// p / (1 - p) the level settles where the player succeeds about p of the time
// — roughly 80%, the zone adaptive practice systems such as Math Garden aim
// for. Steps start large so new players find their level within a round, and
// shrink as more answers come in.
//
// Points follow the "high speed, high stakes" idea: a correct answer earns
// more the faster it comes, and a fast wrong answer on a guessable task costs
// as much as a fast right one earns, so guessing does not pay. Slow mistakes
// and "don't know" cost nothing.

import { MAX_LEVEL, MIN_LEVEL, type Question } from "./types"

export interface SkillRecord {
  level: number
  answered: number
}

export const START_LEVEL = 1.5

export type Outcome = "correct" | "wrong" | "skipped"

// Questions you could guess (true/false, two options) need a higher hit rate.
export function targetSuccess(question: Question): number {
  if (question.kind === "truefalse") return 0.85
  if (question.kind === "choice" && question.options.length === 2) return 0.85
  return 0.8
}

// How long a quick, confident answer takes, in milliseconds.
export function referenceTime(question: Question): number {
  let base: number
  switch (question.kind) {
    case "truefalse":
      base = 2500
      break
    case "choice":
      base = 3000 + 400 * (question.options.length - 2)
      break
    case "number":
      base = 2000 + 600 * String(Math.abs(question.answer)).length
      break
    case "line":
      base = 3000
      break
    case "target":
      base = 3500 + 400 * question.tiles.length + 1500 * (question.pick - 2)
      break
  }
  return base * (1 + 0.08 * (question.tier - 1))
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function stepSize(answered: number): number {
  return 0.12 + 0.3 * Math.exp(-answered / 30)
}

export function updateRecord(
  record: SkillRecord,
  question: Question,
  outcome: Outcome,
  responseMs: number,
): SkillRecord {
  const k = stepSize(record.answered)
  const p = targetSuccess(question)
  // A question above your level moves you up more and down less, and the
  // other way round — easy review or burst questions barely count.
  const gap = question.tier - record.level
  let delta: number
  if (outcome === "correct") {
    const speed = clamp(1.25 - (0.75 * responseMs) / referenceTime(question), 0.5, 1.25)
    delta = k * speed * clamp(1 + 0.5 * gap, 0.25, 1.75)
  } else {
    const down = k * (p / (1 - p)) * clamp(1 - 0.5 * gap, 0.25, 1.75)
    delta = outcome === "wrong" ? -down : -down / 2
  }
  return {
    level: clamp(record.level + delta, MIN_LEVEL, MAX_LEVEL),
    answered: record.answered + 1,
  }
}

// Remaining share of a soft deadline of twice the reference time.
function remaining(question: Question, responseMs: number): number {
  return clamp(1 - responseMs / (2 * referenceTime(question)), 0, 1)
}

export function basePoints(tier: number): number {
  return 10 + 5 * (tier - 1)
}

export function pointsFor(
  question: Question,
  outcome: Outcome,
  responseMs: number,
  accuracy: number,
  multiplier: number,
): number {
  if (outcome === "skipped") return 0
  const base = basePoints(question.tier)
  const rest = remaining(question, responseMs)
  if (outcome === "correct") return Math.round(base * (0.4 + 0.6 * rest) * accuracy) * multiplier
  const guessable = question.kind === "truefalse" || question.kind === "choice"
  return -Math.round(base * rest * (guessable ? 1 : 0.5)) || 0
}

export function multiplierFor(streak: number): number {
  return streak >= 20 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 2 : 1
}
