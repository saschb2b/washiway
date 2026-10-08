// Ballpark and compare: choose the closest estimate or the bigger quantity.
// Trains rounding, order of magnitude, fraction and decimal magnitude and
// the percentage intuition adults need for prices, rates and statistics.

import { cat, sup } from "../arithmetic"
import { L, fmt, fmtDecimal, roundSignificant } from "../format"
import { type Rng, chance, pick, randInt, weighted } from "../random"
import type { Localized, QuestionDraft, Text } from "../types"

const CLOSEST = L("Closest estimate?", "Beste Schätzung?")
const BIGGER = L("Which is bigger?", "Was ist größer?")
const TAP_BIGGER = L("Tap the bigger one", "Tippe das Größere an")
const EQUAL = L("Both equal", "Beide gleich")

type Draft = Extract<QuestionDraft, { kind: "choice" }>
type Builder = (rng: Rng) => Draft

function fmtNumber(n: number): string {
  return Number.isInteger(n) ? fmt(n) : fmtDecimal(n, 2)
}

// Options around `correct`; rejects sets where another option is as close to
// `actual` as the correct one, so there is always exactly one best answer.
function closestOf(
  display: Text,
  actual: number,
  candidates: number[],
  correct: number,
  explanation: Text,
): Draft | null {
  const options = [...new Set(candidates)].sort((x, y) => x - y)
  const distances = options.map((o) => Math.abs(o - actual))
  const best = Math.min(...distances)
  const answer = options.indexOf(correct)
  if (answer < 0 || distances[answer] !== best || distances.filter((d) => d - best < 1e-9).length > 1) return null
  return { kind: "choice", prompt: CLOSEST, display, options: options.map(fmtNumber), answer, explanation }
}

// Three powers-of-ten neighbours with the right one at a random position.
function magnitudeOptions(rng: Rng, actual: number): { correct: number; candidates: number[] } {
  const correct = roundSignificant(actual, 1)
  const ladder = [correct / 100, correct / 10, correct, correct * 10, correct * 100].filter(
    (x) => x >= 1 && Number.isInteger(x),
  )
  const at = ladder.indexOf(correct)
  const starts = [at - 2, at - 1, at].filter((start) => start >= 0 && start + 3 <= ladder.length)
  const start = pick(rng, starts)
  return { correct, candidates: ladder.slice(start, start + 3) }
}

function nearOptions(rng: Rng, actual: number, spread: number): { correct: number; candidates: number[] } {
  const correct = roundSignificant(actual, 2)
  const step = roundSignificant(correct * spread, 1)
  const shift = randInt(rng, 0, 2)
  const candidates = [-2, -1, 0, 1, 2].slice(shift, shift + 3).map((k) => correct + k * step)
  if (chance(rng, 0.5)) candidates.push(correct + (shift === 2 ? -2 : 2) * step)
  return { correct, candidates: candidates.filter((c) => c > 0) }
}

function retry(builder: Builder, rng: Rng, draft: Draft | null): Draft {
  return draft ?? builder(rng)
}

function compare(a: Text, av: number, b: Text, bv: number, explanation: Text, allowEqual: boolean): Draft {
  const options: Text[] = [a, b]
  let answer: number
  if (Math.abs(av - bv) < 1e-9) {
    options.push(EQUAL)
    answer = 2
  } else {
    answer = av > bv ? 0 : 1
    if (allowEqual) options.push(EQUAL)
  }
  return { kind: "choice", prompt: TAP_BIGGER, display: BIGGER, options, answer, explanation }
}

function ordered<T>(rng: Rng, x: T, y: T): [T, T] {
  return chance(rng, 0.5) ? [x, y] : [y, x]
}

// --- Rounding and order of magnitude -------------------------------------

const sumEstimate: Builder = (rng) => {
  const a = randInt(rng, 12, 89)
  const b = randInt(rng, 12, 89)
  const actual = a + b
  const correct = Math.round(actual / 10) * 10
  const shift = pick(rng, [-40, -20, 0])
  const candidates = [0, 1, 2].map((k) => correct + shift + k * 20)
  const draft = closestOf(`${a} + ${b} ≈`, actual, candidates, correct, `${a} + ${b} = ${actual} ≈ ${correct}`)
  return retry(sumEstimate, rng, draft)
}

const compareSums: Builder = (rng) => {
  const a = randInt(rng, 12, 60)
  const b = randInt(rng, 12, 39)
  const c = randInt(rng, 12, 60)
  const d = a + b - c + pick(rng, [-4, -3, -2, -1, 1, 2, 3, 4])
  if (d < 10 || d > 89) return compareSums(rng)
  const [x, y] = ordered(rng, [`${a} + ${b}`, a + b] as const, [`${c} + ${d}`, c + d] as const)
  return compare(x[0], x[1], y[0], y[1], `${x[0]} = ${x[1]}, ${y[0]} = ${y[1]}`, false)
}

const compareFacts: Builder = (rng) => {
  const pairs: [number, number, number, number][] = [
    [6, 9, 7, 8],
    [7, 7, 6, 8],
    [5, 9, 6, 8],
    [4, 9, 6, 6],
    [8, 8, 7, 9],
    [3, 9, 4, 7],
    [6, 7, 5, 8],
    [9, 9, 8, 10],
    [4, 8, 5, 6],
    [7, 9, 8, 8],
  ]
  const [a, b, c, d] = pick(rng, pairs)
  const [x, y] = ordered(rng, [`${a} × ${b}`, a * b] as const, [`${c} × ${d}`, c * d] as const)
  return compare(x[0], x[1], y[0], y[1], `${x[0]} = ${x[1]}, ${y[0]} = ${y[1]}`, false)
}

function productMagnitude(maxA: number, minB: number, maxB: number): Builder {
  const build: Builder = (rng) => {
    const a = randInt(rng, 3, maxA)
    const b = randInt(rng, minB, maxB)
    const actual = a * b
    const { correct, candidates } = magnitudeOptions(rng, actual)
    const ra = roundSignificant(a, 1)
    const rb = roundSignificant(b, 1)
    const draft = closestOf(
      `${a} × ${b} ≈`,
      actual,
      candidates,
      correct,
      `${fmt(ra)} × ${fmt(rb)} = ${fmt(ra * rb)} (${fmt(actual)})`,
    )
    return retry(build, rng, draft)
  }
  return build
}

function productNear(spread: number, min: number, max: number): Builder {
  const build: Builder = (rng) => {
    const a = randInt(rng, min, max)
    const b = randInt(rng, min, max)
    if (a % 10 === 0 || b % 10 === 0) return build(rng)
    const actual = a * b
    const { correct, candidates } = nearOptions(rng, actual, spread)
    const draft = closestOf(
      `${a} × ${b} ≈`,
      actual,
      candidates,
      correct,
      L(`exactly ${fmt(actual)}`, `genau ${fmt(actual)}`),
    )
    return retry(build, rng, draft)
  }
  return build
}

const bigProducts: Builder = (rng) => {
  const a = randInt(rng, 12, 98) * 100
  const b = randInt(rng, 12, 98) * pick(rng, [10, 100])
  const actual = a * b
  const { correct, candidates } = magnitudeOptions(rng, actual)
  const ra = roundSignificant(a, 1)
  const rb = roundSignificant(b, 1)
  const draft = closestOf(
    `${fmt(a)} × ${fmt(b)} ≈`,
    actual,
    candidates,
    correct,
    `${fmt(ra)} × ${fmt(rb)} = ${fmt(ra * rb)}`,
  )
  return retry(bigProducts, rng, draft)
}

// --- Percentages ----------------------------------------------------------

function percentEstimate(near: boolean): Builder {
  const build: Builder = (rng) => {
    const p = pick(rng, [9, 11, 19, 21, 24, 26, 31, 49, 51, 74, 76])
    const base = randInt(rng, 120, 980)
    const actual = (p * base) / 100
    const options = near ? nearOptions(rng, actual, 0.2) : magnitudeOptions(rng, actual)
    const rp = Math.round(p / 5) * 5
    const rbase = roundSignificant(base, 1)
    const draft = closestOf(
      L(`${p}% of ${base} ≈`, `${p} % von ${base} ≈`),
      actual,
      options.candidates,
      options.correct,
      L(
        `≈ ${rp}% of ${rbase} = ${fmtDecimal((rp * rbase) / 100, 1)} (${fmtDecimal(actual, 2)})`,
        `≈ ${rp} % von ${rbase} = ${fmtDecimal((rp * rbase) / 100, 1)} (${fmtDecimal(actual, 2)})`,
      ),
    )
    return retry(build, rng, draft)
  }
  return build
}

const compoundChange: Builder = (rng) => {
  // [label, factor, the tempting wrong answer]
  const scenarios: [Localized, number, number][] = [
    [L("+20% then −20%", "+20 % dann −20 %"), 1.2 * 0.8, 0],
    [L("+50% then −50%", "+50 % dann −50 %"), 1.5 * 0.5, 0],
    [L("−50% then +50%", "−50 % dann +50 %"), 0.5 * 1.5, 0],
    [L("+10% twice", "zweimal +10 %"), 1.1 * 1.1, 20],
    [L("+25% then −20%", "+25 % dann −20 %"), 1.25 * 0.8, 5],
    [L("−20% then +25%", "−20 % dann +25 %"), 0.8 * 1.25, 5],
    [L("+100% then −50%", "+100 % dann −50 %"), 2 * 0.5, 50],
    [L("−10% twice", "zweimal −10 %"), 0.9 * 0.9, -20],
    [L("+50% twice", "zweimal +50 %"), 1.5 * 1.5, 100],
  ]
  const [label, factor, naive] = pick(rng, scenarios)
  const change = Math.round((factor - 1) * 10000) / 100
  const third = pick(
    rng,
    [-25, -10, -4, -1, 1, 4, 10, 25, 50, 150].filter((c) => c !== change && c !== naive && Math.abs(c - change) <= 50),
  )
  const values = [change, naive, third].sort((x, y) => x - y)
  const signed = (c: number): Localized => {
    const number = `${c > 0 ? "+" : c < 0 ? "−" : "±"}${fmtDecimal(Math.abs(c), 2)}`
    return L(`${number}%`, `${number} %`)
  }
  return {
    kind: "choice",
    prompt: L("Overall change?", "Änderung insgesamt?"),
    display: label,
    options: values.map(signed),
    answer: values.indexOf(change),
    explanation: cat(`× ${fmtDecimal(factor, 4)} → `, signed(change)),
  }
}

// --- Fractions and decimals ----------------------------------------------

function fractionValue(n: number, d: number): string {
  return fmtDecimal(n / d, 4)
}

const compareSimpleFractions: Builder = (rng) => {
  const sameNumerator = chance(rng, 0.5)
  let a: [number, number]
  let b: [number, number]
  if (sameNumerator) {
    const n = randInt(rng, 1, 5)
    const d1 = randInt(rng, n + 1, 12)
    let d2 = randInt(rng, n + 1, 12)
    if (d2 === d1) d2 = d1 + 1
    a = [n, d1]
    b = [n, d2]
  } else {
    const d = randInt(rng, 5, 12)
    const n1 = randInt(rng, 1, d - 1)
    let n2 = randInt(rng, 1, d - 1)
    if (n2 === n1) n2 = n1 === 1 ? 2 : n1 - 1
    a = [n1, d]
    b = [n2, d]
  }
  const [x, y] = ordered(rng, a, b)
  const explanation = sameNumerator
    ? L("same numerator: smaller pieces are worth less", "gleicher Zähler: kleinere Stücke sind weniger wert")
    : L("same denominator: compare the numerators", "gleicher Nenner: Zähler vergleichen")
  return compare(`${x[0]}/${x[1]}`, x[0] / x[1], `${y[0]}/${y[1]}`, y[0] / y[1], explanation, false)
}

const compareAroundHalf: Builder = (rng) => {
  const d1 = randInt(rng, 5, 15)
  const d2 = randInt(rng, 5, 15)
  const below: [number, number] = [randInt(rng, 1, Math.ceil(d1 / 2) - 1), d1]
  const above: [number, number] = [randInt(rng, Math.floor(d2 / 2) + 1, d2 - 1), d2]
  if (below[0] < 1 || above[0] >= d2) return compareAroundHalf(rng)
  const [x, y] = ordered(rng, below, above)
  return compare(
    `${x[0]}/${x[1]}`,
    x[0] / x[1],
    `${y[0]}/${y[1]}`,
    y[0] / y[1],
    L(`${below[0]}/${below[1]} < ½ < ${above[0]}/${above[1]}`, `${below[0]}/${below[1]} < ½ < ${above[0]}/${above[1]}`),
    false,
  )
}

const fractionSum: Builder = (rng) => {
  // Each fraction is close to 0 or to 1; the sum rounds to 0, 1 or 2.
  const near = (high: boolean): [number, number] => {
    const d = randInt(rng, 6, 15)
    return high ? [d - 1, d] : [1, d]
  }
  const [n1, d1] = near(chance(rng, 0.7))
  const [n2, d2] = near(chance(rng, 0.7))
  if (d1 === d2) return fractionSum(rng)
  const actual = n1 / d1 + n2 / d2
  const correct = Math.round(actual)
  const rounded = (n: number, d: number) => Math.round(n / d)
  const draft = closestOf(
    `${n1}/${d1} + ${n2}/${d2} ≈`,
    actual,
    [0, 1, 2, n1 + n2, d1 + d2],
    correct,
    `${n1}/${d1} ≈ ${rounded(n1, d1)}, ${n2}/${d2} ≈ ${rounded(n2, d2)} → ≈ ${correct}`,
  )
  return retry(fractionSum, rng, draft)
}

const compareDecimalFraction: Builder = (rng) => {
  const items: [number, number, number][] = [
    [5, 8, 0.6],
    [1, 3, 0.35],
    [4, 9, 0.45],
    [2, 3, 0.67],
    [7, 9, 0.78],
    [1, 9, 0.11],
    [1, 7, 0.15],
    [3, 7, 0.42],
    [5, 6, 0.83],
    [1, 6, 0.17],
    [3, 8, 0.4],
    [4, 7, 0.57],
    [5, 12, 0.4],
    [11, 16, 0.7],
  ]
  const [n, d, dec] = pick(rng, items)
  const [x, y] = ordered(rng, [`${n}/${d}`, n / d] as const, [fmtDecimal(dec, 2), dec] as const)
  const exact = Number.isInteger((n / d) * 10000)
  return compare(x[0], x[1], y[0], y[1], `${n}/${d} = ${fractionValue(n, d)}${exact ? "" : "…"}`, false)
}

// --- Powers, roots and products that look alike ---------------------------

const comparePowers: Builder = (rng) => {
  const pairs: [number, number, number, number][] = [
    [2, 10, 10, 3],
    [3, 5, 5, 3],
    [2, 7, 5, 3],
    [2, 6, 4, 3],
    [4, 5, 2, 10],
    [3, 4, 9, 2],
    [2, 8, 3, 5],
    [5, 4, 2, 9],
    [10, 2, 2, 7],
    [3, 6, 9, 3],
    [2, 9, 8, 3],
    [6, 3, 3, 5],
  ]
  const [a, m, b, n] = pick(rng, pairs)
  const [x, y] = ordered(rng, [`${a}${sup(m)}`, Math.pow(a, m)] as const, [`${b}${sup(n)}`, Math.pow(b, n)] as const)
  return compare(x[0], x[1], y[0], y[1], `${x[0]} = ${fmt(x[1])}, ${y[0]} = ${fmt(y[1])}`, true)
}

const sqrtEstimate: Builder = (rng) => {
  const n = randInt(rng, 11, 199)
  const k = Math.floor(Math.sqrt(n))
  if (k * k === n) return sqrtEstimate(rng)
  const actual = Math.sqrt(n)
  const correct = Math.round(actual * 10) / 10
  const step = 0.6
  const shift = randInt(rng, 0, 2)
  const candidates = [-2, -1, 0, 1, 2].slice(shift, shift + 3).map((j) => Math.round((correct + j * step) * 10) / 10)
  const draft = closestOf(
    `√${n} ≈`,
    actual,
    candidates,
    correct,
    `${k}² = ${k * k}, ${k + 1}² = ${(k + 1) * (k + 1)} → √${n} ≈ ${fmtDecimal(actual, 2)}`,
  )
  return retry(sqrtEstimate, rng, draft)
}

const compareLookalikes: Builder = (rng) => {
  const kind = randInt(rng, 0, 2)
  if (kind === 0) {
    // Same sum, different spread: the closer pair has the bigger product.
    const m = randInt(rng, 2, 9) * 10
    const k1 = randInt(rng, 1, 5)
    let k2 = randInt(rng, 1, 5)
    if (k2 === k1) k2 = k1 === 5 ? 4 : k1 + 1
    const [x, y] = ordered(
      rng,
      [`${m - k1} × ${m + k1}`, m * m - k1 * k1] as const,
      [`${m - k2} × ${m + k2}`, m * m - k2 * k2] as const,
    )
    return compare(
      x[0],
      x[1],
      y[0],
      y[1],
      `${m}² − ${k1}² = ${fmt(m * m - k1 * k1)}, ${m}² − ${k2}² = ${fmt(m * m - k2 * k2)}`,
      true,
    )
  }
  if (kind === 1) {
    // x% of y = y% of x
    const a = randInt(rng, 2, 9) * 10
    const b = randInt(rng, 2, 9) * 10
    if (a === b) return compareLookalikes(rng)
    const v = (a * b) / 100
    const [x, y] = ordered<[Text, number]>(
      rng,
      [L(`${a}% of ${b}`, `${a} % von ${b}`), v],
      [L(`${b}% of ${a}`, `${b} % von ${a}`), v],
    )
    return compare(x[0], x[1], y[0], y[1], L(`x% of y = y% of x = ${v}`, `x % von y = y % von x = ${v}`), true)
  }
  // Same product, rearranged factors (or not quite).
  const a = randInt(rng, 3, 9) * 2
  const b = randInt(rng, 3, 9) * 5
  const equal = chance(rng, 0.5)
  const c = a / 2
  const d = equal ? b * 2 : b * 2 + pick(rng, [-2, 2])
  const [x, y] = ordered(rng, [`${a} × ${b}`, a * b] as const, [`${c} × ${d}`, c * d] as const)
  return compare(x[0], x[1], y[0], y[1], `${a} × ${b} = ${a * b}, ${c} × ${d} = ${c * d}`, true)
}

const compareSubtle: Builder = (rng) => {
  const items: [Text, number, Text, number, Text][] = [
    ["π", Math.PI, "22/7", 22 / 7, "π = 3.1416…, 22/7 = 3.1429…"],
    ["√10", Math.sqrt(10), "π", Math.PI, "√10 = 3.162…, π = 3.142…"],
    ["2/3", 2 / 3, "0.67", 0.67, "2/3 = 0.666…"],
    ["1/3", 1 / 3, "0.33", 0.33, "1/3 = 0.333…"],
    ["7/9", 7 / 9, "0.78", 0.78, "7/9 = 0.777…"],
    ["1/9", 1 / 9, "0.11", 0.11, "1/9 = 0.111…"],
    ["√2", Math.SQRT2, "1.41", 1.41, "√2 = 1.414…"],
    ["√2 + √2", 2 * Math.SQRT2, "√4", 2, "√2 + √2 = 2.83…, √4 = 2"],
    ["0.1 × 0.1", 0.01, "0.1", 0.1, "0.1 × 0.1 = 0.01"],
    ["1/0.5", 2, "0.5 × 2", 1, "1/0.5 = 2, 0.5 × 2 = 1"],
    ["0.9 × 0.9", 0.81, "0.9", 0.9, "0.9 × 0.9 = 0.81"],
    ["e", Math.E, "2.72", 2.72, "e = 2.718…"],
  ]
  const [a, av, b, bv, explanation] = pick(rng, items)
  const [x, y] = ordered<[Text, number]>(rng, [a, av], [b, bv])
  return compare(x[0], x[1], y[0], y[1], explanation, false)
}

const compareHuge: Builder = (rng) => {
  const items: [string, number, string, number, string][] = [
    ["2³⁰", 30 * Math.log10(2), "10⁹", 9, "2¹⁰ = 1024 > 10³ → 2³⁰ > 10⁹"],
    ["2¹⁰⁰", 100 * Math.log10(2), "10³⁰", 30, "2¹⁰ ≈ 1.024 × 10³ → 2¹⁰⁰ ≈ 1.27 × 10³⁰"],
    ["3²⁰", 20 * Math.log10(3), "10¹⁰", 10, "3² = 9 < 10 → 3²⁰ < 10¹⁰"],
    ["1.01¹⁰⁰", 100 * Math.log10(1.01), "2", Math.log10(2), "1.01¹⁰⁰ ≈ e ≈ 2.7"],
    ["1.1¹⁰", 10 * Math.log10(1.1), "2", Math.log10(2), "1.1¹⁰ ≈ 2.59"],
    ["0.99¹⁰⁰", 100 * Math.log10(0.99), "0.5", Math.log10(0.5), "0.99¹⁰⁰ ≈ 1/e ≈ 0.37"],
    ["99²", 2 * Math.log10(99), "2¹³", 13 * Math.log10(2), "99² = 9801, 2¹³ = 8192"],
    ["5¹⁰", 10 * Math.log10(5), "10⁷", 7, "5¹⁰ = 10¹⁰ ÷ 2¹⁰ ≈ 9.8 × 10⁶"],
  ]
  const [a, av, b, bv, explanation] = pick(rng, items)
  const [x, y] = ordered<[Text, number]>(rng, [a, av], [b, bv])
  return compare(x[0], x[1], y[0], y[1], explanation, false)
}

// --- Fermi-style everyday magnitudes --------------------------------------

const fermi: Builder = (rng) => {
  // `ladder` runs from small to large; `at` marks the right rung.
  const items: { display: Localized | string; ladder: Text[]; at: number; explanation: Text }[] = [
    {
      display: L("Seconds in a day", "Sekunden pro Tag"),
      ladder: [fmt(864), fmt(8640), fmt(86400), fmt(864000), fmt(8640000)],
      at: 2,
      explanation: "60 × 60 × 24 = 86 400",
    },
    {
      display: L("Hours in a year", "Stunden pro Jahr"),
      ladder: [fmt(87), fmt(876), fmt(8760), fmt(87600), fmt(876000)],
      at: 2,
      explanation: "24 × 365 = 8 760",
    },
    {
      display: L("1 million seconds", "1 Million Sekunden"),
      ladder: [
        L("≈ 1 hour", "≈ 1 Stunde"),
        L("≈ 1 day", "≈ 1 Tag"),
        L("≈ 12 days", "≈ 12 Tage"),
        L("≈ 4 months", "≈ 4 Monate"),
        L("≈ 3 years", "≈ 3 Jahre"),
      ],
      at: 2,
      explanation: "1 000 000 ÷ 86 400 ≈ 11.6",
    },
    {
      display: L("1 billion seconds", "1 Milliarde Sekunden"),
      ladder: [
        L("≈ 4 months", "≈ 4 Monate"),
        L("≈ 3 years", "≈ 3 Jahre"),
        L("≈ 32 years", "≈ 32 Jahre"),
        L("≈ 320 years", "≈ 320 Jahre"),
        L("≈ 3 200 years", "≈ 3 200 Jahre"),
      ],
      at: 2,
      explanation: L("1 000 000 000 s ÷ 31.5 million s per year ≈ 32", "1 000 000 000 s ÷ 31,5 Mio. s pro Jahr ≈ 32"),
    },
    {
      display: L("Days in 80 years", "Tage in 80 Jahren"),
      ladder: [fmt(290), fmt(2900), fmt(29000), fmt(290000), fmt(2900000)],
      at: 2,
      explanation: "80 × 365 = 29 200",
    },
    {
      display: L("Heartbeats per day (70/min)", "Herzschläge pro Tag (70/min)"),
      ladder: [fmt(1000), fmt(10000), fmt(100000), fmt(1000000), fmt(10000000)],
      at: 2,
      explanation: "70 × 60 × 24 = 100 800",
    },
    {
      display: "2²⁰",
      ladder: [fmt(10000), fmt(100000), fmt(1000000), fmt(10000000), fmt(100000000)],
      at: 2,
      explanation: "2¹⁰ ≈ 1 000 → 2²⁰ ≈ 1 000 000 (1 048 576)",
    },
    {
      display: L("Minutes in a week", "Minuten pro Woche"),
      ladder: [fmt(100), fmt(1000), fmt(10000), fmt(100000), fmt(1000000)],
      at: 2,
      explanation: "60 × 24 × 7 = 10 080",
    },
    {
      display: L("Steps for 10 km (75 cm each)", "Schritte für 10 km (je 75 cm)"),
      ladder: [fmt(130), fmt(1300), fmt(13000), fmt(130000), fmt(1300000)],
      at: 2,
      explanation: "10 000 m ÷ 0.75 m ≈ 13 333",
    },
  ]
  const item = pick(rng, items)
  const start = item.at - randInt(rng, 0, 2)
  return {
    kind: "choice",
    prompt: L("Best ballpark?", "Beste Größenordnung?"),
    display: item.display,
    options: item.ladder.slice(start, start + 3),
    answer: item.at - start,
    explanation: item.explanation,
  }
}

const TIERS: Record<number, [Builder, number][]> = {
  1: [
    [sumEstimate, 2],
    [compareSums, 2],
  ],
  2: [
    [productMagnitude(9, 12, 98), 2],
    [compareFacts, 2],
    [sumEstimate, 1],
  ],
  3: [
    [productMagnitude(9, 12, 98), 1],
    [productMagnitude(98, 12, 98), 2],
    [compareSimpleFractions, 2],
    [compareFacts, 1],
  ],
  4: [
    [productNear(0.25, 12, 99), 2],
    [percentEstimate(false), 2],
    [compareAroundHalf, 2],
  ],
  5: [
    [fractionSum, 2],
    [compareDecimalFraction, 2],
    [productNear(0.25, 12, 99), 1],
    [percentEstimate(false), 1],
  ],
  6: [
    [percentEstimate(true), 2],
    [sqrtEstimate, 2],
    [comparePowers, 2],
    [compareDecimalFraction, 1],
  ],
  7: [
    [compareLookalikes, 3],
    [productNear(0.15, 12, 99), 2],
    [bigProducts, 1],
    [sqrtEstimate, 1],
  ],
  8: [
    [compoundChange, 2],
    [compareSubtle, 2],
    [percentEstimate(true), 1],
    [compareLookalikes, 1],
  ],
  9: [
    [fermi, 2],
    [bigProducts, 2],
    [compoundChange, 1],
    [compareSubtle, 1],
  ],
  10: [
    [productNear(0.04, 21, 99), 3],
    [compareHuge, 2],
    [fermi, 1],
    [compareSubtle, 1],
  ],
}

export function generateEstimate(tier: number, rng: Rng): QuestionDraft {
  const draft = weighted(rng, TIERS[tier])(rng)
  return { ...draft, explanation: cat(draft.explanation) }
}
