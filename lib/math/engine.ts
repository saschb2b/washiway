import { type Rng, defaultRng, pick } from "./random"
import { generateCheck } from "./skills/check"
import { generateEstimate } from "./skills/estimate"
import { generateGap } from "./skills/gap"
import { generateGrowth } from "./skills/growth"
import { generateLine } from "./skills/line"
import { generateQuick } from "./skills/quick"
import { combine, generateTarget } from "./skills/target"
import {
  type Answer,
  type AnswerResult,
  type GameMode,
  MAX_LEVEL,
  MIN_LEVEL,
  type Question,
  type QuestionDraft,
  SKILLS,
  type Skill,
} from "./types"

const GENERATORS: Record<Skill, (tier: number, rng: Rng) => QuestionDraft> = {
  quick: generateQuick,
  check: generateCheck,
  estimate: generateEstimate,
  line: generateLine,
  gap: generateGap,
  target: generateTarget,
  growth: generateGrowth,
}

let counter = 0

// A continuous level like 3.4 yields tier 3 or 4, with 4 about 40% of the time,
// so difficulty rises smoothly between whole levels.
export function tierFor(level: number, rng: Rng = defaultRng): number {
  const clamped = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, level))
  const base = Math.floor(clamped)
  const tier = rng() < clamped - base ? base + 1 : base
  return Math.min(MAX_LEVEL, tier)
}

export function generateForTier(skill: Skill, tier: number, rng: Rng = defaultRng): Question {
  const draft = GENERATORS[skill](tier, rng)
  return { ...draft, id: `q${++counter}`, skill, tier } as Question
}

export function generateQuestion(skill: Skill, level: number, rng: Rng = defaultRng): Question {
  return generateForTier(skill, tierFor(level, rng), rng)
}

// The skill a question for `mode` should train next. Mix interleaves all of them.
export function skillForMode(mode: GameMode, rng: Rng = defaultRng): Skill {
  return mode === "mix" ? pick(rng, SKILLS) : mode
}

// A fresh copy of a question for spaced review (new id, same content).
export function reissue(question: Question): Question {
  return { ...question, id: `q${++counter}` }
}

export function checkAnswer(question: Question, answer: Answer | null): AnswerResult {
  if (answer === null) return { correct: false, accuracy: 0 }
  switch (question.kind) {
    case "number":
    case "truefalse":
    case "choice":
      return answer === question.answer ? { correct: true, accuracy: 1 } : { correct: false, accuracy: 0 }
    case "line": {
      if (typeof answer !== "number") return { correct: false, accuracy: 0 }
      const error = Math.abs(answer - question.value) / (question.max - question.min)
      const correct = error <= question.tolerance
      return { correct, accuracy: correct ? 1 - 0.5 * (error / question.tolerance) : 0 }
    }
    case "target": {
      if (!Array.isArray(answer) || answer.length !== question.pick || new Set(answer).size !== answer.length) {
        return { correct: false, accuracy: 0 }
      }
      const value = combine(
        answer.map((i) => question.values[i]),
        question.op,
      )
      const correct = Math.abs(value - question.target) < 1e-9
      return { correct, accuracy: correct ? 1 : 0 }
    }
  }
}
