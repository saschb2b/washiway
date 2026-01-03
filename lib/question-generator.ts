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

function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false
  }
  return true
}

type MatchRule = {
  id: string
  label: string
  labelDe: string
  check: (value: number) => boolean
  difficulty: number
}

function getMatchRules(difficulty: number): MatchRule[] {
  const targetSum = difficulty <= 2 ? randomInt(5, 12) : difficulty === 3 ? randomInt(10, 20) : randomInt(15, 30)
  const multipleOf = difficulty <= 2 ? randomInt(2, 5) : randomInt(3, 9)
  const closerTo = difficulty <= 3 ? randomInt(10, 25) : randomInt(20, 50)

  const easyRules: MatchRule[] = [
    { id: "even", label: "Even", labelDe: "Gerade", check: (v) => v % 2 === 0, difficulty: 1 },
    { id: "odd", label: "Odd", labelDe: "Ungerade", check: (v) => v % 2 !== 0, difficulty: 1 },
    {
      id: `sum-${targetSum}`,
      label: `= ${targetSum}`,
      labelDe: `= ${targetSum}`,
      check: (v) => v === targetSum,
      difficulty: 1,
    },
    { id: `gt-10`, label: "> 10", labelDe: "> 10", check: (v) => v > 10, difficulty: 1 },
    { id: `lt-10`, label: "< 10", labelDe: "< 10", check: (v) => v < 10, difficulty: 1 },
  ]

  const mediumRules: MatchRule[] = [
    {
      id: `mult-${multipleOf}`,
      label: `Multiple of ${multipleOf}`,
      labelDe: `Vielfaches von ${multipleOf}`,
      check: (v) => v % multipleOf === 0,
      difficulty: 2,
    },
    {
      id: `closest-${closerTo}`,
      label: `Closest to ${closerTo}`,
      labelDe: `Nächste zu ${closerTo}`,
      check: () => true,
      difficulty: 2,
    }, // Special handling
    { id: "gt-20", label: "> 20", labelDe: "> 20", check: (v) => v > 20, difficulty: 2 },
    { id: "two-digit", label: "Two digits", labelDe: "Zweistellig", check: (v) => v >= 10 && v <= 99, difficulty: 2 },
  ]

  const hardRules: MatchRule[] = [
    { id: "prime", label: "Prime", labelDe: "Primzahl", check: isPrime, difficulty: 3 },
    {
      id: `div-${multipleOf}`,
      label: `Divisible by ${multipleOf}`,
      labelDe: `Teilbar durch ${multipleOf}`,
      check: (v) => v % multipleOf === 0,
      difficulty: 3,
    },
    {
      id: "square",
      label: "Perfect square",
      labelDe: "Quadratzahl",
      check: (v) => Math.sqrt(v) % 1 === 0 && v > 0,
      difficulty: 4,
    },
  ]

  if (difficulty <= 1) return easyRules
  if (difficulty === 2) return [...easyRules, ...mediumRules.slice(0, 2)]
  if (difficulty === 3) return [...easyRules.slice(2), ...mediumRules]
  return [...mediumRules, ...hardRules]
}

function generateMatchQuestion(difficulty: number): Question {
  const id = Math.random().toString(36).substring(2, 9)
  const rules = getMatchRules(difficulty)
  const rule = rules[randomInt(0, rules.length - 1)]

  // Generate 3 expressions
  const expressions: { display: string; value: number }[] = []
  const maxNum = [8, 12, 18, 30, 50][difficulty - 1] || 12

  // Handle "closest to X" specially
  if (rule.id.startsWith("closest-")) {
    const target = Number.parseInt(rule.id.split("-")[1])
    const values: number[] = []

    // Generate 3 different values with different distances to target
    while (values.length < 3) {
      const expr = generateSimpleExpression(difficulty)
      if (!values.includes(expr.result) && Math.abs(expr.result - target) <= 20) {
        values.push(expr.result)
        expressions.push({ display: `${expr.a} ${expr.op} ${expr.b}`, value: expr.result })
      }
      if (expressions.length > 50) break // Safety
    }

    // Find the closest one
    let closestIdx = 0
    let closestDist = Math.abs(expressions[0].value - target)
    for (let i = 1; i < expressions.length; i++) {
      const dist = Math.abs(expressions[i].value - target)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = i
      }
    }

    return {
      id,
      type: "match",
      display: rule.label,
      displaySecondary: rule.labelDe,
      answer: closestIdx,
      options: expressions.map((e) => e.display),
    }
  }

  // For other rules, generate one matching and two non-matching
  let matchingExpr: { display: string; value: number } | null = null
  const nonMatching: { display: string; value: number }[] = []

  let attempts = 0
  while ((!matchingExpr || nonMatching.length < 2) && attempts < 100) {
    const expr = generateSimpleExpression(difficulty)
    const exprData = { display: `${expr.a} ${expr.op} ${expr.b}`, value: expr.result }

    // Check for duplicates
    const isDuplicate = matchingExpr?.value === expr.result || nonMatching.some((e) => e.value === expr.result)
    if (isDuplicate) {
      attempts++
      continue
    }

    if (rule.check(expr.result)) {
      if (!matchingExpr) {
        matchingExpr = exprData
      }
    } else {
      if (nonMatching.length < 2) {
        nonMatching.push(exprData)
      }
    }
    attempts++
  }

  // Fallback if we couldn't generate good options
  if (!matchingExpr || nonMatching.length < 2) {
    return generateMatchQuestion(Math.max(1, difficulty - 1))
  }

  // Randomize positions
  const allOptions = [matchingExpr, ...nonMatching]
  const correctIndex = 0

  // Shuffle
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]]
  }

  const newCorrectIndex = allOptions.findIndex((o) => o === matchingExpr)

  return {
    id,
    type: "match",
    display: rule.label,
    displaySecondary: rule.labelDe,
    answer: newCorrectIndex,
    options: allOptions.map((e) => e.display),
  }
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

    case "match": {
      return generateMatchQuestion(clampedDifficulty)
    }

    default:
      return generateQuestion("truth", clampedDifficulty)
  }
}
