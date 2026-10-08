import { describe, expect, it } from "vitest"
import { type SkillRecord, START_LEVEL, pointsFor, referenceTime, updateRecord } from "../adaptive"
import { generateQuestion, tierFor } from "../engine"
import { seededRng } from "../random"
import type { Skill } from "../types"

// A simulated player who succeeds 80% of the time at `ability` and more or
// less often on easier or harder tiers.
function simulate(skill: Skill, ability: number, answers: number, seed: number): SkillRecord[] {
  const rng = seededRng(seed)
  let record: SkillRecord = { level: START_LEVEL, answered: 0 }
  const history: SkillRecord[] = []
  for (let i = 0; i < answers; i++) {
    const question = generateQuestion(skill, record.level, rng)
    const p = 1 / (1 + Math.exp(-1.4 * (ability - question.tier) - Math.log(4)))
    const correct = rng() < p
    const time = referenceTime(question) * (0.6 + rng() * 0.8)
    record = updateRecord(record, question, correct ? "correct" : "wrong", time)
    history.push(record)
  }
  return history
}

describe("adaptive level", () => {
  for (const ability of [2, 5, 8]) {
    it(`settles near a player's ability (${ability})`, () => {
      const finals = [1, 2, 3, 4, 5].map((seed) => {
        const history = simulate("quick", ability, 400, seed)
        const tail = history.slice(-150).map((r) => r.level)
        return tail.reduce((s, l) => s + l, 0) / tail.length
      })
      const mean = finals.reduce((s, l) => s + l, 0) / finals.length
      expect(mean).toBeGreaterThan(ability - 1)
      expect(mean).toBeLessThan(ability + 1)
    })
  }

  it("finds a strong player's level within a couple of rounds", () => {
    const history = simulate("gap", 8, 60, 11)
    expect(history[history.length - 1].level).toBeGreaterThan(5.5)
  })

  it("moves up more for fast answers than for slow ones", () => {
    const rng = seededRng(3)
    const record = { level: 4, answered: 50 }
    const q = generateQuestion("quick", 4, rng)
    const fast = updateRecord(record, q, "correct", referenceTime(q) * 0.2)
    const slow = updateRecord(record, q, "correct", referenceTime(q) * 3)
    expect(fast.level).toBeGreaterThan(slow.level)
    expect(slow.level).toBeGreaterThan(record.level)
  })

  it("drops less for a skip than for a wrong answer", () => {
    const rng = seededRng(4)
    const record = { level: 5, answered: 50 }
    const q = generateQuestion("estimate", 5, rng)
    const wrong = updateRecord(record, q, "wrong", 1000)
    const skipped = updateRecord(record, q, "skipped", 1000)
    expect(wrong.level).toBeLessThan(skipped.level)
    expect(skipped.level).toBeLessThan(record.level)
  })

  it("stays within 1-10", () => {
    const rng = seededRng(5)
    let record = { level: 9.9, answered: 0 }
    for (let i = 0; i < 50; i++) record = updateRecord(record, generateQuestion("line", 10, rng), "correct", 100)
    expect(record.level).toBe(10)
    for (let i = 0; i < 50; i++) record = updateRecord(record, generateQuestion("line", 1, rng), "wrong", 100)
    expect(record.level).toBe(1)
    expect(tierFor(record.level)).toBe(1)
  })
})

describe("points", () => {
  const rng = seededRng(9)
  const tf = generateQuestion("check", 5, rng)
  const typed = generateQuestion("quick", 5, rng)

  it("make fast guessing worthless on true/false", () => {
    const fast = 300
    const expected = 0.5 * pointsFor(tf, "correct", fast, 1, 1) + 0.5 * pointsFor(tf, "wrong", fast, 1, 1)
    expect(Math.abs(expected)).toBeLessThanOrEqual(1)
  })

  it("reward speed and never punish slow mistakes or skips", () => {
    expect(pointsFor(typed, "correct", 500, 1, 1)).toBeGreaterThan(pointsFor(typed, "correct", 20000, 1, 1))
    expect(pointsFor(typed, "correct", 20000, 1, 1)).toBeGreaterThan(0)
    expect(pointsFor(typed, "wrong", 60000, 1, 1)).toBe(0)
    expect(pointsFor(typed, "skipped", 100, 1, 1)).toBe(0)
  })

  it("scale with the streak multiplier and tier", () => {
    expect(pointsFor(typed, "correct", 500, 1, 3)).toBe(3 * pointsFor(typed, "correct", 500, 1, 1))
    const hard = generateQuestion("quick", 10, rng)
    const easy = generateQuestion("quick", 1, rng)
    expect(pointsFor(hard, "correct", 0, 1, 1)).toBeGreaterThan(pointsFor(easy, "correct", 0, 1, 1))
  })
})
