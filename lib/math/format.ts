import type { Language, Localized, Text } from "./types"

export const MINUS = "−"
const NARROW_NBSP = " "

export function L(en: string, de: string): Localized {
  return { en, de }
}

// Integers with a proper minus sign; five digits and up get a thin
// thousands separator, which reads the same in English and German.
export function fmt(n: number): string {
  const sign = n < 0 ? MINUS : ""
  const digits = String(Math.abs(n))
  if (digits.length < 5) return sign + digits
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, NARROW_NBSP)
}

// Decimals keep a "." here; `localize` turns it into a comma for German.
export function fmtDecimal(n: number, maxPlaces = 3): string {
  const rounded = Number(n.toFixed(maxPlaces))
  const sign = rounded < 0 ? MINUS : ""
  const [int, frac] = String(Math.abs(rounded)).split(".")
  return sign + fmt(Number(int)) + (frac ? "." + frac : "")
}

export function fmtFraction(numerator: number, denominator: number): string {
  const sign = numerator * denominator < 0 ? MINUS : ""
  return `${sign}${Math.abs(numerator)}/${Math.abs(denominator)}`
}

export function localize(text: Text, language: Language): string {
  const value = typeof text === "string" ? text : text[language]
  return language === "de" ? value.replace(/(\d)\.(\d)/g, "$1,$2") : value
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

export function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n % 2 === 0) return n === 2
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false
  }
  return true
}

export function smallestFactor(n: number): number {
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return i
  }
  return n
}

export function digitSum(n: number): number {
  return String(Math.abs(n))
    .split("")
    .reduce((sum, d) => sum + Number(d), 0)
}

// Rounds to `figures` significant figures: 1234 -> 1200 for 2 figures.
export function roundSignificant(n: number, figures: number): number {
  return Number(n.toPrecision(figures))
}
