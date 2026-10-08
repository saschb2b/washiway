// "Fact or Fib": judge a claim. Wrong claims are never far off — a quick
// plausibility glance can't reject them. They are built so that a real
// checking strategy (last digit, parity, rough size, working backwards)
// catches them, and number-fact claims target classic misconceptions.

import { type Calc, cat, drawCalc, sup } from "../arithmetic"
import { L, MINUS, fmt, fmtDecimal, gcd, isPrime, lcm, roundSignificant, smallestFactor } from "../format"
import { type Rng, chance, pick, randInt, weighted } from "../random"
import type { Localized, QuestionDraft, Text } from "../types"

const PROMPT = L("True or false?", "Stimmt das?")

interface Claim {
  display: Text
  truth: boolean
  explanation: Text
}

const TRUE = L("True: ", "Stimmt: ")
const FALSE = L("False: ", "Falsch: ")

// A wrong result for a calculation, plus the check that exposes it.
function lure(calc: Calc, tier: number, rng: Rng): { shown: number; why: Text | null } {
  const v = calc.value
  const { a, b } = calc
  const plain = a !== undefined && b !== undefined

  if (calc.op === "×" && plain) {
    const options: [string, number][] = [["lastDigit", 3]]
    if ((a % 2 === 0 || b % 2 === 0) && v % 2 === 0) options.push(["parity", 1])
    if (tier >= 6 && v >= 100) options.push(["size", 1])
    const kind = weighted(rng, options)
    if (kind === "size") {
      const rough = roundSignificant(a, 1) * roundSignificant(b, 1)
      const shown = chance(rng, 0.5) || v % 10 !== 0 ? v * 10 : v / 10
      return {
        shown,
        why: L(
          `rough size ${fmt(roundSignificant(a, 1))} × ${fmt(roundSignificant(b, 1))} ≈ ${fmt(rough)}`,
          `Größenordnung ${fmt(roundSignificant(a, 1))} × ${fmt(roundSignificant(b, 1))} ≈ ${fmt(rough)}`,
        ),
      }
    }
    if (kind === "parity") {
      return {
        shown: v + pick(rng, [-1, 1, 3]),
        why: L("an even factor makes the product even", "ein gerader Faktor macht das Produkt gerade"),
      }
    }
    const shown = v + pick(rng, [-4, -3, -2, -1, 1, 2, 3, 4, 6])
    const ua = a % 10
    const ub = b % 10
    return {
      shown,
      why: L(
        `last digits: ${ua} × ${ub} = ${ua * ub} → ends in ${(ua * ub) % 10}`,
        `Endziffern: ${ua} × ${ub} = ${ua * ub} → endet auf ${(ua * ub) % 10}`,
      ),
    }
  }

  if ((calc.op === "+" || calc.op === "−") && plain && v >= 0) {
    if (tier >= 2 && chance(rng, 0.5)) {
      // A carry or borrow slip: the ones digit is right, the tens are not.
      const step = v >= 100 && chance(rng, 0.4) ? 100 : 10
      const shown = v - step >= 0 && chance(rng, 0.5) ? v - step : v + step
      return { shown, why: L("check the carry", "Übertrag prüfen") }
    }
    const ua = a % 10
    const ub = b % 10
    // Ones digits, with the borrowed ten shown for subtraction.
    const worked =
      calc.op === "+"
        ? `${ua} + ${ub} = ${ua + ub}`
        : `${ua < ub ? ua + 10 : ua} − ${ub} = ${(ua < ub ? ua + 10 : ua) - ub}`
    const ones = calc.op === "+" ? (ua + ub) % 10 : (ua < ub ? ua + 10 : ua) - ub
    return {
      shown: v + pick(rng, [-2, -1, 1, 2]),
      why: L(`ones: ${worked} → ends in ${ones}`, `Einer: ${worked} → endet auf ${ones}`),
    }
  }

  if (calc.op === "÷" && plain) {
    const shown = v > 2 ? v + pick(rng, [-2, -1, 1, 2]) : v + pick(rng, [1, 2])
    return {
      shown,
      why: L(
        `check backwards: ${b} × ${shown} = ${fmt(b * shown)}`,
        `Rückwärts prüfen: ${b} × ${shown} = ${fmt(b * shown)}`,
      ),
    }
  }

  // Percentages, chains, powers, negatives: a near miss; the worked solution explains it.
  const delta = Math.max(1, Math.round(Math.abs(v) * pick(rng, [0.05, 0.1, 0.2])))
  return { shown: v + (chance(rng, 0.5) ? delta : -delta), why: null }
}

function calculationClaim(tier: number, rng: Rng): Claim {
  const calc = drawCalc(tier, rng)
  const truth = chance(rng, 0.5)
  const result = truth ? null : lure(calc, tier, rng)
  const shown = result ? result.shown : calc.value
  if (shown === calc.value && result) return calculationClaim(tier, rng)
  return {
    display: cat(calc.expr, ` = ${fmt(shown)}`),
    truth,
    explanation: !result
      ? cat(TRUE, calc.explain)
      : result.why
        ? cat(FALSE, result.why, ` → ${fmt(calc.value)}`)
        : cat(FALSE, calc.explain),
  }
}

// --- Number facts and misconceptions --------------------------------------

type ClaimBuilder = (rng: Rng) => Claim

function claim(display: Text, truth: boolean, explanation: Text): Claim {
  return { display, truth, explanation: cat(truth ? TRUE : FALSE, explanation) }
}

const orderOfOperations: ClaimBuilder = (rng) => {
  const a = randInt(rng, 2, 9)
  const b = randInt(rng, 2, 9)
  const c = randInt(rng, 2, 9)
  const right = a + b * c
  const wrong = (a + b) * c
  const truth = chance(rng, 0.5)
  return claim(
    `${a} + ${b} × ${c} = ${truth ? right : wrong}`,
    truth,
    L(`× before +: ${a} + ${b * c} = ${right}`, `Punkt vor Strich: ${a} + ${b * c} = ${right}`),
  )
}

const LOOKS_PRIME = [51, 57, 87, 91, 111, 119, 133, 143, 161, 169, 187, 203, 209, 217, 221, 247, 253, 289, 299, 323]
const PRIMES = [
  53, 59, 67, 71, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 191,
  193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293,
]

const primeClaim: ClaimBuilder = (rng) => {
  const truth = chance(rng, 0.5)
  const n = truth ? pick(rng, PRIMES) : pick(rng, LOOKS_PRIME)
  const root = Math.floor(Math.sqrt(n))
  if (isPrime(n)) {
    const checked = [2, 3, 5, 7, 11, 13, 17].filter((p) => p <= root)
    return claim(
      L(`${n} is prime`, `${n} ist eine Primzahl`),
      true,
      L(
        `no divisor up to √${n} ≈ ${root} (${checked.join(", ")})`,
        `kein Teiler bis √${n} ≈ ${root} (${checked.join(", ")})`,
      ),
    )
  }
  const p = smallestFactor(n)
  return claim(L(`${n} is prime`, `${n} ist eine Primzahl`), false, `${n} = ${p} × ${n / p}`)
}

const divisibilityClaim: ClaimBuilder = (rng) => {
  const divisor = pick(rng, [3, 4, 6, 9, 11])
  const truth = chance(rng, 0.5)
  let n = randInt(rng, 1000, 9999)
  for (let i = 0; i < 50 && (n % divisor === 0) !== truth; i++) n = randInt(rng, 1000, 9999)
  if ((n % divisor === 0) !== truth) return divisibilityClaim(rng)
  const digits = String(n).split("").map(Number)
  const sum = digits.reduce((s, d) => s + d, 0)
  let rule: Localized
  if (divisor === 3 || divisor === 9) {
    rule = L(`digit sum ${digits.join("+")} = ${sum}`, `Quersumme ${digits.join("+")} = ${sum}`)
  } else if (divisor === 4) {
    rule = L(`last two digits ${n % 100} ÷ 4`, `letzte zwei Ziffern ${n % 100} ÷ 4`)
  } else if (divisor === 6) {
    rule = L(`even and digit sum ${sum}`, `gerade und Quersumme ${sum}`)
  } else {
    const alt = digits[0] - digits[1] + digits[2] - digits[3]
    rule = L(
      `alternating sum ${digits[0]}−${digits[1]}+${digits[2]}−${digits[3]} = ${fmt(alt)}`,
      `alternierende Quersumme ${digits[0]}−${digits[1]}+${digits[2]}−${digits[3]} = ${fmt(alt)}`,
    )
  }
  return claim(
    L(`${n} is divisible by ${divisor}`, `${n} ist durch ${divisor} teilbar`),
    truth,
    cat(rule, truth ? ` ✓` : ` ✗`),
  )
}

const FRACTIONS: [number, number][] = [
  [1, 2],
  [1, 4],
  [3, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [1, 8],
  [3, 8],
  [5, 8],
  [7, 8],
  [1, 20],
  [3, 20],
  [1, 25],
]

const equivalenceClaim: ClaimBuilder = (rng) => {
  const [n, d] = pick(rng, FRACTIONS)
  const value = n / d
  const asPercent = chance(rng, 0.5)
  const truth = chance(rng, 0.5)
  let shown = value
  if (!truth) {
    // Classic slips: digits copied over (3/8 = 0.38), off by a place, near neighbour.
    const slips = [
      Number(`0.${n}${d}`),
      value * 10 > 1 ? value / 10 : value * 10,
      value + pick(rng, [-0.05, 0.05, 0.025]),
    ]
    shown = pick(
      rng,
      slips.filter((s) => Math.abs(s - value) > 1e-9 && s > 0 && s < 1),
    )
  }
  const display = asPercent ? `${n}/${d} = ${fmtDecimal(shown * 100, 2)}%` : `${n}/${d} = ${fmtDecimal(shown, 4)}`
  const exact = asPercent ? `${fmtDecimal(value * 100, 2)}%` : fmtDecimal(value, 4)
  return claim(display, truth, `${n} ÷ ${d} = ${fmtDecimal(value, 4)} → ${exact}`)
}

const powerClaim: ClaimBuilder = (rng) => {
  const base = randInt(rng, 2, 5)
  const exp = base === 2 ? randInt(rng, 4, 10) : randInt(rng, 3, 4)
  const v = Math.pow(base, exp)
  const truth = chance(rng, 0.5)
  const wrong = pick(rng, [base * exp, Math.pow(base, exp - 1), base === 2 && exp === 10 ? 1000 : v + base])
  const shown = truth ? v : wrong === v ? v + 1 : wrong
  const prev = Math.pow(base, exp - 1)
  const worked =
    exp <= 4 ? Array(exp).fill(base).join(" × ") : `${base}${sup(exp - 1)} × ${base} = ${fmt(prev)} × ${base}`
  return claim(`${base}${sup(exp)} = ${fmt(shown)}`, truth, `${worked} = ${fmt(v)}`)
}

const rootClaim: ClaimBuilder = (rng) => {
  const kind = randInt(rng, 0, 2)
  if (kind === 0) {
    // √(a² + b²) is not a + b.
    const [a, b, c] = pick(rng, [
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
    ])
    const truth = chance(rng, 0.5)
    return claim(`√(${a * a} + ${b * b}) = ${truth ? c : a + b}`, truth, `√${a * a + b * b} = ${c}`)
  }
  if (kind === 1) {
    // √0.09 is 0.3, not 0.03.
    const r = randInt(rng, 2, 9)
    const truth = chance(rng, 0.5)
    const square = fmtDecimal((r * r) / 100, 4)
    return claim(`√${square} = ${truth ? `0.${r}` : `0.0${r}`}`, truth, `0.${r} × 0.${r} = ${square}`)
  }
  const r = randInt(rng, 11, 25)
  const truth = chance(rng, 0.5)
  const shown = truth ? r : r + pick(rng, [-1, 1])
  return claim(`√${r * r} = ${shown}`, truth, `${r}² = ${r * r}`)
}

const signClaim: ClaimBuilder = (rng) => {
  const a = randInt(rng, 2, 9)
  const b = randInt(rng, 2, 9)
  const kind = randInt(rng, 0, 2)
  const truth = chance(rng, 0.5)
  if (kind === 0) {
    return claim(
      `(${MINUS}${a}) × (${MINUS}${b}) = ${truth ? a * b : fmt(-a * b)}`,
      truth,
      L(`minus × minus = plus: ${a * b}`, `Minus mal Minus = Plus: ${a * b}`),
    )
  }
  if (kind === 1) {
    const v = -Math.pow(a, 3)
    return claim(
      `(${MINUS}${a})³ = ${truth ? fmt(v) : fmt(-v)}`,
      truth,
      L(`odd power keeps the sign: ${fmt(v)}`, `ungerade Potenz behält das Vorzeichen: ${fmt(v)}`),
    )
  }
  const v = b - a
  return claim(`${MINUS}${a} + ${b} = ${truth ? fmt(v) : fmt(-(a + b))}`, truth, `${b} − ${a} = ${fmt(v)}`)
}

const fractionAdditionClaim: ClaimBuilder = (rng) => {
  const [a, b] = pick(rng, [
    [2, 3],
    [2, 5],
    [3, 4],
    [3, 5],
    [4, 5],
    [2, 7],
  ])
  const truth = chance(rng, 0.5)
  const num = a + b
  const den = a * b
  const g = gcd(num, den)
  const right = `${num / g}/${den / g}`
  return claim(`1/${a} + 1/${b} = ${truth ? right : `2/${a + b}`}`, truth, `${b}/${den} + ${a}/${den} = ${right}`)
}

const percentChangeClaim: ClaimBuilder = (rng) => {
  const p = pick(rng, [10, 20, 25, 50])
  const net = Math.round(((1 + p / 100) * (1 - p / 100) - 1) * 10000) / 100
  const truth = chance(rng, 0.5)
  const shown = truth ? net : 0
  return claim(
    L(`+${p}% then −${p}% = ${fmtDecimal(shown, 2)}%`, `+${p} % dann −${p} % = ${fmtDecimal(shown, 2)} %`),
    truth,
    `${fmtDecimal(1 + p / 100, 2)} × ${fmtDecimal(1 - p / 100, 2)} = ${fmtDecimal((1 + p / 100) * (1 - p / 100), 4)} → ${fmtDecimal(net, 2)}%`,
  )
}

const percentSwapClaim: ClaimBuilder = (rng) => {
  const a = randInt(rng, 3, 9) * pick(rng, [2, 4])
  const b = pick(rng, [25, 50, 75])
  const truth = chance(rng, 0.6)
  const c = truth ? a : a + pick(rng, [-2, 2])
  return claim(
    L(`${b}% of ${a} = ${c}% of ${b}`, `${b} % von ${a} = ${c} % von ${b}`),
    truth,
    truth
      ? L(
          `x% of y = y% of x = ${fmtDecimal((a * b) / 100, 2)}`,
          `x % von y = y % von x = ${fmtDecimal((a * b) / 100, 2)}`,
        )
      : `${fmtDecimal((a * b) / 100, 2)} ≠ ${fmtDecimal((c * b) / 100, 2)}`,
  )
}

const gcdLcmClaim: ClaimBuilder = (rng) => {
  const g = randInt(rng, 2, 12)
  const x = g * randInt(rng, 2, 9)
  const y = g * randInt(rng, 2, 9)
  if (x === y) return gcdLcmClaim(rng)
  const real = gcd(x, y)
  const useLcm = chance(rng, 0.4)
  const truth = chance(rng, 0.5)
  if (useLcm) {
    const v = lcm(x, y)
    const shown = truth ? v : x * y === v ? v * 2 : x * y
    return claim(L(`lcm(${x}, ${y}) = ${shown}`, `kgV(${x}, ${y}) = ${shown}`), truth, `${x} × ${y} ÷ ${real} = ${v}`)
  }
  // A smaller common divisor is a classic slip; twice the gcd never divides both.
  const shown = truth ? real : real % 2 === 0 && chance(rng, 0.5) ? real / 2 : real * 2
  return claim(
    L(`gcd(${x}, ${y}) = ${shown}`, `ggT(${x}, ${y}) = ${shown}`),
    truth,
    `${x} = ${real} × ${x / real}, ${y} = ${real} × ${y / real}`,
  )
}

const FACTS: Record<number, [ClaimBuilder, number][]> = {
  3: [[orderOfOperations, 1]],
  4: [
    [orderOfOperations, 1],
    [signClaim, 1],
  ],
  5: [
    [primeClaim, 1],
    [divisibilityClaim, 1],
    [equivalenceClaim, 1],
    [signClaim, 1],
  ],
  6: [
    [primeClaim, 1],
    [equivalenceClaim, 1],
    [powerClaim, 1],
    [fractionAdditionClaim, 1],
    [rootClaim, 1],
  ],
  7: [
    [primeClaim, 1],
    [divisibilityClaim, 1],
    [powerClaim, 1],
    [percentChangeClaim, 1],
    [rootClaim, 1],
  ],
  8: [
    [primeClaim, 1],
    [percentSwapClaim, 1],
    [percentChangeClaim, 1],
    [gcdLcmClaim, 1],
    [equivalenceClaim, 1],
  ],
  9: [
    [primeClaim, 1],
    [divisibilityClaim, 1],
    [gcdLcmClaim, 1],
    [percentSwapClaim, 1],
    [rootClaim, 1],
  ],
  10: [
    [primeClaim, 1],
    [divisibilityClaim, 1],
    [gcdLcmClaim, 1],
    [percentChangeClaim, 1],
    [powerClaim, 1],
  ],
}

export function generateCheck(tier: number, rng: Rng): QuestionDraft {
  const facts = FACTS[tier]
  const useFact = facts !== undefined && chance(rng, tier >= 7 ? 0.5 : 0.35)
  const c = useFact ? weighted(rng, facts)(rng) : calculationClaim(tier, rng)
  return { kind: "truefalse", prompt: PROMPT, display: c.display, answer: c.truth, explanation: c.explanation }
}
