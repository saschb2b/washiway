// Mental-arithmetic building blocks shared by several skills. Each builder
// returns an expression, its value, and a worked strategy for the feedback.
// The tiers form a ladder from making ten up to two-digit products and
// multi-step chains; the strategies (compensation, near squares, halving and
// doubling, ...) are the ones fluent mental calculators actually use.

import { L, MINUS, fmt, gcd } from "./format"
import { type Rng, chance, pick, randInt, weighted } from "./random"
import type { Text } from "./types"

export type CalcOp = "+" | "−" | "×" | "÷" | "%" | "other"

export interface Calc {
  expr: Text
  value: number
  explain: Text
  op: CalcOp
  // Plain operands for "a op b" expressions; used to build checkable lures.
  a?: number
  b?: number
}

type CalcBuilder = (rng: Rng) => Calc

export function cat(...parts: Text[]): Text {
  if (parts.every((p) => typeof p === "string")) return parts.join("")
  return {
    en: parts.map((p) => (typeof p === "string" ? p : p.en)).join(""),
    de: parts.map((p) => (typeof p === "string" ? p : p.de)).join(""),
  }
}

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹"
export function sup(n: number): string {
  return String(n)
    .split("")
    .map((d) => SUPERSCRIPT[Number(d)])
    .join("")
}

const f = fmt

function binary(a: number, op: "+" | "−" | "×" | "÷", b: number, value: number, explain: Text): Calc {
  return { expr: `${f(a)} ${op} ${f(b)}`, value, explain, op, a, b }
}

// --- Addition and subtraction -------------------------------------------

const makeTen: CalcBuilder = (rng) => {
  const a = randInt(rng, 3, 9)
  const b = randInt(rng, Math.max(2, 11 - a), 9)
  const toTen = 10 - a
  return binary(a, "+", b, a + b, `${a} + ${toTen} = 10, 10 + ${b - toTen} = ${a + b}`)
}

const backToTen: CalcBuilder = (rng) => {
  const b = randInt(rng, 3, 9)
  const a = randInt(rng, 11, b + 9)
  const toTen = a - 10
  return binary(a, "−", b, a - b, `${a} − ${toTen} = 10, 10 − ${b - toTen} = ${a - b}`)
}

const addAcrossTen: CalcBuilder = (rng) => {
  const units = randInt(rng, 3, 9)
  const a = randInt(rng, 1, 8) * 10 + units
  const b = randInt(rng, 11 - units, 9)
  const step = 10 - units
  return binary(a, "+", b, a + b, `${a} + ${step} = ${a + step}, ${a + step} + ${b - step} = ${a + b}`)
}

const subAcrossTen: CalcBuilder = (rng) => {
  const units = randInt(rng, 1, 6)
  const a = randInt(rng, 2, 9) * 10 + units
  const b = randInt(rng, units + 1, 9)
  return binary(a, "−", b, a - b, `${a} − ${units} = ${a - units}, ${a - units} − ${b - units} = ${a - b}`)
}

function bondTo(total: 100 | 1000): CalcBuilder {
  return (rng) => {
    const b = total === 100 ? randInt(rng, 11, 89) : randInt(rng, 21, 179) * 5
    if (b % (total / 10) === 0) return bondTo(total)(rng)
    const step = total / 10
    const up = Math.ceil(b / step) * step
    const value = total - b
    return binary(
      total,
      "−",
      b,
      value,
      `${f(b)} + ${up - b} = ${f(up)}, ${f(up)} + ${f(total - up)} = ${f(total)} → ${up - b} + ${f(total - up)} = ${f(value)}`,
    )
  }
}

const addTwoDigit: CalcBuilder = (rng) => {
  const a = randInt(rng, 12, 89)
  const b = randInt(rng, 12, 89)
  const units = b % 10
  if (units >= 7) {
    const up = b + 10 - units
    return binary(a, "+", b, a + b, `${a} + ${up} = ${a + up}, ${a + up} − ${up - b} = ${a + b}`)
  }
  const tens = b - units
  if (units === 0) return addTwoDigit(rng)
  return binary(a, "+", b, a + b, `${a} + ${tens} = ${a + tens}, ${a + tens} + ${units} = ${a + b}`)
}

const subTwoDigit: CalcBuilder = (rng) => {
  const a = randInt(rng, 41, 98)
  const b = randInt(rng, 12, a - 5)
  const units = b % 10
  if (units === 0) return subTwoDigit(rng)
  const up = b + 10 - units
  if (units >= 6 && up <= a) {
    return binary(a, "−", b, a - b, `${a} − ${up} = ${a - up}, ${a - up} + ${up - b} = ${a - b}`)
  }
  const tens = b - units
  return binary(a, "−", b, a - b, `${a} − ${tens} = ${a - tens}, ${a - tens} − ${units} = ${a - b}`)
}

const addThreeDigit: CalcBuilder = (rng) => {
  const a = randInt(rng, 120, 799)
  const b = randInt(rng, 110, 899)
  const rest = b % 100
  if (rest < 10) return addThreeDigit(rng)
  const v = a + b
  if (rest >= 70) {
    const up = b + 100 - rest
    return binary(a, "+", b, v, `${a} + ${up} = ${f(a + up)}, ${f(a + up)} − ${up - b} = ${f(v)}`)
  }
  const hundreds = b - rest
  return binary(a, "+", b, v, `${a} + ${hundreds} = ${f(a + hundreds)}, ${f(a + hundreds)} + ${rest} = ${f(v)}`)
}

const subThreeDigit: CalcBuilder = (rng) => {
  const a = randInt(rng, 400, 999)
  const b = randInt(rng, 110, a - 50)
  const rest = b % 100
  if (rest < 10) return subThreeDigit(rng)
  const up = b + 100 - rest
  if (rest >= 70 && up <= a) {
    return binary(a, "−", b, a - b, `${a} − ${up} = ${a - up}, ${a - up} + ${up - b} = ${a - b}`)
  }
  const hundreds = b - rest
  return binary(a, "−", b, a - b, `${a} − ${hundreds} = ${a - hundreds}, ${a - hundreds} − ${rest} = ${a - b}`)
}

const negatives: CalcBuilder = (rng) => {
  const kind = randInt(rng, 0, 3)
  if (kind === 0) {
    const a = randInt(rng, 5, 40)
    const b = randInt(rng, a + 3, a + 50)
    return binary(a, "−", b, a - b, `${b} − ${a} = ${b - a} → ${f(a - b)}`)
  }
  if (kind === 1) {
    const a = randInt(rng, 4, 30)
    const b = randInt(rng, 3, 40)
    return {
      expr: `${MINUS}${a} + ${b}`,
      value: b - a,
      explain: `${b} − ${a} = ${f(b - a)}`,
      op: "+",
    }
  }
  const a = randInt(rng, 2, 12)
  const b = randInt(rng, 2, 12)
  if (kind === 2) {
    return {
      expr: `(${MINUS}${a}) × ${b}`,
      value: -a * b,
      explain: cat(L("minus × plus = minus", "Minus mal Plus = Minus"), `: ${f(-a * b)}`),
      op: "×",
    }
  }
  return {
    expr: `(${MINUS}${a}) × (${MINUS}${b})`,
    value: a * b,
    explain: cat(L("minus × minus = plus", "Minus mal Minus = Plus"), `: ${a * b}`),
    op: "×",
  }
}

// --- Times tables and division --------------------------------------------

function tableStrategy(a: number, b: number): string {
  const [x, y] = [a, b]
  const has = (n: number) => x === n || y === n
  const other = (n: number) => (x === n ? y : x)
  const v = a * b
  if (has(10)) return `${a} × ${b} = ${v}`
  if (has(2)) return `${other(2)} + ${other(2)} = ${v}`
  if (has(5)) return `${other(5)} × 10 ÷ 2 = ${other(5) * 10} ÷ 2 = ${v}`
  if (has(9)) return `${other(9)} × 10 − ${other(9)} = ${other(9) * 10} − ${other(9)} = ${v}`
  if (has(4)) return `${other(4)} × 2 × 2 = ${other(4) * 2} × 2 = ${v}`
  if (has(11)) return `${other(11)} × 10 + ${other(11)} = ${v}`
  if (has(12)) return `${other(12)} × 10 + ${other(12)} × 2 = ${other(12) * 10} + ${other(12) * 2} = ${v}`
  if (has(8)) {
    const n = other(8)
    return `${n} → ${n * 2} → ${n * 4} → ${v}`
  }
  if (has(6)) return `${other(6)} × 5 + ${other(6)} = ${other(6) * 5} + ${other(6)} = ${v}`
  if (has(3)) return `${other(3)} × 2 + ${other(3)} = ${other(3) * 2} + ${other(3)} = ${v}`
  // Only 7 × 7 is left.
  return `${a} × ${b - 1} + ${a} = ${a * (b - 1)} + ${a} = ${v}`
}

function timesTable(maxFactor: number, factors?: number[]): CalcBuilder {
  return (rng) => {
    const a = factors ? pick(rng, factors) : randInt(rng, 2, maxFactor)
    const b = randInt(rng, 2, maxFactor)
    if (a <= 2 && b <= 2) return timesTable(maxFactor, factors)(rng)
    const [x, y] = chance(rng, 0.5) ? [a, b] : [b, a]
    return binary(x, "×", y, x * y, tableStrategy(x, y))
  }
}

function divisionFacts(maxFactor: number): CalcBuilder {
  return (rng) => {
    const divisor = randInt(rng, 2, maxFactor)
    const quotient = randInt(rng, 2, maxFactor)
    const n = divisor * quotient
    return binary(n, "÷", divisor, quotient, `${divisor} × ${quotient} = ${n} → ${quotient}`)
  }
}

const doubleOrHalve: CalcBuilder = (rng) => {
  if (chance(rng, 0.5)) {
    const x = randInt(rng, 13, 49)
    if (x % 10 === 0) return doubleOrHalve(rng)
    const tens = x - (x % 10)
    const units = x % 10
    return binary(2, "×", x, 2 * x, `2 × ${tens} + 2 × ${units} = ${2 * tens} + ${2 * units} = ${2 * x}`)
  }
  const n = randInt(rng, 15, 49) * 2
  const big = Math.floor(n / 20) * 20
  const rest = n - big
  const explain = rest === 0 ? `${n} ÷ 2 = ${n / 2}` : `${big} ÷ 2 + ${rest} ÷ 2 = ${big / 2} + ${rest / 2} = ${n / 2}`
  return binary(n, "÷", 2, n / 2, explain)
}

const twoDigitByOne: CalcBuilder = (rng) => {
  const a = randInt(rng, 13, 98)
  const b = randInt(rng, 3, 9)
  const units = a % 10
  if (units === 0) return twoDigitByOne(rng)
  const tens = a - units
  const v = a * b
  return binary(a, "×", b, v, `${tens} × ${b} + ${units} × ${b} = ${tens * b} + ${units * b} = ${v}`)
}

const timesFive: CalcBuilder = (rng) => {
  const a = randInt(rng, 7, 49) * 2
  return binary(a, "×", 5, a * 5, `${a} × 10 ÷ 2 = ${a * 10} ÷ 2 = ${a * 5}`)
}

const timesNine: CalcBuilder = (rng) => {
  const a = randInt(rng, 13, 99)
  return binary(a, "×", 9, a * 9, `${a} × 10 − ${a} = ${a * 10} − ${a} = ${a * 9}`)
}

const timesEleven: CalcBuilder = (rng) => {
  const a = randInt(rng, 12, 99)
  const [d1, d2] = [Math.floor(a / 10), a % 10]
  const v = a * 11
  if (d1 + d2 < 10) {
    return binary(a, "×", 11, v, `${d1} (${d1} + ${d2}) ${d2} → ${v}`)
  }
  return binary(a, "×", 11, v, `${a} × 10 + ${a} = ${a * 10} + ${a} = ${f(v)}`)
}

const timesTwentyFive: CalcBuilder = (rng) => {
  const a = randInt(rng, 3, 24) * 4
  return binary(a, "×", 25, a * 25, `${a} ÷ 4 × 100 = ${a / 4} × 100 = ${f(a * 25)}`)
}

const twoDigitQuotient: CalcBuilder = (rng) => {
  const divisor = randInt(rng, 2, 9)
  const quotient = randInt(rng, 11, Math.floor(99 / divisor))
  if (quotient < 11) return twoDigitQuotient(rng)
  const n = divisor * quotient
  const big = divisor * 10 * Math.floor(quotient / 10)
  const rest = n - big
  const explain =
    rest === 0
      ? `${n} ÷ ${divisor} = ${quotient}`
      : `${big} ÷ ${divisor} + ${rest} ÷ ${divisor} = ${big / divisor} + ${rest / divisor} = ${quotient}`
  return binary(n, "÷", divisor, quotient, explain)
}

const threeDigitQuotient: CalcBuilder = (rng) => {
  const divisor = randInt(rng, 3, 9)
  const quotient = randInt(rng, Math.ceil(100 / divisor), Math.floor(999 / divisor))
  const n = divisor * quotient
  const big = divisor * 10 * Math.floor(quotient / 10)
  const rest = n - big
  const explain =
    rest === 0
      ? `${n} ÷ ${divisor} = ${quotient}`
      : `${big} ÷ ${divisor} + ${rest} ÷ ${divisor} = ${big / divisor} + ${rest / divisor} = ${quotient}`
  return binary(n, "÷", divisor, quotient, explain)
}

const threeDigitByOne: CalcBuilder = (rng) => {
  const a = randInt(rng, 112, 999)
  const b = randInt(rng, 3, 9)
  const parts = [a - (a % 100), (a % 100) - (a % 10), a % 10].filter((p) => p > 0)
  const v = a * b
  const products = parts.map((p) => p * b)
  return binary(
    a,
    "×",
    b,
    v,
    `${parts.map((p) => `${p} × ${b}`).join(" + ")} = ${products.map((p) => f(p)).join(" + ")} = ${f(v)}`,
  )
}

// --- Squares, near squares and friends -----------------------------------

function squareStrategy(n: number): string {
  const v = n * n
  if (n % 10 === 5) {
    const t = (n - 5) / 10
    return `${t} × ${t + 1} = ${t * (t + 1)} | 25 → ${f(v)}`
  }
  const d = Math.min(n % 10, 10 - (n % 10))
  return `${n - d} × ${n + d} + ${d}² = ${f((n - d) * (n + d))} + ${d * d} = ${f(v)}`
}

function squares(min: number, max: number): CalcBuilder {
  return (rng) => {
    const n = randInt(rng, min, max)
    if (n % 10 === 0) return squares(min, max)(rng)
    return { expr: `${n}²`, value: n * n, explain: squareStrategy(n), op: "×", a: n, b: n }
  }
}

const squaresEndingInFive: CalcBuilder = (rng) => {
  const n = randInt(rng, 1, 9) * 10 + 5
  return { expr: `${n}²`, value: n * n, explain: squareStrategy(n), op: "×", a: n, b: n }
}

const nearSquares: CalcBuilder = (rng) => {
  const m = randInt(rng, 2, 9) * 10
  const k = randInt(rng, 1, 4)
  const [a, b] = chance(rng, 0.5) ? [m - k, m + k] : [m + k, m - k]
  const v = m * m - k * k
  return binary(a, "×", b, v, `${m}² − ${k}² = ${f(m * m)} − ${k * k} = ${f(v)}`)
}

const timesNinetyNine: CalcBuilder = (rng) => {
  const a = randInt(rng, 13, 99)
  if (chance(rng, 0.6)) {
    return binary(a, "×", 99, a * 99, `${a} × 100 − ${a} = ${f(a * 100)} − ${a} = ${f(a * 99)}`)
  }
  return binary(a, "×", 101, a * 101, `${a} × 100 + ${a} = ${f(a * 100)} + ${a} = ${f(a * 101)}`)
}

const halveAndDouble: CalcBuilder = (rng) => {
  const b = pick(rng, [15, 25, 35, 45])
  const a = randInt(rng, 6, 24) * 2
  const v = a * b
  return binary(
    a,
    "×",
    b,
    v,
    L(`Halve & double: ${a / 2} × ${b * 2} = ${f(v)}`, `Halbieren & Verdoppeln: ${a / 2} × ${b * 2} = ${f(v)}`),
  )
}

function twoDigitProduct(min: number, maxA: number, maxB: number): CalcBuilder {
  const build: CalcBuilder = (rng) => {
    const a = randInt(rng, min, maxA)
    const b = randInt(rng, min, maxB)
    if (a % 10 === 0 || b % 10 === 0) return build(rng)
    const v = a * b
    const units = b % 10
    if (units >= 8) {
      const up = b + 10 - units
      return binary(a, "×", b, v, `${a} × ${up} − ${a} × ${up - b} = ${f(a * up)} − ${a * (up - b)} = ${f(v)}`)
    }
    const tens = b - units
    return binary(a, "×", b, v, `${a} × ${tens} + ${a} × ${units} = ${f(a * tens)} + ${a * units} = ${f(v)}`)
  }
  return build
}

const powers: CalcBuilder = (rng) => {
  const [base, exponent] = pick(rng, [
    [2, randInt(rng, 5, 13)],
    [3, randInt(rng, 3, 8)],
    [4, randInt(rng, 3, 6)],
    [5, randInt(rng, 3, 5)],
    [6, randInt(rng, 3, 4)],
    [7, randInt(rng, 3, 4)],
  ])
  const v = Math.pow(base, exponent)
  const prev = Math.pow(base, exponent - 1)
  return {
    expr: `${base}${sup(exponent)}`,
    value: v,
    explain: `${base}${sup(exponent - 1)} × ${base} = ${f(prev)} × ${base} = ${f(v)}`,
    op: "×",
  }
}

const cubes: CalcBuilder = (rng) => {
  const n = randInt(rng, 4, 21)
  if (n % 10 === 0) return cubes(rng)
  const v = n * n * n
  return { expr: `${n}³`, value: v, explain: `${n}² × ${n} = ${n * n} × ${n} = ${f(v)}`, op: "×" }
}

// --- Percentages and fractions of amounts --------------------------------

function percentOf(p: number, base: number, value: number, explain: Text): Calc {
  return {
    expr: L(`${p}% of ${f(base)}`, `${p} % von ${f(base)}`),
    value,
    explain,
    op: "%",
  }
}

const easyPercent: CalcBuilder = (rng) => {
  const p = pick(rng, [10, 50, 25, 20])
  if (p === 10) {
    const base = randInt(rng, 3, 99) * 10
    return percentOf(p, base, base / 10, `10% = ${f(base)} ÷ 10 = ${base / 10}`)
  }
  if (p === 50) {
    const base = randInt(rng, 10, 499) * 2
    return percentOf(p, base, base / 2, `50% = ½ → ${f(base)} ÷ 2 = ${base / 2}`)
  }
  if (p === 25) {
    const base = randInt(rng, 10, 100) * 4
    return percentOf(p, base, base / 4, `25% = ¼ → ${base} ÷ 4 = ${base / 4}`)
  }
  const base = randInt(rng, 5, 50) * 10
  return percentOf(p, base, base / 5, `10% = ${base / 10}, × 2 = ${base / 5}`)
}

const mediumPercent: CalcBuilder = (rng) => {
  const p = pick(rng, [5, 15, 30, 40, 60, 75])
  if (p === 5 || p === 15) {
    const base = randInt(rng, 2, 30) * 20
    const tenth = base / 10
    if (p === 5) return percentOf(p, base, base / 20, `10% = ${tenth}, 5% = ${tenth} ÷ 2 = ${base / 20}`)
    return percentOf(p, base, (base * 3) / 20, `10% = ${tenth}, 5% = ${base / 20} → ${(base * 3) / 20}`)
  }
  if (p === 75) {
    const base = randInt(rng, 4, 60) * 4
    return percentOf(p, base, (base * 3) / 4, `75% = ¾ → ${base} ÷ 4 = ${base / 4}, × 3 = ${(base * 3) / 4}`)
  }
  const base = randInt(rng, 3, 60) * 10
  const v = (base * p) / 100
  return percentOf(p, base, v, `10% = ${base / 10}, × ${p / 10} = ${v}`)
}

const hardPercent: CalcBuilder = (rng) => {
  const p = pick(rng, [12, 35, 45, 120, 150])
  if (p === 150) {
    const base = randInt(rng, 6, 300) * 2
    return percentOf(p, base, base * 1.5, `${f(base)} + ${f(base / 2)} = ${f(base * 1.5)}`)
  }
  if (p === 120) {
    const base = randInt(rng, 4, 200) * 5
    return percentOf(p, base, (base * 6) / 5, `100% = ${f(base)}, 20% = ${base / 5} → ${f((base * 6) / 5)}`)
  }
  // 12%, 35% and 45% split into a tens part and a units part.
  const step = p === 12 ? 25 : 20
  const base = randInt(rng, 2, 20) * step
  const v = (base * p) / 100
  const tens = p - (p % 10)
  const units = p % 10
  const tensPart = (base * tens) / 100
  const unitsPart = (base * units) / 100
  return percentOf(p, base, v, `${tens}% = ${tensPart}, ${units}% = ${unitsPart} → ${v}`)
}

const swappedPercent: CalcBuilder = (rng) => {
  const b = pick(rng, [25, 50, 20])
  const step = b === 25 ? 4 : b === 50 ? 2 : 5
  const a = randInt(rng, 2, Math.floor(98 / step)) * step
  const v = (a * b) / 100
  return {
    expr: L(`${a}% of ${b}`, `${a} % von ${b}`),
    value: v,
    explain: L(`= ${b}% of ${a} = ${v}`, `= ${b} % von ${a} = ${v}`),
    op: "%",
  }
}

const fractionOfAmount: CalcBuilder = (rng) => {
  const d = pick(rng, [3, 4, 5, 6, 8])
  const n = randInt(rng, 1, d - 1)
  if (gcd(n, d) !== 1) return fractionOfAmount(rng)
  const k = randInt(rng, 3, 15)
  const base = d * k
  return {
    expr: L(`${n}/${d} of ${base}`, `${n}/${d} von ${base}`),
    value: n * k,
    explain: n === 1 ? `${base} ÷ ${d} = ${k}` : `${base} ÷ ${d} = ${k}, × ${n} = ${n * k}`,
    op: "other",
  }
}

// --- Chains: several steps held in your head ------------------------------

function chain(steps: number, allowSquare: boolean): CalcBuilder {
  const build: CalcBuilder = (rng) => {
    let current = randInt(rng, 3, 12)
    const start = current
    const shown: string[] = [String(start)]
    const worked: string[] = []
    let lastKind = ""
    let lastOperand = 0
    for (let i = 0; i < steps; i++) {
      const options: [string, number][] = []
      if (lastKind !== "×" && current <= 40) options.push(["×", 3])
      if (lastKind !== "+") options.push(["+", 2])
      if (lastKind !== "−" && current > 6) options.push(["−", 2])
      // Never undo the previous step (×5 then ÷5).
      const divisors = [2, 3, 4, 5, 6, 7, 8, 9].filter(
        (d) => current % d === 0 && current / d >= 2 && !(lastKind === "×" && d === lastOperand),
      )
      if (lastKind !== "÷" && divisors.length > 0) options.push(["÷", 4])
      if (allowSquare && lastKind !== "²" && current <= 15) options.push(["²", 1])
      const kind = weighted(rng, options)
      let next = current
      let label = ""
      if (kind === "×") {
        const k = randInt(rng, 2, Math.min(9, Math.floor(200 / current)))
        next = current * k
        label = `×${k}`
        lastOperand = k
      } else if (kind === "+") {
        const k = randInt(rng, 2, 30)
        next = current + k
        label = `+${k}`
        lastOperand = k
      } else if (kind === "−") {
        const k = randInt(rng, 2, current - 2)
        if (lastKind === "+" && k === lastOperand) return build(rng)
        next = current - k
        label = `${MINUS}${k}`
      } else if (kind === "÷") {
        const k = pick(rng, divisors)
        next = current / k
        label = `÷${k}`
      } else {
        next = current * current
        label = "²"
      }
      shown.push(label)
      worked.push(kind === "²" ? `${current}² = ${next}` : `${label.replace(/^(.)/, "$1 ")} = ${next}`)
      current = next
      lastKind = kind
    }
    if (current > 999) return build(rng)
    return {
      expr: shown.join(" → "),
      value: current,
      explain: `${start} ${worked.join(", ")}`,
      op: "other",
    }
  }
  return build
}

// --- The ladder ---------------------------------------------------------

const TIERS: Record<number, [CalcBuilder, number][]> = {
  1: [
    [makeTen, 3],
    [backToTen, 2],
  ],
  2: [
    [addAcrossTen, 2],
    [subAcrossTen, 2],
    [timesTable(5, [2, 3, 4, 5, 10]), 2],
    [doubleOrHalve, 1],
    [makeTen, 1],
  ],
  3: [
    [timesTable(10), 3],
    [divisionFacts(10), 2],
    [bondTo(100), 2],
    [addTwoDigit, 2],
    [doubleOrHalve, 1],
  ],
  4: [
    [subTwoDigit, 2],
    [timesTable(12), 2],
    [divisionFacts(12), 2],
    [addTwoDigit, 1],
    [bondTo(100), 1],
  ],
  5: [
    [twoDigitByOne, 2],
    [timesFive, 1],
    [timesNine, 1],
    [timesEleven, 1],
    [twoDigitQuotient, 2],
    [easyPercent, 2],
    [negatives, 1],
    [bondTo(1000), 1],
  ],
  6: [
    [squares(11, 19), 1],
    [squaresEndingInFive, 1],
    [timesTwentyFive, 1],
    [mediumPercent, 2],
    [fractionOfAmount, 2],
    [negatives, 1],
    [twoDigitByOne, 1],
    [twoDigitQuotient, 1],
  ],
  7: [
    [nearSquares, 2],
    [timesNinetyNine, 1],
    [halveAndDouble, 1],
    [addThreeDigit, 1],
    [subThreeDigit, 1],
    [fractionOfAmount, 1],
    [mediumPercent, 1],
  ],
  8: [
    [twoDigitProduct(12, 49, 39), 2],
    [squares(21, 32), 1],
    [hardPercent, 2],
    [chain(3, false), 2],
    [nearSquares, 1],
  ],
  9: [
    [swappedPercent, 1],
    [chain(4, false), 2],
    [threeDigitByOne, 2],
    [threeDigitQuotient, 2],
    [powers, 1],
    [twoDigitProduct(12, 49, 39), 1],
  ],
  10: [
    [twoDigitProduct(23, 99, 99), 3],
    [squares(33, 99), 2],
    [cubes, 1],
    [chain(4, true), 2],
    [threeDigitByOne, 1],
    [swappedPercent, 1],
  ],
}

export function drawCalc(tier: number, rng: Rng): Calc {
  return weighted(rng, TIERS[tier])(rng)
}

// Plain products for skills that need "a × b" specifically (estimation, lures).
export const products = {
  twoDigitByOne,
  twoDigit: twoDigitProduct(12, 99, 99),
  nearSquares,
}
