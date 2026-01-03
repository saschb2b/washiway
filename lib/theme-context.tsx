"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useProgression, type WashiRoll } from "./progression-context"

interface ThemeContextValue {
  currentRoll: WashiRoll
  patternCSS: string
  getPatternSVG: (color?: string) => string
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}

function getPatternSVGString(pattern: WashiRoll["pattern"], color: string): string {
  const patterns: Record<WashiRoll["pattern"], string> = {
    mint: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><ellipse cx="9" cy="9" rx="3" ry="5" fill="${color}" transform="rotate(-15 9 9)"/><line x1="9" y1="5" x2="9" y2="14" stroke="white" strokeWidth="0.8" opacity="0.4"/></svg>`,
    pokeballs: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="7" fill="none" stroke="${color}" strokeWidth="1.5"/><line x1="3" y1="10" x2="17" y2="10" stroke="${color}" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" fill="${color}"/></svg>`,
    cats: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="14" r="6" fill="${color}"/><polygon points="6,8 8,14 4,14" fill="${color}"/><polygon points="18,8 16,14 20,14" fill="${color}"/><circle cx="10" cy="13" r="1" fill="white"/><circle cx="14" cy="13" r="1" fill="white"/><ellipse cx="12" cy="15.5" rx="1" ry="0.7" fill="white"/></svg>`,
    dogs: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"><ellipse cx="11" cy="14" rx="4" ry="3.5" fill="${color}"/><circle cx="6" cy="9" r="2" fill="${color}"/><circle cx="11" cy="7" r="2" fill="${color}"/><circle cx="16" cy="9" r="2" fill="${color}"/></svg>`,
    frogs: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20"><ellipse cx="12" cy="12" rx="8" ry="6" fill="${color}"/><circle cx="7" cy="7" r="3" fill="${color}"/><circle cx="17" cy="7" r="3" fill="${color}"/><circle cx="7" cy="7" r="1.5" fill="white"/><circle cx="17" cy="7" r="1.5" fill="white"/><ellipse cx="12" cy="13" rx="2" ry="1" fill="white" opacity="0.6"/></svg>`,
    flowers: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="7" r="3" fill="${color}"/><circle cx="7" cy="10" r="3" fill="${color}"/><circle cx="13" cy="10" r="3" fill="${color}"/><circle cx="10" cy="13" r="3" fill="${color}"/><circle cx="10" cy="10" r="2" fill="white"/></svg>`,
    snowflakes: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><line x1="12" y1="4" x2="12" y2="20" stroke="${color}" strokeWidth="1.5"/><line x1="4" y1="12" x2="20" y2="12" stroke="${color}" strokeWidth="1.5"/><line x1="6" y1="6" x2="18" y2="18" stroke="${color}" strokeWidth="1.5"/><line x1="18" y1="6" x2="6" y2="18" stroke="${color}" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" fill="${color}"/></svg>`,
    bees: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"><ellipse cx="11" cy="12" rx="5" ry="4" fill="${color}"/><line x1="8" y1="11" x2="14" y2="11" stroke="white" strokeWidth="1.5"/><line x1="8" y1="13" x2="14" y2="13" stroke="white" strokeWidth="1.5"/><circle cx="8" cy="9" r="2" fill="${color}" opacity="0.5"/><circle cx="14" cy="9" r="2" fill="${color}" opacity="0.5"/></svg>`,
    leaves: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><ellipse cx="10" cy="10" rx="4" ry="6" fill="${color}" transform="rotate(30 10 10)"/><line x1="10" y1="5" x2="10" y2="16" stroke="white" strokeWidth="1" opacity="0.5"/></svg>`,
    music: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><ellipse cx="8" cy="16" rx="3" ry="2.5" fill="${color}" transform="rotate(-20 8 16)"/><line x1="11" y1="15" x2="11" y2="6" stroke="${color}" strokeWidth="1.5"/><path d="M11 6 Q15 5 15 9" stroke="${color}" strokeWidth="1.5" fill="none"/></svg>`,
    stars: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill="${color}"/></svg>`,
  }
  return patterns[pattern] || patterns.mint
}

function getPatternSize(pattern: WashiRoll["pattern"]): string {
  const sizes: Record<WashiRoll["pattern"], string> = {
    mint: "18px 18px",
    pokeballs: "20px 20px",
    cats: "24px 24px",
    dogs: "22px 22px",
    frogs: "24px 20px",
    flowers: "20px 20px",
    snowflakes: "24px 24px",
    bees: "22px 22px",
    leaves: "20px 20px",
    music: "24px 24px",
    stars: "20px 20px",
  }
  return sizes[pattern] || "18px 18px"
}

// Generate CSS background-image for the pattern
function generatePatternCSS(roll: WashiRoll): string {
  const svg = getPatternSVGString(roll.pattern, roll.colors.secondary)
  const encoded = encodeURIComponent(svg)
  return `url("data:image/svg+xml,${encoded}")`
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
    root.style.setProperty("--theme-pattern", patternCSS)
    root.style.setProperty("--theme-pattern-size", getPatternSize(currentRoll.pattern))
  }, [currentRoll, patternCSS])

  const getPatternSVG = (color?: string) => {
    return getPatternSVGString(currentRoll.pattern, color || currentRoll.colors.secondary)
  }

  return <ThemeContext.Provider value={{ currentRoll, patternCSS, getPatternSVG }}>{children}</ThemeContext.Provider>
}
