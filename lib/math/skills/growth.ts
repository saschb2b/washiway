// Grow & shrink: a feel for repeated percentage change. People tend to think
// of compound growth as if it were linear ("exponential growth bias"); this
// skill trains the pieces underneath interest, loans and saving without
// talking about money: percent as a factor, changes in a row, getting back
// after a drop, doubling times, percent vs. percentage points, and what
// happens when something grows while a fixed amount is added or removed.

import { cat, sup } from "../arithmetic"
import { L, fmt, fmtDecimal, gcd, roundSignificant } from "../format"
import { type Rng, chance, pick, randInt, shuffle, weighted } from "../random"
import type { Localized, QuestionDraft, Text } from "../types"
import { closestOf, compare } from "./estimate"

type Draft = QuestionDraft
type Builder = (rng: Rng) => Draft

const RESULT = L("Type the result", "Tippe das Ergebnis")
const BEFORE = L("What was it before?", "Was war es vorher?")
const TRUE_FALSE = L("True or false?", "Stimmt das?")

// "+25%" / "+25 %", with a proper minus and ± for zero.
function pct(n: number, places = 1): Localized {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "±"
  const number = `${sign}${fmtDecimal(Math.abs(n), places)}`
  return L(`${number}%`, `${number} %`)
}

function factor(f: number): string {
  return `×${fmtDecimal(f, 4)}`
}

function typed(prompt: Localized, display: Text, answer: number, explanation: Text): Draft {
  return { kind: "number", prompt, display, answer, explanation }
}

function choice(prompt: Localized, display: Text, options: Text[], answer: number, explanation: Text): Draft {
  return { kind: "choice", prompt, display, options, answer, explanation }
}

// Options in random order, the first one being the right answer.
function shuffled(prompt: Localized, display: Text, right: Text, wrong: Text[], explanation: Text, rng: Rng): Draft {
  const options = shuffle(rng, [right, ...wrong])
  return choice(prompt, display, options, options.indexOf(right), explanation)
}

// --- Doubling and halving ------------------------------------------------

const doublingChain: Builder = (rng) => {
  const steps = randInt(rng, 2, 4)
  if (chance(rng, 0.5)) {
    const start = randInt(rng, 2, 9)
    const values = Array.from({ length: steps + 1 }, (_, i) => start * 2 ** i)
    return typed(RESULT, `${start}${" → ×2".repeat(steps)} = ?`, values[steps], values.join(" → "))
  }
  const end = randInt(rng, 2, 9)
  const start = end * 2 ** steps
  const values = Array.from({ length: steps + 1 }, (_, i) => start / 2 ** i)
  return typed(RESULT, `${start}${" → ÷2".repeat(steps)} = ?`, end, values.join(" → "))
}

const plusHundredPercent: Builder = (rng) => {
  if (chance(rng, 0.5)) {
    const base = randInt(rng, 6, 60)
    return typed(
      RESULT,
      cat(`${base} → `, pct(100), " = ?"),
      base * 2,
      L(`+100% = ×2 → ${base * 2}`, `+100 % = ×2 → ${base * 2}`),
    )
  }
  const base = randInt(rng, 4, 60) * 2
  return typed(RESULT, cat(`${base} → `, pct(50), " = ?"), base * 1.5, `${base} + ${base / 2} = ${base * 1.5}`)
}

// --- Percent as a factor ---------------------------------------------------

const percentToFactor: Builder = (rng) => {
  const p = pick(rng, [10, 20, 25, 5, 50, 100, -10, -20, -25, -50, 3, -5])
  const size = Math.abs(p) / 100
  const right = 1 + p / 100
  // Typical slips: the percent alone (×0.2), the wrong direction, a misplaced decimal.
  const slips = p === 100 ? [1.1, 100] : p > 0 ? [size, 1 + size / 10, 1 - size] : [size, 1 + size, 1 - size / 10]
  const wrong = [...new Set(slips.filter((w) => Math.abs(w - right) > 1e-9 && w > 0))].slice(0, 2)
  const sign = p > 0 ? "+" : "−"
  return shuffled(
    L("Same change as a factor?", "Dieselbe Änderung als Faktor?"),
    cat(pct(p, 0), " = ×?"),
    factor(right),
    wrong.map(factor),
    L(
      `${sign}${Math.abs(p)}% means ×(1 ${sign} ${fmtDecimal(size, 2)}) = ${factor(right)}`,
      `${sign}${Math.abs(p)} % heißt ×(1 ${sign} ${fmtDecimal(size, 2)}) = ${factor(right)}`,
    ),
    rng,
  )
}

const factorToPercent: Builder = (rng) => {
  const f = pick(rng, [1.3, 1.05, 1.5, 2, 2.5, 0.75, 0.9, 0.5, 0.2, 1.08, 3])
  const p = Math.round((f - 1) * 100)
  const naive = Math.round(f * 100) // ×1.3 read as +130%
  const tenth = Math.round((f - 1) * 10) // ×1.3 read as +3%
  const others = [naive, tenth, -p].filter((x) => x !== p && x !== 0)
  const wrong = [...new Set(others)].slice(0, 2).map((x) => pct(x, 0))
  return shuffled(
    L("Same change in percent?", "Dieselbe Änderung in Prozent?"),
    `${factor(f)} =`,
    pct(p, 0),
    wrong,
    cat(`${factor(f)} = 1 ${p >= 0 ? "+" : "−"} ${fmtDecimal(Math.abs(f - 1), 2)} → `, pct(p, 0)),
    rng,
  )
}

// --- Changes in a row --------------------------------------------------------

function changeBase(rng: Rng, p: number, min: number, max: number): number {
  const step = 100 / gcd(Math.abs(p), 100)
  return randInt(rng, Math.ceil(min / step), Math.floor(max / step)) * step
}

const applyChange: Builder = (rng) => {
  const p = pick(rng, [5, 10, 15, 20, 25, 30, 40, 75, -10, -15, -20, -25, -40, -60])
  const base = changeBase(rng, p, 20, 800)
  const result = (base * (100 + p)) / 100
  return typed(
    RESULT,
    cat(`${base} → `, pct(p, 0), " = ?"),
    result,
    `${factor(1 + p / 100)}: ${base} × ${fmtDecimal(1 + p / 100, 2)} = ${result}`,
  )
}

const twoChanges: Builder = (rng) => {
  const changes = [10, 20, 25, 50, 100, -10, -20, -25, -50]
  for (let guard = 0; guard < 100; guard++) {
    const p1 = pick(rng, changes)
    const p2 = pick(rng, changes)
    const base = pick(rng, [100, 200, 400, 80, 1000, 500])
    const middle = (base * (100 + p1)) / 100
    const end = (middle * (100 + p2)) / 100
    if (!Number.isInteger(middle) || !Number.isInteger(end)) continue
    return typed(
      RESULT,
      cat(`${base} → `, pct(p1, 0), " → ", pct(p2, 0), " = ?"),
      end,
      L(
        `${base} → ${middle} → ${end} (the second change applies to ${middle})`,
        `${base} → ${middle} → ${end} (die zweite Änderung gilt für ${middle})`,
      ),
    )
  }
  return applyChange(rng)
}

const reverseChange: Builder = (rng) => {
  const p = pick(rng, [25, 50, 20, 10, -20, -25, -50, -10, 60])
  const before = changeBase(rng, p, 20, 600)
  const after = (before * (100 + p)) / 100
  return typed(
    BEFORE,
    cat("? → ", pct(p, 0), ` = ${after}`),
    before,
    L(
      `${after} ÷ ${fmtDecimal(1 + p / 100, 2)} = ${before} (not ${after} ${p > 0 ? "−" : "+"} ${Math.abs(p)}%)`,
      `${after} ÷ ${fmtDecimal(1 + p / 100, 2)} = ${before} (nicht ${after} ${p > 0 ? "−" : "+"} ${Math.abs(p)} %)`,
    ),
  )
}

const recovery: Builder = (rng) => {
  const drop = pick(rng, [10, 20, 25, 50, 75, 80])
  const needed = (drop / (100 - drop)) * 100
  const wrong = [drop, drop * 2, needed * 2].filter((w) => Math.abs(w - needed) > 0.5)
  const options = [...new Set([needed, ...wrong.slice(0, 2)].map((v) => Math.round(v * 10) / 10))]
  const ordered = options.sort((a, b) => a - b)
  return choice(
    L("Back to 100 needs…", "Zurück auf 100 braucht…"),
    cat("100 → ", pct(-drop, 0), " → ?"),
    ordered.map((v) => pct(v)),
    ordered.indexOf(Math.round(needed * 10) / 10),
    L(
      `after −${drop}% it's ${100 - drop}; ${100 - drop} × ${fmtDecimal(100 / (100 - drop), 3)} = 100 → +${fmtDecimal(needed, 1)}%`,
      `nach −${drop} % sind es ${100 - drop}; ${100 - drop} × ${fmtDecimal(100 / (100 - drop), 3)} = 100 → +${fmtDecimal(needed, 1)} %`,
    ),
  )
}

const roundTripClaim: Builder = (rng) => {
  const pairs: [number, number][] = [
    [20, -20],
    [50, -50],
    [-50, 50],
    [-20, 25],
    [-50, 100],
    [25, -20],
    [100, -50],
    [10, -10],
    [-75, 300],
    [-25, 25],
  ]
  const [p1, p2] = pick(rng, pairs)
  const end = (100 * (100 + p1) * (100 + p2)) / 10000
  const truth = Math.abs(end - 100) < 1e-9
  return {
    kind: "truefalse",
    prompt: TRUE_FALSE,
    display: cat("100 → ", pct(p1, 0), " → ", pct(p2, 0), " = 100"),
    answer: truth,
    explanation: cat(
      truth ? L("True: ", "Stimmt: ") : L("False: ", "Falsch: "),
      `100 → ${100 + p1} → ${fmtDecimal(end, 2)}`,
    ),
  }
}

// --- Repeated growth ------------------------------------------------------

const compoundVsLinear: Builder = (rng) => {
  const p = pick(rng, [2, 3, 5, 10, 20])
  const n = pick(rng, [3, 5, 10])
  const actual = 100 * (1 + p / 100) ** n
  // Mostly the linear guess as threshold; sometimes one above the real value.
  const threshold = chance(rng, 0.7) ? 100 + p * n : Math.ceil((actual + 1) / 10) * 10
  const answer = Math.abs(actual - threshold) < 1e-9 ? 1 : actual > threshold ? 2 : 0
  return choice(
    L("Where does it end up?", "Wo landet es?"),
    L(`100, then +${p}% per step, ${n} steps`, `100, dann +${p} % pro Schritt, ${n} Schritte`),
    [
      L(`less than ${threshold}`, `weniger als ${threshold}`),
      L(`exactly ${threshold}`, `genau ${threshold}`),
      L(`more than ${threshold}`, `mehr als ${threshold}`),
    ],
    answer,
    L(
      `each step adds ${p}% of a growing amount: 100 × ${fmtDecimal(1 + p / 100, 2)}${sup(n)} ≈ ${fmtDecimal(actual, 1)}`,
      `jeder Schritt legt ${p} % auf einen wachsenden Betrag: 100 × ${fmtDecimal(1 + p / 100, 2)}${sup(n)} ≈ ${fmtDecimal(actual, 1)}`,
    ),
  )
}

const repeatedVsOnce: Builder = (rng) => {
  const items: [number, number][] = [
    [1.1, 3],
    [1.2, 2],
    [1.05, 10],
    [1.5, 2],
    [1.1, 5],
    [1.02, 10],
    [0.9, 3],
    [0.8, 2],
  ]
  const [f, n] = pick(rng, items)
  // n steps of the same change versus the changes simply added up once.
  const repeated: [string, number] = [`${fmtDecimal(f, 2)}${sup(n)}`, f ** n]
  const once: [string, number] = [fmtDecimal(1 + (f - 1) * n, 2), 1 + (f - 1) * n]
  const [x, y] = chance(rng, 0.5) ? [repeated, once] : [once, repeated]
  return compare(
    x[0],
    x[1],
    y[0],
    y[1],
    L(
      `${repeated[0]} = ${fmtDecimal(repeated[1], 3)}: each step changes an already changed amount`,
      `${repeated[0]} = ${fmtDecimal(repeated[1], 3)}: jeder Schritt verändert einen schon veränderten Betrag`,
    ),
    false,
  )
}

// Rule of 72: +p% per step doubles in about 72/p steps.
const doublingTime: Builder = (rng) => {
  const p = pick(rng, [2, 3, 4, 6, 8, 9, 12])
  const actual = Math.log(2) / Math.log(1 + p / 100)
  const correct = Math.round(actual)
  const linear = Math.round(100 / p)
  const draft = closestOf(
    L(`+${p}% per step: doubles after ≈`, `+${p} % pro Schritt: verdoppelt nach ≈`),
    actual,
    [correct, linear, chance(rng, 0.5) ? Math.round(correct / 2) : correct * 2].filter((v) => v > 0),
    correct,
    L(
      `rule of 72: 72 ÷ ${p} = ${fmtDecimal(72 / p, 1)} steps (not 100 ÷ ${p} — growth grows too)`,
      `72er-Regel: 72 ÷ ${p} = ${fmtDecimal(72 / p, 1)} Schritte (nicht 100 ÷ ${p} — das Wachstum wächst mit)`,
    ),
    L("Steps to double?", "Schritte bis zum Doppelten?"),
  )
  return draft ?? doublingTime(rng)
}

const halvingTime: Builder = (rng) => {
  const p = pick(rng, [5, 7, 10])
  const actual = Math.log(0.5) / Math.log(1 - p / 100)
  const correct = Math.round(actual)
  const linear = Math.round(50 / p)
  const draft = closestOf(
    L(`−${p}% per step: halves after ≈`, `−${p} % pro Schritt: halbiert nach ≈`),
    actual,
    [correct, linear, chance(rng, 0.5) ? correct * 3 : Math.round(correct / 2)],
    correct,
    L(
      `each step takes ${p}% of a shrinking amount, so it slows down: ≈ 70 ÷ ${p} = ${fmtDecimal(70 / p, 1)}`,
      `jeder Schritt nimmt ${p} % von einem schrumpfenden Rest, das bremst: ≈ 70 ÷ ${p} = ${fmtDecimal(70 / p, 1)}`,
    ),
    L("Steps to halve?", "Schritte bis zur Hälfte?"),
  )
  return draft ?? halvingTime(rng)
}

// --- Percent vs. percentage points ------------------------------------------

const percentagePoints: Builder = (rng) => {
  const a = pick(rng, [2, 3, 4, 5, 8, 10])
  const delta = pick(rng, [1, 2, a / 2, a])
  const b = a + delta
  const relative = (delta / a) * 100
  const relativeToNew = (delta / b) * 100
  const values = [...new Set([delta, relative, relativeToNew].map((v) => Math.round(v * 10) / 10))]
  if (values.length < 3) return percentagePoints(rng)
  const sorted = values.sort((x, y) => x - y)
  return choice(
    L("How much did it grow?", "Um wie viel ist es gewachsen?"),
    L(`${fmtDecimal(a, 1)}% → ${fmtDecimal(b, 1)}%`, `${fmtDecimal(a, 1)} % → ${fmtDecimal(b, 1)} %`),
    sorted.map((v) => pct(v)),
    sorted.indexOf(Math.round(relative * 10) / 10),
    L(
      `+${fmtDecimal(delta, 1)} percentage points = ${fmtDecimal(delta, 1)} ÷ ${a} = +${fmtDecimal(relative, 1)}%`,
      `+${fmtDecimal(delta, 1)} Prozentpunkte = ${fmtDecimal(delta, 1)} ÷ ${a} = +${fmtDecimal(relative, 1)} %`,
    ),
  )
}

const percentagePointClaim: Builder = (rng) => {
  const a = pick(rng, [2, 3, 4, 5, 10])
  const b = a * 2
  const truth = chance(rng, 0.5)
  const claimed = truth ? 100 : b - a
  return {
    kind: "truefalse",
    prompt: TRUE_FALSE,
    display: L(`${a}% → ${b}% is +${claimed}%`, `${a} % → ${b} % sind +${claimed} %`),
    answer: truth,
    explanation: cat(
      truth ? L("True: ", "Stimmt: ") : L("False: ", "Falsch: "),
      L(`+${b - a} percentage points, but doubled = +100%`, `+${b - a} Prozentpunkte, aber verdoppelt = +100 %`),
    ),
  }
}

// Small differences in the rate add up over many steps.
const rateGap: Builder = (rng) => {
  const items: [number, number, number][] = [
    [1.07, 1.05, 30],
    [1.08, 1.06, 20],
    [1.05, 1.03, 40],
    [1.06, 1.04, 30],
    [1.1, 1.07, 25],
    [1.04, 1.02, 35],
  ]
  const [r1, r2, n] = pick(rng, items)
  const actual = (r1 / r2) ** n
  const correct = Math.round(actual * 10) / 10
  const oneStep = Math.round((r1 / r2) * 100) / 100
  const draft = closestOf(
    `${fmtDecimal(r1, 2)}${sup(n)} ÷ ${fmtDecimal(r2, 2)}${sup(n)} ≈`,
    actual,
    [
      oneStep,
      correct,
      chance(rng, 0.5) ? Math.round(actual * actual * 10) / 10 : Math.round((1 + (r1 - r2) * n) * 10) / 10,
    ],
    correct,
    L(
      `(${fmtDecimal(r1, 2)} ÷ ${fmtDecimal(r2, 2)})${sup(n)} ≈ ${fmtDecimal(r1 / r2, 4)}${sup(n)} ≈ ${fmtDecimal(actual, 2)}: a small gap per step, large after ${n} steps`,
      `(${fmtDecimal(r1, 2)} ÷ ${fmtDecimal(r2, 2)})${sup(n)} ≈ ${fmtDecimal(r1 / r2, 4)}${sup(n)} ≈ ${fmtDecimal(actual, 2)}: kleiner Unterschied pro Schritt, groß nach ${n} Schritten`,
    ),
  )
  return draft ?? rateGap(rng)
}

// --- Exponential vs. linear ------------------------------------------------

const powerEstimate: Builder = (rng) => {
  const items: [number, number][] = [
    [1.1, 10],
    [1.07, 10],
    [1.05, 14],
    [1.2, 5],
    [0.9, 10],
    [1.03, 24],
    [1.5, 4],
    [1.01, 70],
    [0.8, 5],
  ]
  const [f, n] = pick(rng, items)
  const actual = f ** n
  const linear = Math.max(0.1, 1 + (f - 1) * n)
  const correct = roundSignificant(actual, 2)
  const candidates = [
    roundSignificant(linear, 2),
    correct,
    roundSignificant(actual * (chance(rng, 0.5) ? 1.4 : 0.72), 2),
  ]
  const draft = closestOf(
    `${fmtDecimal(f, 2)}${sup(n)} ≈`,
    actual,
    candidates,
    correct,
    L(
      `${fmtDecimal(f, 2)}${sup(n)} ≈ ${fmtDecimal(actual, 3)} — adding ${n} × ${fmtDecimal(Math.abs(f - 1), 2)} would give ${fmtDecimal(linear, 2)}`,
      `${fmtDecimal(f, 2)}${sup(n)} ≈ ${fmtDecimal(actual, 3)} — ${n} × ${fmtDecimal(Math.abs(f - 1), 2)} aufaddiert ergäbe ${fmtDecimal(linear, 2)}`,
    ),
  )
  return draft ?? powerEstimate(rng)
}

const lilyPond: Builder = (rng) => {
  const full = randInt(rng, 20, 48)
  const [en, de, back] = pick(rng, [
    ["Half", "Halb", 1],
    ["A quarter", "Zu einem Viertel", 2],
    ["An eighth", "Zu einem Achtel", 3],
  ] as const)
  const path = Array.from({ length: back + 1 }, (_, i) => full - i).join(" → ")
  return typed(
    L("Think backwards", "Denk rückwärts"),
    L(
      `Doubles every step, full at step ${full}. ${en} full at step ?`,
      `Verdoppelt sich jeden Schritt, voll bei Schritt ${full}. ${de} voll bei Schritt ?`,
    ),
    full - back,
    L(`one step back halves it: ${path}`, `ein Schritt zurück halbiert: ${path}`),
  )
}

const placeGrowth: Builder = (rng) => {
  const items: [number, number][] = [
    [1.1, 5],
    [1.05, 10],
    [1.2, 3],
    [0.9, 5],
    [1.5, 2],
    [1.1, 10],
    [0.8, 3],
    [1.07, 10],
    [1.02, 20],
  ]
  const [f, n] = pick(rng, items)
  const value = f ** n
  return {
    kind: "line",
    prompt: L("Tap where it goes", "Tippe die Stelle an"),
    display: `${fmtDecimal(f, 2)}${sup(n)}`,
    value,
    min: 0,
    max: 3,
    minLabel: "0",
    maxLabel: "3",
    ticks: [1, 2],
    tolerance: 0.04,
    explanation: `${fmtDecimal(f, 2)}${sup(n)} ≈ ${fmtDecimal(value, 2)}`,
  }
}

// --- Growing while adding or taking away --------------------------------------

// A amount that grows by p% each step while T is taken away: the interest-only
// insight (T = p% of A keeps it flat) without the words.
const steadyTake: Builder = (rng) => {
  const amount = pick(rng, [200, 500, 1000, 2000, 4000])
  const p = pick(rng, [5, 10, 20])
  const growth = (amount * p) / 100
  const take = Math.round(pick(rng, [growth / 2, growth, growth * 1.5]))
  const answer = take < growth ? 0 : take === growth ? 1 : 2
  return choice(
    L("What happens over many steps?", "Was passiert auf Dauer?"),
    L(
      `${fmt(amount)}, each step: +${p}%, then −${fmt(take)}`,
      `${fmt(amount)}, jeden Schritt: +${p} %, dann −${fmt(take)}`,
    ),
    [
      L("keeps growing", "wächst weiter"),
      L(`stays at ${fmt(amount)}`, `bleibt bei ${fmt(amount)}`),
      L("shrinks to 0", "schrumpft auf 0"),
    ],
    answer,
    L(
      `+${p}% of ${fmt(amount)} is ${fmt(growth)} per step; taking ${fmt(take)} is ${answer === 0 ? "less" : answer === 1 ? "exactly that" : "more"}`,
      `+${p} % von ${fmt(amount)} sind ${fmt(growth)} pro Schritt; −${fmt(take)} ist ${answer === 0 ? "weniger" : answer === 1 ? "genau so viel" : "mehr"}`,
    ),
  )
}

const steadyAdd: Builder = (rng) => {
  const add = pick(rng, [50, 100, 200])
  const p = pick(rng, [5, 10])
  const n = pick(rng, [10, 15, 20])
  let total = 0
  for (let i = 0; i < n; i++) total = (total + add) * (1 + p / 100)
  const linear = add * n
  const correct = roundSignificant(total, 2)
  const draft = closestOf(
    L(
      `Each step: +${add}, then everything +${p}%. After ${n} steps ≈`,
      `Jeden Schritt: +${add}, dann alles +${p} %. Nach ${n} Schritten ≈`,
    ),
    total,
    [linear, correct, roundSignificant(total * 1.6, 2)],
    correct,
    L(
      `${n} × ${add} = ${fmt(linear)} put in; growth on top brings it to ≈ ${fmt(Math.round(total))}`,
      `${n} × ${add} = ${fmt(linear)} eingezahlt; das Wachstum bringt es auf ≈ ${fmt(Math.round(total))}`,
    ),
  )
  return draft ?? steadyAdd(rng)
}

// --- Rates compared -------------------------------------------------------------

const averageGrowth: Builder = (rng) => {
  // [factor, factor, wrong options] — the right option is the geometric mean.
  const items: [number, number, number[]][] = [
    [1.5, 0.5, [0, -25]],
    [2, 0.5, [25, -25]],
    [1.2, 0.8, [0, -4]],
    [1.25, 0.8, [2.5, -2.5]],
    [1.1, 0.9, [0, -1]],
  ]
  const [f1, f2, wrong] = pick(rng, items)
  const mean = Math.sqrt(f1 * f2)
  const right = Math.round((mean - 1) * 1000) / 10
  return shuffled(
    L("Average change per step?", "Im Schnitt pro Schritt?"),
    `${factor(f1)}, ${factor(f2)}`,
    pct(right),
    wrong.map((v) => pct(v)),
    L(
      `together ${factor(f1 * f2)}; per step √${fmtDecimal(f1 * f2, 3)} ≈ ${fmtDecimal(mean, 3)} — not the average of the percentages`,
      `zusammen ${factor(f1 * f2)}; pro Schritt √${fmtDecimal(f1 * f2, 3)} ≈ ${fmtDecimal(mean, 3)} — nicht der Mittelwert der Prozente`,
    ),
    rng,
  )
}

// One thing grows, the yardstick grows too: what matters is the ratio.
const relativeGrowth: Builder = (rng) => {
  const [a, b] = pick(rng, [
    [2, 3],
    [5, 2],
    [3, 3],
    [1, 4],
    [6, 2],
    [4, 4],
  ] as const)
  const ratio = (1 + a / 100) / (1 + b / 100) - 1
  const answer = Math.abs(ratio) < 1e-9 ? 1 : ratio > 0 ? 0 : 2
  const perStep = pct(Math.round(ratio * 1000) / 10)
  return choice(
    L("Over time, A compared to B…", "Mit der Zeit wird A im Vergleich zu B…"),
    L(`A: +${a}% per step, B: +${b}% per step`, `A: +${a} % pro Schritt, B: +${b} % pro Schritt`),
    [L("…grows", "…größer"), L("…stays the same", "…gleich bleiben"), L("…shrinks", "…kleiner")],
    answer,
    cat(
      `${fmtDecimal(1 + a / 100, 2)} ÷ ${fmtDecimal(1 + b / 100, 2)} ≈ ${fmtDecimal(1 + ratio, 4)} → ≈ `,
      perStep,
      L(" per step", " pro Schritt"),
    ),
  )
}

// --- Successive changes and switching the base ----------------------------

function plainPct(n: number): Localized {
  const number = fmtDecimal(n, 1)
  return L(`${number}%`, `${number} %`)
}

// Changes in a row multiply; adding the percentages is the classic slip.
const combinedChange: Builder = (rng) => {
  const [p1, p2] = pick(rng, [
    [-20, -25],
    [10, 10],
    [50, -20],
    [-10, 20],
    [25, 20],
    [-50, -50],
    [20, -50],
    [-30, 10],
  ] as const)
  const overall = Math.round(((1 + p1 / 100) * (1 + p2 / 100) - 1) * 1000) / 10
  const naive = p1 + p2
  const mirror = 2 * overall - naive
  return shuffled(
    L("Overall change?", "Änderung insgesamt?"),
    L(
      `${p1 > 0 ? "+" : "−"}${Math.abs(p1)}%, then ${p2 > 0 ? "+" : "−"}${Math.abs(p2)}%`,
      `${p1 > 0 ? "+" : "−"}${Math.abs(p1)} %, dann ${p2 > 0 ? "+" : "−"}${Math.abs(p2)} %`,
    ),
    pct(overall),
    [pct(naive), pct(mirror)],
    cat(
      `${factor(1 + p1 / 100)} ${factor(1 + p2 / 100)} = ${factor((1 + p1 / 100) * (1 + p2 / 100))} → `,
      pct(overall),
    ),
    rng,
  )
}

// "A is 50% more than B" does not make B 50% less than A.
const baseSwitch: Builder = (rng) => {
  const p = pick(rng, [20, 25, 50, 100])
  const more = chance(rng, 0.5)
  const answer = more ? (p / (100 + p)) * 100 : (p / (100 - p)) * 100
  if (!more && p >= 100) return baseSwitch(rng)
  const right = Math.round(answer * 10) / 10
  const wrong = [p, more ? Math.round((p / 2) * 10) / 10 : p * 2].filter((v) => Math.abs(v - right) > 0.05)
  return shuffled(
    L("Fill the gap", "Fülle die Lücke"),
    more
      ? L(`A = B + ${p}% → B = A − ?`, `A = B + ${p} % → B = A − ?`)
      : L(`A = B − ${p}% → B = A + ?`, `A = B − ${p} % → B = A + ?`),
    plainPct(right),
    wrong.slice(0, 2).map(plainPct),
    more
      ? L(
          `B = A ÷ ${fmtDecimal(1 + p / 100, 2)}; the ${p}% now counts against the bigger A: ${p} ÷ ${100 + p} = ${fmtDecimal(right, 1)}%`,
          `B = A ÷ ${fmtDecimal(1 + p / 100, 2)}; die ${p} % zählen jetzt vom größeren A: ${p} ÷ ${100 + p} = ${fmtDecimal(right, 1)} %`,
        )
      : L(
          `B = A ÷ ${fmtDecimal(1 - p / 100, 2)}; the ${p}% now counts against the smaller A: ${p} ÷ ${100 - p} = ${fmtDecimal(right, 1)}%`,
          `B = A ÷ ${fmtDecimal(1 - p / 100, 2)}; die ${p} % zählen jetzt vom kleineren A: ${p} ÷ ${100 - p} = ${fmtDecimal(right, 1)} %`,
        ),
    rng,
  )
}

const TIERS: Record<number, [Builder, number][]> = {
  1: [
    [doublingChain, 3],
    [plusHundredPercent, 2],
  ],
  2: [
    [percentToFactor, 3],
    [doublingChain, 1],
    [plusHundredPercent, 1],
  ],
  3: [
    [applyChange, 2],
    [twoChanges, 2],
    [percentToFactor, 1],
    [factorToPercent, 1],
  ],
  4: [
    [reverseChange, 2],
    [recovery, 2],
    [roundTripClaim, 1],
    [combinedChange, 2],
    [twoChanges, 1],
  ],
  5: [
    [compoundVsLinear, 3],
    [repeatedVsOnce, 2],
    [baseSwitch, 2],
    [combinedChange, 1],
    [reverseChange, 1],
  ],
  6: [
    [doublingTime, 3],
    [halvingTime, 1],
    [compoundVsLinear, 1],
    [recovery, 1],
  ],
  7: [
    [percentagePoints, 2],
    [percentagePointClaim, 1],
    [rateGap, 2],
    [baseSwitch, 1],
    [doublingTime, 1],
  ],
  8: [
    [powerEstimate, 2],
    [lilyPond, 1],
    [placeGrowth, 2],
    [rateGap, 1],
  ],
  9: [
    [steadyTake, 3],
    [steadyAdd, 2],
    [powerEstimate, 1],
  ],
  10: [
    [averageGrowth, 2],
    [relativeGrowth, 2],
    [steadyTake, 1],
    [steadyAdd, 1],
  ],
}

export function generateGrowth(tier: number, rng: Rng): QuestionDraft {
  return weighted(rng, TIERS[tier])(rng)
}
