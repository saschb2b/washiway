"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useProgression, type WashiRoll } from "./progression-context"

interface ThemeContextValue {
  currentRoll: WashiRoll
  patternCSS: string
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}

// Generate CSS pattern based on roll pattern type
function generatePatternCSS(roll: WashiRoll): string {
  const patterns: Record<WashiRoll["pattern"], string> = {
    dots: `radial-gradient(circle, ${roll.colors.secondary} 1.5px, transparent 1.5px)`,
    stripes: `repeating-linear-gradient(45deg, transparent, transparent 8px, ${roll.colors.secondary} 8px, ${roll.colors.secondary} 12px)`,
    gingham: `
      linear-gradient(90deg, ${roll.colors.secondary}40 50%, transparent 50%),
      linear-gradient(${roll.colors.secondary}40 50%, transparent 50%)
    `,
    confetti: `
      radial-gradient(circle, ${roll.colors.secondary} 1px, transparent 1px),
      radial-gradient(circle, ${roll.colors.highlight} 1px, transparent 1px)
    `,
    grid: `
      linear-gradient(${roll.colors.secondary} 1px, transparent 1px),
      linear-gradient(90deg, ${roll.colors.secondary} 1px, transparent 1px)
    `,
    waves: `repeating-linear-gradient(0deg, transparent, transparent 6px, ${roll.colors.secondary} 6px, ${roll.colors.secondary} 8px)`,
    hearts: `radial-gradient(circle, ${roll.colors.secondary} 2px, transparent 2px)`,
    stars: `radial-gradient(circle, ${roll.colors.secondary} 1.5px, transparent 1.5px)`,
  }
  return patterns[roll.pattern]
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { getSelectedRoll } = useProgression()
  const currentRoll = getSelectedRoll()
  const patternCSS = generatePatternCSS(currentRoll)

  // Apply CSS custom properties for the selected roll
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--theme-primary", currentRoll.colors.primary)
    root.style.setProperty("--theme-secondary", currentRoll.colors.secondary)
    root.style.setProperty("--theme-highlight", currentRoll.colors.highlight)
    root.style.setProperty("--theme-muted", currentRoll.colors.muted)
  }, [currentRoll])

  return <ThemeContext.Provider value={{ currentRoll, patternCSS }}>{children}</ThemeContext.Provider>
}
