// Number line: tap where a number sits. Precise placement of whole numbers,
// negatives, fractions, decimals and percentages is one of the best
// predictors of mathematical achievement, and fractions matter most.

import { cat, drawCalc } from "../arithmetic"
import { L, fmt, fmtDecimal, fmtFraction, gcd } from "../format"
import { type Rng, chance, pick, randInt, weighted } from "../random"
import type { QuestionDraft, Text } from "../types"

const PROMPT = L("Tap where it goes", "Tippe die Stelle an")

type Draft = Extract<QuestionDraft, { kind: "line" }>
type Builder = (rng: Rng, tolerance: number) => Draft

// Fraction of the line length that still counts as a hit.
const TOLERANCE: Record<number, number> = {
  1: 0.1,
  2: 0.08,
  3: 0.07,
  4: 0.06,
  5: 0.05,
  6: 0.05,
  7: 0.04,
  8: 0.04,
  9: 0.035,
  10: 0.03,
}

function line(
  display: Text,
  value: number,
  min: number,
  max: number,
  tolerance: number,
  options: { minLabel?: string; maxLabel?: string; ticks?: number[]; explanation?: Text } = {},
): Draft {
  const share = (value - min) / (max - min)
  const where = L(`${fmtDecimal(share * 100, 1)}% of the way along`, `${fmtDecimal(share * 100, 1)} % des Wegs`)
  return {
    kind: "line",
    prompt: PROMPT,
    display,
    value,
    min,
    max,
    minLabel: options.minLabel ?? fmt(min),
    maxLabel: options.maxLabel ?? fmt(max),
    ticks: options.ticks ?? [],
    tolerance,
    explanation: options.explanation ? cat(options.explanation, " · ", where) : where,
  }
}

const half = (min: number, max: number) => [(min + max) / 2]
const quarters = (min: number, max: number) => [1, 2, 3].map((k) => min + ((max - min) * k) / 4)

const wholeNumbers =
  (max: number, step: number, ticks: boolean): Builder =>
  (rng, tolerance) => {
    const value = randInt(rng, 1, max / step - 1) * step
    return line(fmt(value), value, 0, max, tolerance, { ticks: ticks ? half(0, max) : [] })
  }

const offsetRange: Builder = (rng, tolerance) => {
  const min = randInt(rng, 1, 9) * 100
  const max = min + 100
  const value = min + randInt(rng, 3, 97)
  return line(fmt(value), value, min, max, tolerance)
}

const negatives =
  (span: number): Builder =>
  (rng, tolerance) => {
    let value = randInt(rng, -span + 1, span - 1)
    if (value === 0) value = -1
    return line(fmt(value), value, -span, span, tolerance, { ticks: [0] })
  }

const simpleFractions: Builder = (rng, tolerance) => {
  const d = pick(rng, [2, 4, 4, 5, 10])
  const n = randInt(rng, 1, d - 1)
  if (gcd(n, d) !== 1) return simpleFractions(rng, tolerance)
  return line(fmtFraction(n, d), n / d, 0, 1, tolerance, {
    ticks: half(0, 1),
    explanation: `${n}/${d} = ${fmtDecimal(n / d, 3)}`,
  })
}

const decimals =
  (places: 1 | 2): Builder =>
  (rng, tolerance) => {
    const scale = places === 1 ? 10 : 100
    const k = randInt(rng, 1, scale - 1)
    if (k % 10 === 0 && places === 2) return decimals(places)(rng, tolerance)
    return line(fmtDecimal(k / scale, places), k / scale, 0, 1, tolerance)
  }

const fractions =
  (denominators: number[]): Builder =>
  (rng, tolerance) => {
    const d = pick(rng, denominators)
    const n = randInt(rng, 1, d - 1)
    if (gcd(n, d) !== 1) return fractions(denominators)(rng, tolerance)
    return line(fmtFraction(n, d), n / d, 0, 1, tolerance, { explanation: `${n}/${d} = ${fmtDecimal(n / d, 3)}` })
  }

const improperFractions: Builder = (rng, tolerance) => {
  const max = pick(rng, [2, 3, 5])
  const d = pick(rng, [2, 3, 4, 5, 8])
  const n = randInt(rng, d + 1, max * d - 1)
  if (gcd(n, d) !== 1) return improperFractions(rng, tolerance)
  const whole = Math.floor(n / d)
  return line(fmtFraction(n, d), n / d, 0, max, tolerance, {
    ticks: Array.from({ length: max - 1 }, (_, i) => i + 1),
    explanation: `${n}/${d} = ${whole} ${n - whole * d}/${d}`,
  })
}

const percentages: Builder = (rng, tolerance) => {
  const p = randInt(rng, 1, 19) * 5
  return line(`${p}%`, p, 0, 100, tolerance, { minLabel: "0%", maxLabel: "100%" })
}

const percentOfAmount: Builder = (rng, tolerance) => {
  const max = pick(rng, [200, 400, 500, 800])
  const p = pick(rng, [10, 20, 25, 30, 40, 60, 75, 80, 90])
  const base = pick(rng, [max, max / 2])
  const value = (p * base) / 100
  return line(L(`${p}% of ${base}`, `${p} % von ${base}`), value, 0, max, tolerance, { explanation: `= ${fmt(value)}` })
}

const bigNumbers: Builder = (rng, tolerance) => {
  const max = pick(rng, [10000, 1000000])
  const value = randInt(rng, 1, 39) * (max / 40)
  return line(fmt(value), value, 0, max, tolerance)
}

const computed: Builder = (rng, tolerance) => {
  const calc = drawCalc(randInt(rng, 3, 7), rng)
  if (calc.value <= 0 || calc.value >= 1000) return computed(rng, tolerance)
  const max = calc.value < 100 ? 100 : 1000
  return line(calc.expr, calc.value, 0, max, tolerance, { explanation: `= ${fmt(calc.value)}` })
}

const signedFractions: Builder = (rng, tolerance) => {
  const d = pick(rng, [2, 3, 4, 5])
  const n = randInt(rng, -2 * d + 1, d - 1)
  if (n === 0 || gcd(Math.abs(n), d) !== 1) return signedFractions(rng, tolerance)
  return line(fmtFraction(n, d), n / d, -2, 1, tolerance, {
    ticks: [-1, 0],
    explanation: `${fmtFraction(n, d)} = ${fmtDecimal(n / d, 3)}`,
  })
}

const constants: Builder = (rng, tolerance) => {
  const [label, value, explanation] = pick(rng, [
    ["π", Math.PI, "π ≈ 3.14"],
    ["√2", Math.SQRT2, "√2 ≈ 1.41"],
    ["√3", Math.sqrt(3), "√3 ≈ 1.73"],
    ["e", Math.E, "e ≈ 2.72"],
    ["φ", (1 + Math.sqrt(5)) / 2, "φ ≈ 1.62"],
    ["√10", Math.sqrt(10), "√10 ≈ 3.16"],
    ["√5", Math.sqrt(5), "√5 ≈ 2.24"],
  ] as const)
  return line(label, value, 0, 4, tolerance, { explanation })
}

const roots: Builder = (rng, tolerance) => {
  const n = randInt(rng, 2, 99)
  if (Number.isInteger(Math.sqrt(n))) return roots(rng, tolerance)
  const k = Math.floor(Math.sqrt(n))
  return line(`√${n}`, Math.sqrt(n), 0, 10, tolerance, {
    explanation: `${k}² = ${k * k} < ${n} < ${(k + 1) * (k + 1)} = ${k + 1}² → ${fmtDecimal(Math.sqrt(n), 2)}`,
  })
}

const TIERS: Record<number, [Builder, number][]> = {
  1: [
    [wholeNumbers(10, 1, true), 1],
    [wholeNumbers(20, 1, true), 1],
  ],
  2: [
    [wholeNumbers(100, 5, true), 1],
    [wholeNumbers(100, 1, true), 2],
  ],
  3: [
    [wholeNumbers(100, 1, false), 2],
    [wholeNumbers(1000, 10, true), 2],
    [simpleFractions, 1],
  ],
  4: [
    [wholeNumbers(1000, 1, false), 2],
    [decimals(1), 1],
    [simpleFractions, 2],
    [negatives(10), 1],
  ],
  5: [
    [negatives(100), 1],
    [fractions([3, 4, 5, 6]), 2],
    [percentages, 1],
    [decimals(2), 1],
    [offsetRange, 1],
  ],
  6: [
    [fractions([6, 7, 8, 9, 10]), 2],
    [decimals(2), 1],
    [percentOfAmount, 1],
    [offsetRange, 1],
    [improperFractions, 1],
  ],
  7: [
    [improperFractions, 2],
    [bigNumbers, 1],
    [computed, 2],
    [fractions([7, 8, 9, 11, 12]), 1],
  ],
  8: [
    [computed, 2],
    [signedFractions, 2],
    [bigNumbers, 1],
    [roots, 1],
  ],
  9: [
    [roots, 2],
    [constants, 1],
    [signedFractions, 1],
    [fractions([11, 12, 13, 15, 16]), 2],
  ],
  10: [
    [fractions([12, 13, 15, 16, 17, 19]), 2],
    [roots, 2],
    [constants, 1],
    [computed, 1],
  ],
}

export function generateLine(tier: number, rng: Rng): QuestionDraft {
  const builder = weighted(rng, TIERS[tier])
  const draft = builder(rng, TOLERANCE[tier])
  // At the low end, a midpoint benchmark helps; keep it most of the time.
  if (tier <= 2 && draft.ticks.length === 0 && chance(rng, 0.8)) {
    return { ...draft, ticks: quarters(draft.min, draft.max).slice(1, 2) }
  }
  return draft
}
