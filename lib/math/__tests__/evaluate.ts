// An independent evaluator for the English notation the generators print,
// so tests can recompute every task instead of trusting the generator.

const SUPERSCRIPTS: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
}

const CONSTANTS: Record<string, number> = { π: Math.PI, e: Math.E, φ: (1 + Math.sqrt(5)) / 2 }

export function evaluate(input: string): number {
  const text = input.replace(/[  ]/g, "").replace(/−/g, "-").trim()
  if (text.includes("→")) return evaluateChain(text)
  let pos = 0

  const peek = () => text[pos]
  const skipSpaces = () => {
    while (text[pos] === " ") pos++
  }

  function expression(): number {
    let value = term()
    for (;;) {
      skipSpaces()
      const c = peek()
      if (c === "+" || c === "-") {
        pos++
        const right = term()
        value = c === "+" ? value + right : value - right
      } else return value
    }
  }

  function term(): number {
    let value = unary()
    for (;;) {
      skipSpaces()
      const c = peek()
      if (c === "×" || c === "÷" || c === "/") {
        pos++
        const right = unary()
        value = c === "×" ? value * right : value / right
      } else if (text.startsWith("of ", pos)) {
        pos += 3
        value = value * unary()
      } else return value
    }
  }

  function unary(): number {
    skipSpaces()
    if (peek() === "-") {
      pos++
      return -unary()
    }
    return power()
  }

  function power(): number {
    let base = primary()
    let exponent = ""
    while (pos < text.length && SUPERSCRIPTS[text[pos]] !== undefined) exponent += SUPERSCRIPTS[text[pos++]]
    if (exponent) base = Math.pow(base, Number(exponent))
    if (peek() === "%") {
      pos++
      base /= 100
    }
    if (peek() === "^") {
      pos++
      base = Math.pow(base, primary())
    }
    return base
  }

  function primary(): number {
    skipSpaces()
    const c = peek()
    if (c === "(") {
      pos++
      const value = expression()
      skipSpaces()
      if (peek() !== ")") throw new Error(`Expected ) in "${input}"`)
      pos++
      return value
    }
    if (c === "√") {
      pos++
      return Math.sqrt(power())
    }
    if (CONSTANTS[c] !== undefined && !/[a-z]/i.test(text[pos + 1] ?? "")) {
      pos++
      return CONSTANTS[c]
    }
    const match = /^\d+(\.\d+)?/.exec(text.slice(pos))
    if (!match) throw new Error(`Unexpected "${text.slice(pos)}" in "${input}"`)
    pos += match[0].length
    let value = Number(match[0])
    if (peek() === "%") {
      pos++
      value /= 100
    }
    return value
  }

  const value = expression()
  skipSpaces()
  if (pos !== text.length) throw new Error(`Trailing "${text.slice(pos)}" in "${input}"`)
  return value
}

function evaluateChain(text: string): number {
  const [start, ...steps] = text.split("→").map((s) => s.trim())
  let value = evaluate(start)
  for (const step of steps) {
    if (step === "²") value = value * value
    else if (step.endsWith("%")) value *= 1 + Number(step.slice(0, -1)) / 100
    else {
      const operand = Number(step.slice(1))
      const op = step[0]
      if (op === "×") value *= operand
      else if (op === "÷") value /= operand
      else if (op === "+") value += operand
      else if (op === "-") value -= operand
      else throw new Error(`Unknown chain step ${step}`)
    }
  }
  return value
}

export function close(a: number, b: number, epsilon = 1e-9): boolean {
  return Math.abs(a - b) <= epsilon * Math.max(1, Math.abs(a), Math.abs(b))
}
