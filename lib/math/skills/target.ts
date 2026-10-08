// Make the target: pick the tiles that combine to a given number. Builds
// number bonds (to 10, 100, 1000 and 1), factor pairs and differences —
// the relationships fluent calculators see at a glance.

import { L, fmt, fmtDecimal } from "../format"
import { type Rng, chance, pick, randInt, shuffle, weighted } from "../random"
import type { QuestionDraft, TargetOp } from "../types"

type Draft = Extract<QuestionDraft, { kind: "target" }>
type Builder = (rng: Rng) => Draft

const EPSILON = 1e-9

export function combine(values: number[], op: TargetOp): number {
  if (op === "+") return values.reduce((s, v) => s + v, 0)
  if (op === "×") return values.reduce((s, v) => s * v, 1)
  return Math.abs(values[0] - values[1])
}

function combinations(n: number, k: number): number[][] {
  if (k === 2)
    return Array.from({ length: n }, (_, i) => Array.from({ length: n - i - 1 }, (_, j) => [i, i + j + 1])).flat()
  const result: number[][] = []
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let l = j + 1; l < n; l++) result.push([i, j, l])
  return result
}

export function validCombinations(values: number[], op: TargetOp, pickCount: number, target: number): number[][] {
  return combinations(values.length, pickCount).filter(
    (combo) =>
      Math.abs(
        combine(
          combo.map((i) => values[i]),
          op,
        ) - target,
      ) < EPSILON,
  )
}

interface Spec {
  op: TargetOp
  pick: 2 | 3
  target: number
  solution: number[]
  distractors: number[]
  label?: (v: number) => string
  targetLabel?: string
}

function build(rng: Rng, spec: Spec, retryWith: Builder): Draft {
  const label = spec.label ?? fmt
  const values = shuffle(rng, [...spec.solution, ...spec.distractors])
  const unique = new Set(values.map((v) => v.toFixed(6)))
  if (unique.size !== values.length || values.some((v) => v <= 0)) return retryWith(rng)
  const valid = validCombinations(values, spec.op, spec.pick, spec.target)
  // At least one way to hit the target, but not so many that any tap works.
  if (valid.length < 1 || valid.length > 2) return retryWith(rng)
  const answer = valid[0]
  const blank = Array(spec.pick).fill("?").join(` ${spec.op} `)
  const targetLabel = spec.targetLabel ?? label(spec.target)
  const worked = `${answer.map((i) => label(values[i])).join(` ${spec.op} `)} = ${targetLabel}`
  return {
    kind: "target",
    prompt:
      spec.pick === 2 ? L("Tap two tiles", "Tippe zwei Kärtchen an") : L("Tap three tiles", "Tippe drei Kärtchen an"),
    display: `${blank} = ${targetLabel}`,
    tiles: values.map(label),
    values,
    op: spec.op,
    pick: spec.pick,
    target: spec.target,
    answer,
    explanation: worked,
  }
}

// Near misses make the search real: off by one, off by ten, a digit swap.
function nearMisses(rng: Rng, values: number[], count: number, min: number, max: number, step: number): number[] {
  const result: number[] = []
  for (let guard = 0; result.length < count && guard < 200; guard++) {
    const base = pick(rng, values)
    const offset = pick(rng, [-2, -1, 1, 2, -10, 10]) * step
    const candidate = base + offset
    if (candidate >= min && candidate <= max && !values.includes(candidate) && !result.includes(candidate)) {
      result.push(candidate)
    }
  }
  while (result.length < count) result.push(randInt(rng, min / step, max / step) * step)
  return result
}

function sumTo(total: number, tiles: 4 | 6, step: number): Builder {
  const self: Builder = (rng) => {
    const a = randInt(rng, 1, total / step - 1) * step
    const b = total - a
    if (a === b) return self(rng)
    const distractors = nearMisses(rng, [a, b], tiles - 2, step, total - step, step)
    return build(rng, { op: "+", pick: 2, target: total, solution: [a, b], distractors }, self)
  }
  return self
}

function productTo(maxFactor: number, tiles: 4 | 6): Builder {
  const self: Builder = (rng) => {
    const a = randInt(rng, 2, maxFactor)
    const b = randInt(rng, 2, maxFactor)
    if (a === b) return self(rng)
    const distractors = nearMisses(rng, [a, b], tiles - 2, 2, maxFactor + 2, 1)
    return build(rng, { op: "×", pick: 2, target: a * b, solution: [a, b], distractors }, self)
  }
  return self
}

const roundProducts: Builder = (rng) => {
  const target = pick(rng, [120, 144, 180, 240, 360, 420, 480, 720])
  const pairs: [number, number][] = []
  for (let a = 6; a * a < target; a++) if (target % a === 0 && target / a <= 99) pairs.push([a, target / a])
  const [a, b] = pick(rng, pairs)
  const distractors = nearMisses(rng, [a, b], 4, 4, 99, 1)
  return build(rng, { op: "×", pick: 2, target, solution: [a, b], distractors }, roundProducts)
}

const hiddenFactors: Builder = (rng) => {
  const primes = [11, 13, 17, 19, 23, 29, 31, 37]
  const a = pick(rng, primes)
  const b = pick(
    rng,
    primes.filter((p) => p !== a),
  )
  const distractors = shuffle(
    rng,
    [a + 2, a - 2, b + 2, b - 2, a + 4, b + 6, 21, 27, 33, 39].filter((v) => v !== a && v !== b),
  ).slice(0, 4)
  return build(rng, { op: "×", pick: 2, target: a * b, solution: [a, b], distractors }, hiddenFactors)
}

function differenceTo(min: number, max: number): Builder {
  const self: Builder = (rng) => {
    const b = randInt(rng, min, max - 20)
    const target = randInt(rng, 11, Math.min(99, max - b))
    const a = b + target
    if (a > max) return self(rng)
    const distractors = nearMisses(rng, [a, b], 4, min, max, 1)
    return build(rng, { op: "−", pick: 2, target, solution: [a, b], distractors }, self)
  }
  return self
}

const fractionsToOne: Builder = (rng) => {
  const d = pick(rng, [3, 4, 5, 6, 8, 10, 12])
  const n = randInt(rng, 1, d - 1)
  if (2 * n === d) return fractionsToOne(rng)
  const asDecimals = d === 10 || (d === 4 && chance(rng, 0.5)) || (d === 5 && chance(rng, 0.5))
  const pairs: [number, number][] = [[n, d - n]]
  const values = pairs[0].map((k) => k / d)
  const others: number[] = []
  for (let guard = 0; others.length < 4 && guard < 100; guard++) {
    const k = randInt(rng, 1, d - 1)
    const v = k / d + pick(rng, [0, 0, 1 / (d * 2)])
    if (!values.some((x) => Math.abs(x - v) < EPSILON) && !others.some((x) => Math.abs(x - v) < EPSILON) && v < 1) {
      others.push(v)
    }
  }
  if (others.length < 4) return fractionsToOne(rng)
  // Some tiles reduced, some not: 1/3 next to 8/12 needs equivalence.
  const reduce = new Map<number, boolean>()
  const label = (v: number) => {
    if (asDecimals) return fmtDecimal(v, 3)
    if (!reduce.has(v)) reduce.set(v, chance(rng, 0.5))
    if (reduce.get(v)) {
      for (let den = 2; den <= d * 2; den++) {
        const num = v * den
        if (Math.abs(num - Math.round(num)) < EPSILON) return `${Math.round(num)}/${den}`
      }
    }
    for (const den of [d, d * 2]) {
      const num = v * den
      if (Math.abs(num - Math.round(num)) < EPSILON) return `${Math.round(num)}/${den}`
    }
    return fmtDecimal(v, 3)
  }
  return build(
    rng,
    { op: "+", pick: 2, target: 1, solution: values, distractors: others, label, targetLabel: "1" },
    fractionsToOne,
  )
}

const decimalsToOne: Builder = (rng) => {
  const a = randInt(rng, 1, 19) * 5
  if (a === 50) return decimalsToOne(rng)
  const solution = [a / 100, (100 - a) / 100]
  const distractors = nearMisses(rng, [a, 100 - a], 4, 5, 95, 5).map((v) => v / 100)
  return build(
    rng,
    { op: "+", pick: 2, target: 1, solution, distractors, label: (v) => fmtDecimal(v, 2), targetLabel: "1" },
    decimalsToOne,
  )
}

function threeSum(total: number): Builder {
  const self: Builder = (rng) => {
    const a = randInt(rng, 2, total / 2)
    const b = randInt(rng, 2, total - a - 2)
    const c = total - a - b
    if (c < 2 || new Set([a, b, c]).size < 3) return self(rng)
    const distractors = nearMisses(rng, [a, b, c], 3, 1, total - 2, 1)
    return build(rng, { op: "+", pick: 3, target: total, solution: [a, b, c], distractors }, self)
  }
  return self
}

const threeProduct: Builder = (rng) => {
  const a = randInt(rng, 2, 6)
  const b = randInt(rng, 3, 9)
  const c = randInt(rng, 4, 12)
  if (new Set([a, b, c]).size < 3) return threeProduct(rng)
  const distractors = nearMisses(rng, [a, b, c], 3, 2, 14, 1)
  return build(rng, { op: "×", pick: 3, target: a * b * c, solution: [a, b, c], distractors }, threeProduct)
}

const TIERS: Record<number, [Builder, number][]> = {
  1: [[sumTo(10, 4, 1), 1]],
  2: [
    [sumTo(10, 6, 1), 1],
    [sumTo(100, 4, 10), 1],
    [productTo(5, 4), 1],
  ],
  3: [
    [sumTo(100, 4, 1), 2],
    [productTo(9, 4), 2],
  ],
  4: [
    [sumTo(100, 6, 1), 2],
    [productTo(10, 6), 2],
    [differenceTo(20, 99), 1],
  ],
  5: [
    [sumTo(1000, 6, 5), 2],
    [productTo(12, 6), 2],
    [decimalsToOne, 1],
  ],
  6: [
    [fractionsToOne, 2],
    [decimalsToOne, 1],
    [sumTo(1000, 6, 1), 1],
    [differenceTo(100, 400), 1],
  ],
  7: [
    [roundProducts, 2],
    [fractionsToOne, 1],
    [differenceTo(100, 999), 2],
  ],
  8: [
    [threeSum(50), 2],
    [roundProducts, 1],
    [threeSum(100), 1],
  ],
  9: [
    [hiddenFactors, 2],
    [threeSum(100), 1],
    [fractionsToOne, 1],
  ],
  10: [
    [threeProduct, 2],
    [hiddenFactors, 1],
    [threeSum(1000), 1],
  ],
}

export function generateTarget(tier: number, rng: Rng): QuestionDraft {
  return weighted(rng, TIERS[tier])(rng)
}
