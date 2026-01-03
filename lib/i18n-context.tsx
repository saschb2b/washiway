"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type Language = "en" | "de"

interface Translations {
  // Splash screen
  splash: {
    tagline: string
    tapToStart: string
  }
  // Main menu
  menu: {
    chooseMode: string
    streakHint: string
  }
  // Mode names and descriptions
  modes: {
    truth: { name: string; description: string }
    compare: { name: string; description: string }
    digit: { name: string; description: string }
    missing: { name: string; description: string }
    combo: { name: string; description: string }
    match: { name: string; description: string }
  }
  // Mode config sheet
  config: {
    yourBest: string
    pts: string
    difficulty: string
    startGame: string
    gameInfo: string
    difficultyDescriptions: Record<number, string>
  }
  // Difficulty labels
  difficulty: {
    chill: string
    easy: string
    medium: string
    hard: string
    expert: string
  }
  // Game screen
  game: {
    burst: string
  }
  // Results screen
  results: {
    gameOver: string
    points: string
    newBest: string
    bestStreak: string
    accuracy: string
    correct: string
    avgTime: string
    streak: string
    playAgain: string
    changeMode: string
  }
  // Inputs
  inputs: {
    true: string
    false: string
    left: string
    right: string
  }
  // Binder translations
  binder: {
    title: string
    rolls: string
    achievements: string
    swatches: string
    unlockNew: string
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
      streakHint: "Stick with the streak",
    },
    modes: {
      truth: { name: "True or False", description: "Is the equation correct?" },
      compare: { name: "Pick the Bigger", description: "Which side is larger?" },
      digit: { name: "Quick Solve", description: "Type the answer" },
      missing: { name: "Find the Blank", description: "What number is missing?" },
      combo: { name: "Chain Mode", description: "Answers link together" },
      match: { name: "Tape Match", description: "Match the pattern rule" },
    },
    config: {
      yourBest: "Your Best",
      pts: "pts",
      difficulty: "Difficulty",
      startGame: "Let's Go!",
      gameInfo: "60 seconds • Build streaks for bonus points",
      difficultyDescriptions: {
        1: "Single-digit addition only. Perfect for warming up.",
        2: "Simple addition and subtraction with small numbers.",
        3: "Mixed operations including multiplication.",
        4: "Larger numbers and trickier calculations.",
        5: "Multi-digit operations. True mental math challenge!",
      },
    },
    difficulty: {
      chill: "Chill",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      expert: "Expert",
    },
    game: {
      burst: "BURST!",
    },
    results: {
      gameOver: "Session Complete",
      points: "points",
      newBest: "New Best!",
      bestStreak: "Best Streak",
      accuracy: "Accuracy",
      correct: "Correct",
      avgTime: "Avg Time",
      streak: "Streak!",
      playAgain: "Again!",
      changeMode: "Menu",
    },
    inputs: {
      true: "TRUE",
      false: "FALSE",
      left: "LEFT",
      right: "RIGHT",
    },
    binder: {
      title: "My Washi Binder",
      rolls: "Tape Rolls",
      achievements: "Achievements",
      swatches: "Swatches",
      unlockNew: "New roll unlocked!",
    },
  },
  de: {
    splash: {
      tagline: "Finde deinen Flow.",
      tapToStart: "Tippen zum Starten",
    },
    menu: {
      chooseMode: "Wähle ein Muster",
      streakHint: "Bleib an der Serie dran",
    },
    modes: {
      truth: { name: "Wahr oder Falsch", description: "Stimmt die Gleichung?" },
      compare: { name: "Finde das Größere", description: "Welche Seite ist größer?" },
      digit: { name: "Schnell Lösen", description: "Tippe die Antwort" },
      missing: { name: "Finde die Lücke", description: "Welche Zahl fehlt?" },
      combo: { name: "Ketten-Modus", description: "Antworten verknüpfen sich" },
      match: { name: "Tape Match", description: "Finde die passende Regel" },
    },
    config: {
      yourBest: "Dein Bestes",
      pts: "Pkt",
      difficulty: "Schwierigkeit",
      startGame: "Los geht's!",
      gameInfo: "60 Sekunden • Baue Serien für Bonuspunkte",
      difficultyDescriptions: {
        1: "Nur einstellige Addition. Perfekt zum Aufwärmen.",
        2: "Einfache Addition und Subtraktion mit kleinen Zahlen.",
        3: "Gemischte Operationen inklusive Multiplikation.",
        4: "Größere Zahlen und kniffligere Berechnungen.",
        5: "Mehrstellige Operationen. Echte Kopfrechnen-Herausforderung!",
      },
    },
    difficulty: {
      chill: "Locker",
      easy: "Leicht",
      medium: "Mittel",
      hard: "Schwer",
      expert: "Experte",
    },
    game: {
      burst: "BURST!",
    },
    results: {
      gameOver: "Session beendet",
      points: "Punkte",
      newBest: "Neuer Rekord!",
      bestStreak: "Beste Serie",
      accuracy: "Genauigkeit",
      correct: "Richtig",
      avgTime: "Ø Zeit",
      streak: "Serie!",
      playAgain: "Nochmal!",
      changeMode: "Menü",
    },
    inputs: {
      true: "WAHR",
      false: "FALSCH",
      left: "LINKS",
      right: "RECHTS",
    },
    binder: {
      title: "Mein Washi Binder",
      rolls: "Tape Rollen",
      achievements: "Erfolge",
      swatches: "Swatches",
      unlockNew: "Neue Rolle freigeschaltet!",
    },
  },
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
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
