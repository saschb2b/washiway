// Fill the gap: inverse operations, the equals sign as a balance, number
// patterns, and the first steps of algebra — solving for the unknown.

import { sup } from "../arithmetic"
import { L, MINUS, fmt } from "../format"
import { type Rng, chance, pick, randInt, weighted } from "../random"
import type { Localized, QuestionDraft, Text } from "../types"

const GAP = L("What goes in the gap?", "Was gehört in die Lücke?")
const FIND_X = L("Find x", "Finde x")
const NEXT = L("Complete the pattern", "Ergänze das Muster")

type Draft = Extract<QuestionDraft, { kind: "number" }>
type Builder = (rng: Rng) => Draft

function gap(display: Text, answer: number, explanation: Text, prompt: Localized = GAP): Draft {
  return { kind: "number", prompt, display, answer, explanation }
}

const missingAddend =
  (max: number): Builder =>
  (rng) => {
    const sum = randInt(rng, 8, max)
    const known = randInt(rng, 2, sum - 2)
    const x = sum - known
    const display = chance(rng, 0.5) ? `${known} + ? = ${sum}` : `? + ${known} = ${sum}`
    return gap(display, x, `${sum} − ${known} = ${x}`)
  }

const missingSubtrahend: Builder = (rng) => {
  const a = randInt(rng, 9, 20)
  const x = randInt(rng, 2, a - 2)
  return gap(`${a} − ? = ${a - x}`, x, `${a} − ${a - x} = ${x}`)
}

const bondGap =
  (total: 100 | 1000): Builder =>
  (rng) => {
    const known = total === 100 ? randInt(rng, 11, 89) : randInt(rng, 11, 189) * 5
    const x = total - known
    return gap(`${known} + ? = ${fmt(total)}`, x, `${fmt(total)} − ${known} = ${x}`)
  }

const missingFactor =
  (max: number): Builder =>
  (rng) => {
    const a = randInt(rng, 2, max)
    const x = randInt(rng, 2, max)
    const p = a * x
    const display = chance(rng, 0.5) ? `${a} × ? = ${p}` : `? × ${a} = ${p}`
    return gap(display, x, `${p} ÷ ${a} = ${x}`)
  }

const missingDivisor: Builder = (rng) => {
  const x = randInt(rng, 2, 10)
  const q = randInt(rng, 2, 10)
  const n = x * q
  return gap(`${n} ÷ ? = ${q}`, x, `${n} ÷ ${q} = ${x}`)
}

const balance =
  (withTimes: boolean): Builder =>
  (rng) => {
    const kind = withTimes ? randInt(rng, 0, 2) : randInt(rng, 0, 1)
    if (kind === 0) {
      const a = randInt(rng, 3, 30)
      const b = randInt(rng, 3, 30)
      const c = randInt(rng, 2, a + b - 2)
      const x = a + b - c
      return gap(
        `${a} + ${b} = ? + ${c}`,
        x,
        L(`both sides are ${a + b}: ${a + b} − ${c} = ${x}`, `beide Seiten sind ${a + b}: ${a + b} − ${c} = ${x}`),
      )
    }
    if (kind === 1) {
      const a = randInt(rng, 15, 50)
      const b = randInt(rng, 2, a - 5)
      const c = randInt(rng, a - b + 2, a - b + 30)
      const x = c - (a - b)
      return gap(
        `${a} − ${b} = ${c} − ?`,
        x,
        L(`both sides are ${a - b}: ${c} − ${a - b} = ${x}`, `beide Seiten sind ${a - b}: ${c} − ${a - b} = ${x}`),
      )
    }
    // a × b = ? × c with the same product written two ways.
    const c = randInt(rng, 2, 6)
    const x = randInt(rng, 2, 12)
    const product = x * c
    const pairs: [number, number][] = []
    for (let a = 2; a * a <= product; a++) {
      if (product % a === 0 && ![x, c].includes(a) && ![x, c].includes(product / a)) pairs.push([a, product / a])
    }
    if (pairs.length === 0) return balance(withTimes)(rng)
    const [a, b] = pick(rng, pairs)
    const [left, right] = chance(rng, 0.5) ? [a, b] : [b, a]
    return gap(
      `${left} × ${right} = ? × ${c}`,
      x,
      L(
        `both sides are ${product}: ${product} ÷ ${c} = ${x}`,
        `beide Seiten sind ${product}: ${product} ÷ ${c} = ${x}`,
      ),
    )
  }

const twoStep =
  (negatives: boolean): Builder =>
  (rng) => {
    const a = randInt(rng, 2, 9)
    const x = negatives && chance(rng, 0.4) ? -randInt(rng, 1, 9) : randInt(rng, 2, 12)
    const b = randInt(rng, 1, 30)
    const minus = chance(rng, 0.4)
    const c = minus ? a * x - b : a * x + b
    const display = `${a} × ? ${minus ? "−" : "+"} ${b} = ${fmt(c)}`
    const undo = minus ? `${fmt(c)} + ${b}` : `${fmt(c)} − ${b}`
    return gap(display, x, `${undo} = ${fmt(a * x)}, ${fmt(a * x)} ÷ ${a} = ${fmt(x)}`)
  }

const bracket: Builder = (rng) => {
  const a = randInt(rng, 2, 9)
  const b = randInt(rng, 1, 12)
  const x = randInt(rng, b + 1, b + 15)
  const c = a * (x - b)
  return gap(`${a} × (? − ${b}) = ${c}`, x, `${c} ÷ ${a} = ${x - b}, ${x - b} + ${b} = ${x}`)
}

const negativeSolutions: Builder = (rng) => {
  if (chance(rng, 0.5)) {
    const b = randInt(rng, 5, 30)
    const c = randInt(rng, 1, b - 1)
    const x = c - b
    return gap(`? + ${b} = ${c}`, x, `${c} − ${b} = ${fmt(x)}`)
  }
  const a = randInt(rng, 2, 9)
  const x = -randInt(rng, 2, 12)
  return gap(`? × ${a} = ${fmt(a * x)}`, x, `${fmt(a * x)} ÷ ${a} = ${fmt(x)}`)
}

const powerGap =
  (hard: boolean): Builder =>
  (rng) => {
    if (hard && chance(rng, 0.3)) {
      const n = randInt(rng, 4, 21)
      if (n % 10 === 0) return powerGap(hard)(rng)
      return gap(`x³ = ${fmt(n * n * n)}`, n, `${n} × ${n} × ${n} = ${fmt(n * n * n)}`, FIND_X)
    }
    const options: [number, number][] = hard
      ? [
          [2, 13],
          [3, 8],
          [5, 5],
          [4, 6],
        ]
      : [
          [2, 8],
          [3, 4],
          [10, 4],
        ]
    const [base, max] = pick(rng, options)
    const x = randInt(rng, 2, max)
    const v = Math.pow(base, x)
    return gap(`${base}ˣ = ${fmt(v)}`, x, `${base}${sup(x)} = ${fmt(v)}`, FIND_X)
  }

const percentGap =
  (hard: boolean): Builder =>
  (rng) => {
    if (hard) {
      const base = pick(rng, [125, 150, 250, 400, 500, 800])
      const p = randInt(rng, 2, 40)
      const part = (p * base) / 100
      if (!Number.isInteger(part)) return percentGap(hard)(rng)
      return gap(L(`?% of ${base} = ${part}`, `? % von ${base} = ${part}`), p, `${part} ÷ ${base} = ${p / 100} → ${p}%`)
    }
    if (chance(rng, 0.5)) {
      const p = pick(rng, [10, 20, 25, 50, 75])
      const base = randInt(rng, 2, 20) * (p === 75 || p === 25 ? 4 : 10)
      const part = (p * base) / 100
      return gap(L(`?% of ${base} = ${part}`, `? % von ${base} = ${part}`), p, `${part} ÷ ${base} = ${p / 100} → ${p}%`)
    }
    const p = pick(rng, [10, 20, 25, 50])
    const whole = randInt(rng, 2, 30) * (100 / p)
    const part = (p * whole) / 100
    return gap(L(`${p}% of ? = ${part}`, `${p} % von ? = ${part}`), whole, `${part} × ${100 / p} = ${whole}`)
  }

const fractionEquivalent: Builder = (rng) => {
  const d = randInt(rng, 3, 9)
  const n = randInt(rng, 1, d - 1)
  const k = randInt(rng, 2, 9)
  if (chance(rng, 0.5)) {
    return gap(`${n}/${d} = ?/${d * k}`, n * k, `×${k}: ${n} × ${k} = ${n * k}`)
  }
  return gap(`?/${d} = ${n * k}/${d * k}`, n, `÷${k}: ${n * k} ÷ ${k} = ${n}`)
}

const squareGap: Builder = (rng) => {
  const x = randInt(rng, 4, 25)
  if (chance(rng, 0.5)) return gap(`x² = ${x * x}`, x, `${x} × ${x} = ${x * x}`, FIND_X)
  const b = randInt(rng, 5, 99)
  return gap(`x² + ${b} = ${x * x + b}`, x, `${x * x + b} − ${b} = ${x * x} = ${x}²`, FIND_X)
}

const bothSides: Builder = (rng) => {
  const c = randInt(rng, 1, 7)
  const a = c + randInt(rng, 1, 5)
  const x = randInt(rng, -6, 15)
  const b = randInt(rng, 1, 30)
  const d = (a - c) * x + b
  if (x === 0 || d === b) return bothSides(rng)
  const right = c === 1 ? "x" : `${c}x`
  return gap(
    `${a}x + ${b} = ${right} + ${fmt(d)}`.replace(`+ ${MINUS}`, `− `),
    x,
    `${a - c}x = ${fmt(d)} − ${b} = ${fmt(d - b)} → x = ${fmt(x)}`,
    FIND_X,
  )
}

// --- Patterns ---------------------------------------------------------------

function sequence(terms: number[], rule: Text, rng: Rng, missingLast = false): Draft {
  const index = missingLast ? terms.length - 1 : randInt(rng, 1, terms.length - 1)
  const shown = terms.map((t, i) => (i === index ? "?" : fmt(t)))
  return gap(shown.join(", "), terms[index], rule, NEXT)
}

const arithmeticSequence: Builder = (rng) => {
  const d = randInt(rng, 2, 15) * (chance(rng, 0.2) ? -1 : 1)
  const start = d < 0 ? randInt(rng, 60, 120) : randInt(rng, 1, 30)
  const terms = Array.from({ length: 5 }, (_, i) => start + i * d)
  return sequence(
    terms,
    L(`${d > 0 ? "+" : "−"}${Math.abs(d)} each step`, `jeweils ${d > 0 ? "+" : "−"}${Math.abs(d)}`),
    rng,
  )
}

const geometricSequence: Builder = (rng) => {
  const r = pick(rng, [2, 2, 3, 4, 5])
  const start = randInt(rng, 1, 5)
  const terms = Array.from({ length: 5 }, (_, i) => start * Math.pow(r, i))
  if (terms[4] > 9999) return geometricSequence(rng)
  return sequence(terms, L(`×${r} each step`, `jeweils ×${r}`), rng)
}

const squareSequence: Builder = (rng) => {
  const start = randInt(rng, 1, 8)
  const terms = Array.from({ length: 5 }, (_, i) => (start + i) * (start + i))
  return sequence(
    terms,
    L(`square numbers: ${start}², ${start + 1}², …`, `Quadratzahlen: ${start}², ${start + 1}², …`),
    rng,
  )
}

const alternatingSequence: Builder = (rng) => {
  const up = randInt(rng, 3, 9)
  const down = randInt(rng, 1, up - 1)
  const start = randInt(rng, 1, 20)
  const terms = [start]
  for (let i = 1; i < 6; i++) terms.push(terms[i - 1] + (i % 2 === 1 ? up : -down))
  return sequence(terms, L(`+${up}, −${down}, +${up}, …`, `+${up}, −${down}, +${up}, …`), rng)
}

const fibonacciLike: Builder = (rng) => {
  const a = randInt(rng, 1, 6)
  const b = randInt(rng, a, 9)
  const terms = [a, b]
  for (let i = 2; i < 6; i++) terms.push(terms[i - 1] + terms[i - 2])
  return sequence(
    terms,
    L("each term is the sum of the two before", "jede Zahl ist die Summe der zwei davor"),
    rng,
    true,
  )
}

const growingDifferences: Builder = (rng) => {
  const start = randInt(rng, 1, 10)
  const firstStep = randInt(rng, 1, 5)
  const growth = randInt(rng, 1, 3)
  const terms = [start]
  for (let i = 1; i < 5; i++) terms.push(terms[i - 1] + firstStep + (i - 1) * growth)
  const steps = terms.slice(1).map((t, i) => t - terms[i])
  return sequence(
    terms,
    L(`differences ${steps.join(", ")} grow by ${growth}`, `Abstände ${steps.join(", ")} wachsen um ${growth}`),
    rng,
    true,
  )
}

const specialSequence: Builder = (rng) => {
  const kind = randInt(rng, 0, 4)
  if (kind === 0) {
    const terms = [1, 2, 6, 24, 120, 720]
    return sequence(terms, L("×2, ×3, ×4, ×5, … (factorials)", "×2, ×3, ×4, ×5, … (Fakultäten)"), rng)
  }
  if (kind === 1) {
    const start = randInt(rng, 1, 5)
    const terms = Array.from({ length: 5 }, (_, i) => ((start + i) * (start + i + 1)) / 2)
    return sequence(terms, L("triangular numbers: +2, +3, +4, …", "Dreieckszahlen: +2, +3, +4, …"), rng)
  }
  if (kind === 2) {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53]
    const start = randInt(rng, 0, primes.length - 5)
    return sequence(primes.slice(start, start + 5), L("prime numbers", "Primzahlen"), rng)
  }
  if (kind === 3) {
    const start = randInt(rng, 1, 6)
    const terms = Array.from({ length: 5 }, (_, i) => (start + i) * (start + i) + (start + i))
    return sequence(terms, "n² + n", rng)
  }
  const start = randInt(rng, 1, 4)
  const terms = Array.from({ length: 5 }, (_, i) => start * Math.pow(-2, i))
  return sequence(terms, L("×(−2) each step", "jeweils ×(−2)"), rng)
}

const TIERS: Record<number, [Builder, number][]> = {
  1: [
    [missingAddend(20), 3],
    [missingSubtrahend, 2],
  ],
  2: [
    [bondGap(100), 2],
    [missingFactor(5), 2],
    [missingAddend(50), 1],
  ],
  3: [
    [missingFactor(10), 2],
    [missingDivisor, 2],
    [balance(false), 2],
  ],
  4: [
    [missingFactor(12), 1],
    [balance(false), 2],
    [bondGap(1000), 1],
    [arithmeticSequence, 2],
  ],
  5: [
    [twoStep(false), 2],
    [arithmeticSequence, 1],
    [geometricSequence, 1],
    [balance(true), 1],
  ],
  6: [
    [powerGap(false), 1],
    [percentGap(false), 2],
    [negativeSolutions, 1],
    [twoStep(false), 1],
    [squareSequence, 1],
    [alternatingSequence, 1],
  ],
  7: [
    [fractionEquivalent, 2],
    [twoStep(true), 2],
    [fibonacciLike, 1],
    [growingDifferences, 1],
  ],
  8: [
    [squareGap, 1],
    [bracket, 2],
    [growingDifferences, 1],
    [alternatingSequence, 1],
    [percentGap(false), 1],
  ],
  9: [
    [bothSides, 2],
    [percentGap(true), 1],
    [specialSequence, 2],
    [fractionEquivalent, 1],
  ],
  10: [
    [bothSides, 2],
    [powerGap(true), 1],
    [specialSequence, 2],
    [bracket, 1],
  ],
}

export function generateGap(tier: number, rng: Rng): QuestionDraft {
  return weighted(rng, TIERS[tier])(rng)
}
