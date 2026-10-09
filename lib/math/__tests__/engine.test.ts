import { describe, expect, it } from "vitest"
import { checkAnswer, generateForTier, localize, seededRng, SKILLS, tierFor } from "../index"
import type { ChoiceQuestion, NumberLineQuestion, Question, Skill, TargetQuestion, TrueFalseQuestion } from "../types"
import { gcd, isPrime, lcm } from "../format"
import { validCombinations } from "../skills/target"
import { close, evaluate } from "./evaluate"

const TIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const PER_TIER = Number(process.env.MATH_SAMPLES ?? 300)

function sample(skill: Skill, tier: number, count = PER_TIER, seed = Number(process.env.MATH_SEED ?? 1)): Question[] {
  const rng = seededRng(seed * 1000 + tier * 7919 + SKILLS.indexOf(skill))
  return Array.from({ length: count }, () => generateForTier(skill, tier, rng))
}

const en = (q: { display: Parameters<typeof localize>[0] }) => localize(q.display, "en")

describe("every skill and tier generates well-formed questions", () => {
  for (const skill of SKILLS) {
    for (const tier of TIERS) {
      it(`${skill} tier ${tier}`, () => {
        for (const q of sample(skill, tier)) {
          expect(q.skill).toBe(skill)
          expect(q.tier).toBe(tier)
          expect(localize(q.prompt, "en").length).toBeGreaterThan(0)
          expect(localize(q.prompt, "de").length).toBeGreaterThan(0)
          expect(localize(q.explanation, "en").length).toBeGreaterThan(0)
          expect(localize(q.explanation, "de").length).toBeGreaterThan(0)
          expect(localize(q.display, "de")).not.toMatch(/undefined|NaN/)
          expect(localize(q.explanation, "en")).not.toMatch(/undefined|NaN|Infinity/)
          if (q.kind === "number") {
            expect(Number.isInteger(q.answer)).toBe(true)
            expect(Math.abs(q.answer)).toBeLessThan(10000)
          }
        }
      })
    }
  }
})

describe("quick math answers are correct", () => {
  for (const tier of TIERS) {
    it(`tier ${tier}`, () => {
      for (const q of sample("quick", tier)) {
        if (q.kind !== "number") throw new Error("quick must be typed")
        const expr = en(q).replace(/ = \?$/, "")
        expect(close(evaluate(expr), q.answer), en(q)).toBe(true)
        // The worked strategy ends at the answer.
        expect(localize(q.explanation, "en").replace(/[ ]/g, ""), en(q)).toMatch(
          new RegExp(`${String(q.answer).replace("-", "[−-]")}$`),
        )
      }
    })
  }
})

describe("gap answers satisfy the equation or continue the pattern", () => {
  for (const tier of TIERS) {
    it(`tier ${tier}`, () => {
      for (const q of sample("gap", tier)) {
        if (q.kind !== "number") throw new Error("gap must be typed")
        const text = en(q)
        if (text.includes(",")) {
          expect(text.split(",").filter((t) => t.trim() === "?")).toHaveLength(1)
          continue
        }
        const filled = text
          .replace(/\?/g, `(${q.answer})`)
          .replace(/ˣ/g, `^(${q.answer})`)
          .replace(/(\d)x/g, `$1×(${q.answer})`)
          .replace(/x/g, `(${q.answer})`)
        const [left, right] = filled.split("=")
        expect(close(evaluate(left), evaluate(right)), text).toBe(true)
      }
    })
  }
})

function judgeClaim(text: string): boolean | null {
  let m = /^(\d+) is prime$/.exec(text)
  if (m) return isPrime(Number(m[1]))
  m = /^(\d+) is divisible by (\d+)$/.exec(text)
  if (m) return Number(m[1]) % Number(m[2]) === 0
  m = /^lcm\((\d+), (\d+)\) = (\d+)$/.exec(text)
  if (m) return lcm(Number(m[1]), Number(m[2])) === Number(m[3])
  m = /^gcd\((\d+), (\d+)\) = (\d+)$/.exec(text)
  if (m) return gcd(Number(m[1]), Number(m[2])) === Number(m[3])
  m = /^\+(\d+)% then −(\d+)% = (.+)%$/.exec(text)
  if (m) {
    const net = ((1 + Number(m[1]) / 100) * (1 - Number(m[2]) / 100) - 1) * 100
    return close(net, evaluate(m[3]), 1e-6)
  }
  if (text.includes("=")) {
    const [left, right] = text.split(" = ")
    return close(evaluate(left), evaluate(right), 1e-9)
  }
  return null
}

describe("true/false claims are judged correctly", () => {
  for (const tier of TIERS) {
    it(`tier ${tier}`, () => {
      const questions = sample("check", tier) as TrueFalseQuestion[]
      for (const q of questions) {
        const verdict = judgeClaim(en(q))
        expect(verdict, en(q)).not.toBeNull()
        expect(verdict, en(q)).toBe(q.answer)
      }
      const trueShare = questions.filter((q) => q.answer).length / questions.length
      expect(trueShare).toBeGreaterThan(0.35)
      expect(trueShare).toBeLessThan(0.65)
    })
  }
})

describe("estimate questions have exactly one best option", () => {
  for (const tier of TIERS) {
    it(`tier ${tier}`, () => {
      const questions = sample("estimate", tier) as ChoiceQuestion[]
      for (const q of questions) {
        const options = q.options.map((o) => localize(o, "en"))
        expect(new Set(options).size, options.join(" | ")).toBe(options.length)
        expect(q.answer).toBeGreaterThanOrEqual(0)
        expect(q.answer).toBeLessThan(options.length)
        const display = en(q)
        if (display.endsWith("≈") && !/[a-z]/i.test(display.replace(/ of /, " "))) {
          const actual = evaluate(display.replace(/≈$/, "").replace(/ of /, " of "))
          const distances = options.map((o) => Math.abs(evaluate(o) - actual))
          const best = Math.min(...distances)
          expect(distances[q.answer], `${display} ${options.join(" | ")}`).toBe(best)
          expect(distances.filter((d) => d === best)).toHaveLength(1)
        }
        if (display === "Which is bigger?") {
          const values = options.filter((o) => o !== "Both equal").map(evaluate)
          if (options[q.answer] === "Both equal") expect(close(values[0], values[1], 1e-12)).toBe(true)
          else {
            expect(values[q.answer], options.join(" | ")).toBeGreaterThan(values[1 - q.answer])
          }
        }
      }
      // The right answer must not sit in a predictable slot.
      const counts = new Map<number, number>()
      for (const q of questions) counts.set(q.answer, (counts.get(q.answer) ?? 0) + 1)
      expect(Math.max(...counts.values()) / questions.length).toBeLessThan(0.75)
    })
  }
})

describe("number line targets lie on the line", () => {
  for (const tier of TIERS) {
    it(`tier ${tier}`, () => {
      for (const q of sample("line", tier) as NumberLineQuestion[]) {
        expect(q.value).toBeGreaterThan(q.min)
        expect(q.value).toBeLessThan(q.max)
        expect(q.tolerance).toBeGreaterThan(0)
        expect(q.tolerance).toBeLessThanOrEqual(0.1)
        for (const t of q.ticks) {
          expect(t).toBeGreaterThan(q.min)
          expect(t).toBeLessThan(q.max)
        }
        const display = en(q)
        const shown = display.endsWith("%") && q.maxLabel === "100%" ? evaluate(display) * 100 : evaluate(display)
        expect(close(shown, q.value, 1e-9), display).toBe(true)
      }
    })
  }
})

describe("target puzzles can be solved", () => {
  for (const tier of TIERS) {
    it(`tier ${tier}`, () => {
      for (const q of sample("target", tier) as TargetQuestion[]) {
        expect(new Set(q.tiles).size).toBe(q.tiles.length)
        q.tiles.forEach((label, i) => expect(close(evaluate(label), q.values[i], 1e-9), label).toBe(true))
        const valid = validCombinations(q.values, q.op, q.pick, q.target)
        expect(valid.length).toBeGreaterThanOrEqual(1)
        expect(valid.length).toBeLessThanOrEqual(2)
        expect(checkAnswer(q, q.answer).correct).toBe(true)
      }
    })
  }
})

describe("checkAnswer", () => {
  it("grades number line taps by distance", () => {
    const q = sample("line", 3, 1)[0] as NumberLineQuestion
    const span = q.max - q.min
    expect(checkAnswer(q, q.value).correct).toBe(true)
    expect(checkAnswer(q, q.value).accuracy).toBe(1)
    expect(checkAnswer(q, q.value + span * q.tolerance * 0.9).correct).toBe(true)
    expect(checkAnswer(q, q.value + span * q.tolerance * 1.1).correct).toBe(false)
  })

  it("accepts any valid target combination and rejects others", () => {
    for (const q of sample("target", 4, 50) as TargetQuestion[]) {
      for (const combo of validCombinations(q.values, q.op, q.pick, q.target)) {
        expect(checkAnswer(q, [...combo].reverse()).correct).toBe(true)
      }
      expect(checkAnswer(q, [q.answer[0], q.answer[0]]).correct).toBe(false)
    }
  })

  it("treats a skipped question as wrong", () => {
    const q = sample("quick", 1, 1)[0]
    expect(checkAnswer(q, null)).toEqual({ correct: false, accuracy: 0 })
  })
})

describe("tierFor", () => {
  it("blends neighbouring tiers by the fractional level", () => {
    const rng = seededRng(42)
    const tiers = Array.from({ length: 5000 }, () => tierFor(3.3, rng))
    const share = tiers.filter((t) => t === 4).length / tiers.length
    expect(new Set(tiers)).toEqual(new Set([3, 4]))
    expect(share).toBeGreaterThan(0.25)
    expect(share).toBeLessThan(0.35)
  })

  it("clamps to the valid range", () => {
    expect(tierFor(0.2)).toBe(1)
    expect(tierFor(14)).toBe(10)
  })
})

describe("localize", () => {
  it("uses decimal commas in German", () => {
    expect(localize("0.375 + 1.5", "de")).toBe("0,375 + 1,5")
    expect(localize("0.375 + 1.5", "en")).toBe("0.375 + 1.5")
  })
})

describe("fractions are written in lowest terms", () => {
  it("in fraction-of-amount tasks", () => {
    for (const tier of [6, 7]) {
      for (const q of sample("quick", tier, 500)) {
        const m = /^(\d+)\/(\d+) of/.exec(en(q))
        if (m) expect(gcd(Number(m[1]), Number(m[2])), en(q)).toBe(1)
      }
    }
  })
})
