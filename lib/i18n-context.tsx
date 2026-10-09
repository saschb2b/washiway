"use client"

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react"
import { type GameMode, type Language, localize, type Text } from "./math"

export type { Language } from "./math"

interface ModeText {
  name: string
  description: string
  // What practising this mode builds, in one honest sentence.
  trains: string
}

interface Translations {
  splash: {
    tagline: string
    tapToStart: string
  }
  menu: {
    chooseMode: string
  }
  modes: Record<GameMode, ModeText>
  config: {
    yourBest: string
    pts: string
    level: string
    levelHint: string
    yourLevels: string
    startGame: string
    timed: string
    untimed: string
    infoTimed: string
    infoUntimed: string
  }
  game: {
    burst: string
    skip: string
    tapToContinue: string
    solution: string
    keypadHint: string
  }
  results: {
    gameOver: string
    practiceDone: string
    points: string
    newBest: string
    bestStreak: string
    accuracy: string
    correct: string
    avgTime: string
    streak: string
    playAgain: string
    changeMode: string
    levels: string
    reviewSaved: (count: number) => string
  }
  inputs: {
    true: string
    false: string
  }
}

const translations: Record<Language, Translations> = {
  en: {
    splash: {
      tagline: "Find your flow.",
      tapToStart: "Tap to start",
    },
    menu: {
      chooseMode: "Pick a pattern",
    },
    modes: {
      quick: {
        name: "Quick Math",
        description: "Type the answer",
        trains: "Fluent arithmetic and the shortcuts behind it: compensating, near squares, ×11, percentages.",
      },
      check: {
        name: "Fact or Fib",
        description: "Spot the mistake",
        trains: "Checking results fast — last digit, odd or even, rough size, working backwards — and classic traps.",
      },
      estimate: {
        name: "Ballpark",
        description: "Estimate and compare",
        trains:
          "Number sense for everyday life: rounding, orders of magnitude, fractions vs. decimals, percent changes.",
      },
      line: {
        name: "Number Line",
        description: "Place the number",
        trains: "A precise feel for where numbers live, fractions and decimals included.",
      },
      gap: {
        name: "Fill the Gap",
        description: "Find the missing number",
        trains: "Inverse operations, the equals sign as a balance, number patterns and first steps in algebra.",
      },
      target: {
        name: "Make the Target",
        description: "Combine tiles to hit it",
        trains: "Seeing number relationships at a glance: bonds to 10, 100 and 1, factor pairs, differences.",
      },
      growth: {
        name: "Grow & Shrink",
        description: "Percent, growth and doubling",
        trains:
          "A feel for repeated change: percent as a factor, getting back after a drop, doubling times, percent vs. percentage points — and why small rates add up.",
      },
      mix: {
        name: "Mixed Bag",
        description: "Every skill, interleaved",
        trains: "Switching task types makes you pick the right approach each time — practice that sticks longer.",
      },
    },
    config: {
      yourBest: "Your Best",
      pts: "pts",
      level: "Level",
      levelHint: "Adapts to you after every answer",
      yourLevels: "Your levels",
      startGame: "Let's Go!",
      timed: "60 s sprint",
      untimed: "20 tasks, no clock",
      infoTimed: "Fast and right scores most · quick guesses cost points",
      infoUntimed: "Take your time · your level still adapts",
    },
    game: {
      burst: "BURST!",
      skip: "Don't know",
      tapToContinue: "Tap to continue",
      solution: "Solution",
      keypadHint: "Keys: 0–9, Backspace, − for negative",
    },
    results: {
      gameOver: "Session Complete",
      practiceDone: "Practice Complete",
      points: "points",
      newBest: "New Best!",
      bestStreak: "Best Streak",
      accuracy: "Accuracy",
      correct: "Correct",
      avgTime: "Avg Time",
      streak: "Streak!",
      playAgain: "Again!",
      changeMode: "Menu",
      levels: "Levels",
      reviewSaved: (count) => (count === 1 ? "1 task saved for review" : `${count} tasks saved for review`),
    },
    inputs: {
      true: "TRUE",
      false: "FALSE",
    },
  },
  de: {
    splash: {
      tagline: "Finde deinen Flow.",
      tapToStart: "Tippen zum Starten",
    },
    menu: {
      chooseMode: "Wähle ein Muster",
    },
    modes: {
      quick: {
        name: "Kopfrechnen",
        description: "Tippe das Ergebnis",
        trains: "Sicheres Rechnen und die Tricks dahinter: Ausgleichen, Quadratzahlen, ×11, Prozente.",
      },
      check: {
        name: "Stimmt's?",
        description: "Finde den Fehler",
        trains:
          "Ergebnisse schnell prüfen – Endziffer, gerade oder ungerade, Größenordnung, Rückwärtsrechnen – und typische Denkfallen.",
      },
      estimate: {
        name: "Überschlag",
        description: "Schätzen und vergleichen",
        trains: "Zahlengefühl für den Alltag: Runden, Größenordnungen, Brüche vs. Dezimalzahlen, Prozentänderungen.",
      },
      line: {
        name: "Zahlenstrahl",
        description: "Platziere die Zahl",
        trains: "Ein genaues Gefühl dafür, wo Zahlen liegen – auch Brüche und Dezimalzahlen.",
      },
      gap: {
        name: "Lückenrechnen",
        description: "Finde die fehlende Zahl",
        trains: "Umkehraufgaben, das Gleichheitszeichen als Waage, Zahlenmuster und erste Schritte in Algebra.",
      },
      target: {
        name: "Zielzahl",
        description: "Kombiniere die Kärtchen",
        trains: "Zahlbeziehungen auf einen Blick: Ergänzen zu 10, 100 und 1, Faktorpaare, Differenzen.",
      },
      growth: {
        name: "Wachsen & Schrumpfen",
        description: "Prozent, Wachstum, Verdoppeln",
        trains:
          "Ein Gefühl für wiederholte Veränderung: Prozent als Faktor, zurück nach einem Minus, Verdopplungszeit, Prozent vs. Prozentpunkte – und warum kleine Raten sich summieren.",
      },
      mix: {
        name: "Gemischt",
        description: "Alle Fertigkeiten im Wechsel",
        trains:
          "Wechselnde Aufgabentypen zwingen dich, jedes Mal den passenden Weg zu wählen – das bleibt länger hängen.",
      },
    },
    config: {
      yourBest: "Dein Bestes",
      pts: "Pkt",
      level: "Level",
      levelHint: "Passt sich nach jeder Antwort an dich an",
      yourLevels: "Deine Level",
      startGame: "Los geht's!",
      timed: "60-s-Sprint",
      untimed: "20 Aufgaben, ohne Uhr",
      infoTimed: "Schnell und richtig bringt am meisten · schnelles Raten kostet Punkte",
      infoUntimed: "Lass dir Zeit · dein Level passt sich trotzdem an",
    },
    game: {
      burst: "BURST!",
      skip: "Weiß nicht",
      tapToContinue: "Tippen zum Weiter",
      solution: "Lösung",
      keypadHint: "Tasten: 0–9, Rücktaste, − für negativ",
    },
    results: {
      gameOver: "Session beendet",
      practiceDone: "Übung beendet",
      points: "Punkte",
      newBest: "Neuer Rekord!",
      bestStreak: "Beste Serie",
      accuracy: "Genauigkeit",
      correct: "Richtig",
      avgTime: "Ø Zeit",
      streak: "Serie!",
      playAgain: "Nochmal!",
      changeMode: "Menü",
      levels: "Level",
      reviewSaved: (count) =>
        count === 1 ? "1 Aufgabe zum Wiederholen gemerkt" : `${count} Aufgaben zum Wiederholen gemerkt`,
    },
    inputs: {
      true: "WAHR",
      false: "FALSCH",
    },
  },
}

const LANGUAGE_KEY = "washiway-language"
const listeners = new Set<() => void>()
let chosen: Language | null = null

function readLanguage(): Language {
  if (chosen) return chosen
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    if (saved === "en" || saved === "de") return saved
  } catch {
    // Fall through to the browser language.
  }
  return navigator.language.toLowerCase().startsWith("de") ? "de" : "en"
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  // The static export renders English; the browser then switches to the
  // saved or preferred language.
  const language = useSyncExternalStore(subscribe, readLanguage, () => "en" as Language)

  const setLanguage = useCallback((lang: Language) => {
    chosen = lang
    try {
      localStorage.setItem(LANGUAGE_KEY, lang)
    } catch {
      // Not persisted; still switch for this visit.
    }
    document.documentElement.lang = lang
    listeners.forEach((listener) => listener())
  }, [])

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: translations[language] }}>{children}</I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}

// Turns generated math text into the current language (incl. decimal commas).
export function useLocalize() {
  const { language } = useI18n()
  return useCallback((text: Text) => localize(text, language), [language])
}
