import type { Question, GameMode } from "./game-types"

const operators = ["+", "-", "×", "÷"] as const
type Operator = (typeof operators)[number]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function evaluate(a: number, op: Operator, b: number): number {
  switch (op) {
    case "+":
      return a + b
    case "-":
      return a - b
    case "×":
      return a * b
    case "÷":
      return a / b
  }
}

function generateSimpleExpression(difficulty: number): { a: number; op: Operator; b: number; result: number } {
  // Difficulty 1: numbers 1-5, only + (trivial)
  // Difficulty 2: numbers 1-10, + and - (easy)
  // Difficulty 3: numbers 1-15, +, -, × with small multipliers (medium)
  // Difficulty 4: numbers up to 50, all ops, larger multipliers (hard)
  // Difficulty 5: numbers up to 100, multi-digit multiplication, challenging (expert)

  const maxNum = [5, 10, 15, 50, 100][difficulty - 1] || 12

  // More operators at higher difficulties
  const availableOps: Operator[] =
    difficulty === 1 ? ["+"] : difficulty === 2 ? ["+", "-"] : difficulty === 3 ? ["+", "-", "×"] : ["+", "-", "×"] // 4-5 include all but division to keep answers clean

  const op = availableOps[randomInt(0, availableOps.length - 1)]

  let a: number, b: number, result: number

  if (op === "×") {
    // Scale multiplier range dramatically with difficulty
    if (difficulty <= 2) {
      a = randomInt(2, 5)
      b = randomInt(2, 5)
    } else if (difficulty === 3) {
      a = randomInt(2, 9)
      b = randomInt(2, 9)
    } else if (difficulty === 4) {
      a = randomInt(3, 12)
      b = randomInt(3, 15)
    } else {
      // Expert: true mental math challenge
      a = randomInt(6, 25)
      b = randomInt(4, 15)
    }
    result = a * b
  } else if (op === "-") {
    if (difficulty <= 2) {
      a = randomInt(3, maxNum)
      b = randomInt(1, a)
    } else if (difficulty === 3) {
      a = randomInt(10, maxNum)
      b = randomInt(1, a)
    } else if (difficulty === 4) {
      a = randomInt(20, maxNum)
      b = randomInt(5, a - 1)
    } else {
      // Expert: larger subtraction
      a = randomInt(50, maxNum)
      b = randomInt(10, a - 1)
    }
    result = a - b
  } else {
    // Addition
    if (difficulty <= 2) {
      a = randomInt(1, maxNum)
      b = randomInt(1, maxNum)
    } else if (difficulty === 3) {
      a = randomInt(5, maxNum)
      b = randomInt(5, maxNum)
    } else if (difficulty === 4) {
      a = randomInt(10, maxNum)
      b = randomInt(10, maxNum)
    } else {
      // Expert: multi-digit addition
      a = randomInt(25, maxNum)
      b = randomInt(25, maxNum)
    }
    result = a + b
  }

  return { a, op, b, result }
}

export function generateQuestion(mode: GameMode, difficulty: number, prevAnswer?: number): Question {
  const id = Math.random().toString(36).substring(2, 9)
  // Clamp difficulty to 1-5
  const clampedDifficulty = Math.max(1, Math.min(5, difficulty))

  switch (mode) {
    case "truth": {
      const { a, op, b, result } = generateSimpleExpression(clampedDifficulty)
      const isCorrect = Math.random() > 0.5
      // Deviation scales with difficulty to make wrong answers less obvious at higher levels
      const deviationRange = [1, 2, 3, 5, 10][clampedDifficulty - 1] || 2
      const deviation = randomInt(1, deviationRange)
      const displayResult = isCorrect ? result : result + deviation * (Math.random() > 0.5 ? 1 : -1)

      return {
        id,
        type: "truth",
        display: `${a} ${op} ${b} = ${displayResult}`,
        answer: isCorrect,
      }
    }

    case "compare": {
      const expr1 = generateSimpleExpression(clampedDifficulty)
      let expr2 = generateSimpleExpression(clampedDifficulty)

      // Ensure they're different but not too obviously different at higher levels
      let attempts = 0
      while (expr1.result === expr2.result || (clampedDifficulty >= 4 && Math.abs(expr1.result - expr2.result) > 50)) {
        expr2 = generateSimpleExpression(clampedDifficulty)
        attempts++
        if (attempts > 20) break
      }

      return {
        id,
        type: "compare",
        display: `${expr1.a} ${expr1.op} ${expr1.b}`,
        displaySecondary: `${expr2.a} ${expr2.op} ${expr2.b}`,
        answer: expr1.result > expr2.result ? "left" : "right",
      }
    }

    case "digit": {
      const { a, op, b, result } = generateSimpleExpression(clampedDifficulty)
      return {
        id,
        type: "digit",
        display: `${a} ${op} ${b} = ?`,
        answer: result,
      }
    }

    case "missing": {
      const { a, op, b, result } = generateSimpleExpression(clampedDifficulty)
      const missingFirst = Math.random() > 0.5

      if (missingFirst) {
        return {
          id,
          type: "missing",
          display: `? ${op} ${b} = ${result}`,
          answer: a,
        }
      } else {
        return {
          id,
          type: "missing",
          display: `${a} ${op} ? = ${result}`,
          answer: b,
        }
      }
    }

    case "combo": {
      // Chain mode scales starting value and delta with difficulty
      const baseMin = [5, 10, 15, 25, 50][clampedDifficulty - 1] || 10
      const baseMax = [15, 25, 40, 75, 150][clampedDifficulty - 1] || 20
      const base = prevAnswer ?? randomInt(baseMin, baseMax)
      const ops: Operator[] = ["+", "-"]
      const op = ops[randomInt(0, ops.length - 1)]
      const maxDelta = [5, 10, 15, 25, 40][clampedDifficulty - 1] || 8
      const b = randomInt(1, Math.min(maxDelta, base - 1))
      const result = evaluate(base, op, b)

      return {
        id,
        type: "combo",
        display: `${base} ${op} ${b} = ?`,
        answer: Math.max(1, result),
      }
    }

    default:
      return generateQuestion("truth", clampedDifficulty)
  }
}
