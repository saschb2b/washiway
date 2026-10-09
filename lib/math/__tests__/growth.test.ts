import { describe, expect, it } from "vitest"
import { generateForTier, localize, seededRng } from "../index"
import type { ChoiceQuestion, Question } from "../types"
import { close, evaluate } from "./evaluate"

const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const PER_TIER = Number(process.env.MATH_SAMPLES ?? 300)

function sample(tier: number): Question[] {
  const rng = seededRng(Number(process.env.MATH_SEED ?? 1) * 7 + tier * 104729)
  return Array.from({ length: PER_TIER }, () => generateForTier("growth", tier, rng))
}

const en = (text: Parameters<typeof localize>[0]) => localize(text, "en")
const percent = (text: string) => Number(text.replace("±", "").replace("−", "-").replace("%", ""))

// The option whose value is closest to `actual` must be the answer, uniquely.
function expectClosest(q: ChoiceQuestion, values: number[], actual: number) {
  const distances = values.map((v) => Math.abs(v - actual))
  const best = Math.min(...distances)
  expect(distances[q.answer], `${en(q.display)} ${q.options.map(en).join(" | ")}`).toBe(best)
  expect(distances.filter((d) => d - best < 1e-9)).toHaveLength(1)
}

function verifyNumber(display: string, answer: number) {
  let m = /full at step (\d+)\. (Half|A quarter|An eighth) full at step \?$/.exec(display)
  if (m) return expect(answer).toBe(Number(m[1]) - { Half: 1, "A quarter": 2, "An eighth": 3 }[m[2]]!)
  if (display.startsWith("? →")) {
    const [left, right] = display.split(" = ")
    return expect(close(evaluate(left.replace("?", String(answer))), evaluate(right)), display).toBe(true)
  }
  m = /^(.*) = \?$/.exec(display)
  if (m) return expect(close(evaluate(m[1]), answer), display).toBe(true)
  throw new Error(`unverified number task: ${display}`)
}

function verifyClaim(display: string, answer: boolean) {
  const m = /^(\d+)% → (\d+)% is \+(\d+)%$/.exec(display)
  if (m) {
    const [a, b, claimed] = m.slice(1).map(Number)
    return expect(close(((b - a) / a) * 100, claimed)).toBe(answer)
  }
  const [left, right] = display.split(" = ")
  expect(close(evaluate(left), evaluate(right)), display).toBe(answer)
}

function verifyChoice(q: ChoiceQuestion) {
  const display = en(q.display)
  const options = q.options.map(en)
  let m = /^([+−])(\d+)% = ×\?$/.exec(display)
  if (m) {
    const target = 1 + (m[1] === "+" ? 1 : -1) * (Number(m[2]) / 100)
    const values = options.map((o) => Number(o.slice(1)))
    return (expectClosest(q, values, target), expect(close(values[q.answer], target)).toBe(true))
  }
  m = /^×([\d.]+) =$/.exec(display)
  if (m) {
    const target = (Number(m[1]) - 1) * 100
    const values = options.map(percent)
    return (expect(close(values[q.answer], target, 1e-6), display).toBe(true), expectClosest(q, values, target))
  }
  m = /^100 → −(\d+)% → \?$/.exec(display)
  if (m) {
    const drop = Number(m[1])
    return expectClosest(q, options.map(percent), (drop / (100 - drop)) * 100)
  }
  m = /^100, then \+(\d+)% per step, (\d+) steps$/.exec(display)
  if (m) {
    const actual = 100 * (1 + Number(m[1]) / 100) ** Number(m[2])
    const threshold = Number(/(\d+)$/.exec(options[0])![1])
    return expect(q.answer).toBe(close(actual, threshold) ? 1 : actual > threshold ? 2 : 0)
  }
  if (display === "Which is bigger?") {
    const values = options.filter((o) => o !== "Both equal").map(evaluate)
    if (options[q.answer] === "Both equal") return expect(close(values[0], values[1])).toBe(true)
    return expect(values[q.answer]).toBeGreaterThan(values[1 - q.answer])
  }
  m = /^([+−])(\d+)% per step: (doubles|halves) after ≈$/.exec(display)
  if (m) {
    const rate = (m[1] === "+" ? 1 : -1) * (Number(m[2]) / 100)
    const actual = Math.log(m[3] === "doubles" ? 2 : 0.5) / Math.log(1 + rate)
    return expectClosest(q, options.map(Number), actual)
  }
  m = /^([\d.]+)% → ([\d.]+)%$/.exec(display)
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])]
    return expectClosest(q, options.map(percent), ((b - a) / a) * 100)
  }
  m = /^Each step: \+(\d+), then everything \+(\d+)%\. After (\d+) steps ≈$/.exec(display)
  if (m) {
    const [add, p, n] = m.slice(1).map(Number)
    let total = 0
    for (let i = 0; i < n; i++) total = (total + add) * (1 + p / 100)
    return expectClosest(
      q,
      options.map((o) => evaluate(o)),
      total,
    )
  }
  m = /^([\d ]+), each step: \+(\d+)%, then −(\d+)$/.exec(display)
  if (m) {
    const [amount, p, take] = [evaluate(m[1]), Number(m[2]), Number(m[3])]
    const growth = (amount * p) / 100
    return expect(q.answer, display).toBe(take < growth ? 0 : take === growth ? 1 : 2)
  }
  m = /^×([\d.]+), ×([\d.]+)$/.exec(display)
  if (m) return expectClosest(q, options.map(percent), (Math.sqrt(Number(m[1]) * Number(m[2])) - 1) * 100)
  m = /^A: \+(\d+)% per step, B: \+(\d+)% per step$/.exec(display)
  if (m) {
    const ratio = (1 + Number(m[1]) / 100) / (1 + Number(m[2]) / 100)
    return expect(q.answer).toBe(close(ratio, 1) ? 1 : ratio > 1 ? 0 : 2)
  }
  m = /^([+−])(\d+)%, then ([+−])(\d+)%$/.exec(display)
  if (m) {
    const p1 = (m[1] === "+" ? 1 : -1) * Number(m[2])
    const p2 = (m[3] === "+" ? 1 : -1) * Number(m[4])
    return expectClosest(q, options.map(percent), ((1 + p1 / 100) * (1 + p2 / 100) - 1) * 100)
  }
  m = /^A = B ([+−]) (\d+)% → B = A ([+−]) \?$/.exec(display)
  if (m) {
    const p = Number(m[2]) / 100
    const ratio = m[1] === "+" ? 1 / (1 + p) : 1 / (1 - p)
    return expectClosest(q, options.map(percent), Math.abs(ratio - 1) * 100)
  }
  if (display.endsWith("≈")) return expectClosest(q, options.map(evaluate), evaluate(display.slice(0, -1)))
  throw new Error(`unverified choice task: ${display}`)
}

describe("grow & shrink tasks are correct", () => {
  for (const tier of TIERS) {
    it(`tier ${tier}`, () => {
      const questions = sample(tier)
      for (const q of questions) {
        expect(q.skill).toBe("growth")
        expect(en(q.explanation).length).toBeGreaterThan(0)
        expect(localize(q.explanation, "de")).not.toMatch(/undefined|NaN|Infinity/)
        expect(localize(q.display, "de")).not.toMatch(/undefined|NaN/)
        if (q.kind === "number") {
          expect(Number.isInteger(q.answer)).toBe(true)
          verifyNumber(en(q.display), q.answer)
        } else if (q.kind === "truefalse") verifyClaim(en(q.display), q.answer)
        else if (q.kind === "choice") {
          expect(new Set(q.options.map(en)).size).toBe(q.options.length)
          verifyChoice(q)
        } else if (q.kind === "line") {
          expect(close(evaluate(en(q.display)), q.value)).toBe(true)
          expect(q.value).toBeGreaterThan(q.min)
          expect(q.value).toBeLessThan(q.max)
        } else throw new Error(`unexpected kind ${q.kind}`)
      }
      const choices = questions.filter((q): q is ChoiceQuestion => q.kind === "choice")
      if (choices.length > 50) {
        const counts = new Map<number, number>()
        for (const q of choices) counts.set(q.answer, (counts.get(q.answer) ?? 0) + 1)
        expect(Math.max(...counts.values()) / choices.length).toBeLessThan(0.75)
      }
    })
  }
})
