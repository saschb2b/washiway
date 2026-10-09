// Skills are the trainable areas; each one keeps its own adaptive level.
export const SKILLS = ["quick", "check", "estimate", "line", "gap", "target", "growth"] as const
export type Skill = (typeof SKILLS)[number]

// Game modes are what the menu offers: every skill plus an interleaved mix.
export const GAME_MODES = ["quick", "check", "estimate", "line", "gap", "target", "growth", "mix"] as const
export type GameMode = (typeof GAME_MODES)[number]

export const MIN_LEVEL = 1
export const MAX_LEVEL = 10

export type Language = "en" | "de"

// Text shown to the player. Plain strings are language-neutral (math notation).
export type Localized = { en: string; de: string }
export type Text = string | Localized

interface BaseQuestion {
  id: string
  skill: Skill
  // Integer difficulty tier (1-10) the question was generated at.
  tier: number
  // Short instruction above the task, e.g. "Which is bigger?".
  prompt: Localized
  // Shown after a wrong answer: the solution and a strategy that gets there.
  explanation: Text
}

// Typed on the keypad. Answers are always integers that fit the keypad.
export interface NumberQuestion extends BaseQuestion {
  kind: "number"
  display: Text
  answer: number
}

export interface TrueFalseQuestion extends BaseQuestion {
  kind: "truefalse"
  display: Text
  answer: boolean
}

// Pick one of 2-4 options; `answer` is the index of the correct one.
export interface ChoiceQuestion extends BaseQuestion {
  kind: "choice"
  display: Text
  options: Text[]
  answer: number
}

// Tap where `value` sits between `min` and `max`. Within `tolerance`
// (a fraction of the line length) counts as correct.
export interface NumberLineQuestion extends BaseQuestion {
  kind: "line"
  display: Text
  min: number
  max: number
  minLabel: string
  maxLabel: string
  // Unlabeled tick marks as benchmarks, given as values between min and max.
  ticks: number[]
  value: number
  tolerance: number
}

export type TargetOp = "+" | "×" | "−"

// Pick `pick` tiles that combine with `op` to `target`. Any valid
// combination counts; `answer` holds one of them for feedback.
export interface TargetQuestion extends BaseQuestion {
  kind: "target"
  display: Text
  tiles: string[]
  values: number[]
  op: TargetOp
  pick: 2 | 3
  target: number
  answer: number[]
}

export type Question = NumberQuestion | TrueFalseQuestion | ChoiceQuestion | NumberLineQuestion | TargetQuestion
export type QuestionKind = Question["kind"]

// What each kind of input hands back to the game.
export type Answer = number | boolean | number[]

export interface AnswerResult {
  correct: boolean
  // 0-1, how good the answer was. 1 for exact answers, graded on the number line.
  accuracy: number
}

// Generated content before the engine stamps id, skill and tier onto it.
export type QuestionDraft =
  | Omit<NumberQuestion, "id" | "skill" | "tier">
  | Omit<TrueFalseQuestion, "id" | "skill" | "tier">
  | Omit<ChoiceQuestion, "id" | "skill" | "tier">
  | Omit<NumberLineQuestion, "id" | "skill" | "tier">
  | Omit<TargetQuestion, "id" | "skill" | "tier">
