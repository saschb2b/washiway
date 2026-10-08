// Quick math: type the result. The arithmetic ladder lives in ../arithmetic.

import { cat, drawCalc } from "../arithmetic"
import { L } from "../format"
import type { Rng } from "../random"
import type { QuestionDraft } from "../types"

const PROMPT = L("Type the answer", "Tippe das Ergebnis")

export function generateQuick(tier: number, rng: Rng): QuestionDraft {
  const calc = drawCalc(tier, rng)
  return {
    kind: "number",
    prompt: PROMPT,
    display: cat(calc.expr, " = ?"),
    answer: calc.value,
    explanation: calc.explain,
  }
}
