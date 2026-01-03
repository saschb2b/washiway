export type GameMode = "truth" | "compare" | "digit" | "missing" | "combo"

export type GameState = "splash" | "menu" | "playing" | "results"

export interface GameStats {
  score: number
  streak: number
  maxStreak: number
  correct: number
  incorrect: number
  avgTime: number
}

export interface Question {
  id: string
  type: GameMode
  display: string
  displaySecondary?: string
  answer: number | boolean | "left" | "right"
  options?: (number | boolean | string)[]
}

export interface ModeConfig {
  id: GameMode
  name: string
  description: string
  colorClass: string
  bgClass: string
}

export const GAME_MODES: ModeConfig[] = [
  {
    id: "truth",
    name: "True or False",
    description: "Is the equation correct?",
    colorClass: "bg-pastel-blue",
    bgClass: "from-pastel-blue/20 to-pastel-blue/5",
  },
  {
    id: "compare",
    name: "Pick the Bigger",
    description: "Which side is larger?",
    colorClass: "bg-pastel-pink",
    bgClass: "from-pastel-pink/20 to-pastel-pink/5",
  },
  {
    id: "digit",
    name: "Quick Solve",
    description: "Type the answer",
    colorClass: "bg-pastel-mint",
    bgClass: "from-pastel-mint/20 to-pastel-mint/5",
  },
  {
    id: "missing",
    name: "Find the Blank",
    description: "What number is missing?",
    colorClass: "bg-pastel-peach",
    bgClass: "from-pastel-peach/20 to-pastel-peach/5",
  },
  {
    id: "combo",
    name: "Chain Mode",
    description: "Answers link together",
    colorClass: "bg-pastel-lavender",
    bgClass: "from-pastel-lavender/20 to-pastel-lavender/5",
  },
]

export const GAME_DURATION = 60
