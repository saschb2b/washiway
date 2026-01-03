"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react"
import type { GameMode, Question, GameStats } from "./game-types"
import { generateQuestion } from "./question-generator"
import { useSettings } from "./settings-context"
import { useAudio } from "./audio-context"

interface FeedbackState {
  type: "correct" | "wrong" | null
  chosenValue?: unknown
  correctValue?: unknown
  points?: number
}

type TransitionPhase = "idle" | "feedback" | "transitioning"

interface GameContextValue {
  question: Question
  score: number
  streak: number
  maxStreak: number
  correct: number
  incorrect: number
  timeLeft: number
  difficulty: number
  feedback: FeedbackState
  isBurstMode: boolean
  burstCount: number
  burstLength: number
  multiplier: number
  submitAnswer: (answer: unknown) => void
  startGame: (mode: GameMode) => void
  mode: GameMode
  transitionPhase: TransitionPhase
}

const GameContext = createContext<GameContextValue | null>(null)

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}

interface GameProviderProps {
  children: ReactNode
  mode: GameMode
  onGameEnd: (stats: GameStats) => void
  gameDuration?: number
}

const FEEDBACK_DURATION = 600
const TRANSITION_DURATION = 300

export function GameProvider({ children, mode, onGameEnd, gameDuration = 60 }: GameProviderProps) {
  const { baseDifficulty } = useSettings()
  const { play } = useAudio()

  const [question, setQuestion] = useState<Question>(() => generateQuestion(mode, baseDifficulty))
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(gameDuration)
  const [difficulty, setDifficulty] = useState(baseDifficulty)
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null })
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>("idle")

  const [isBurstMode, setIsBurstMode] = useState(false)
  const [burstCount, setBurstCount] = useState(0)
  const burstThreshold = 8
  const burstLength = 3

  const responseTimes = useRef<number[]>([])
  const questionStartTime = useRef(Date.now())
  const correctInRow = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const gameEnded = useRef(false)
  const pendingQuestion = useRef<Question | null>(null)

  const multiplier = streak >= 20 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 2 : 1

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (timeLeft === 0 && !gameEnded.current) {
      gameEnded.current = true
      play("gameOver")
      const avgTime =
        responseTimes.current.length > 0
          ? responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length
          : 0
      onGameEnd({
        score,
        streak,
        maxStreak,
        correct,
        incorrect,
        avgTime: Math.round(avgTime),
      })
    }
  }, [timeLeft, score, streak, maxStreak, correct, incorrect, onGameEnd, play])

  useEffect(() => {
    const streakBonus = Math.floor(streak / 5)
    const newDifficulty = Math.min(5, baseDifficulty + streakBonus)
    setDifficulty(newDifficulty)
  }, [streak, baseDifficulty])

  const submitAnswer = useCallback(
    (answer: unknown) => {
      if (transitionPhase !== "idle") return

      const responseTime = Date.now() - questionStartTime.current
      responseTimes.current.push(responseTime)
      const isCorrect = answer === question.answer

      if (isCorrect) {
        const speedBonus = Math.max(0, Math.floor((3000 - responseTime) / 300))
        const burstBonus = isBurstMode ? 40 : 0
        const basePoints = 10
        const points = (basePoints + speedBonus + burstBonus) * multiplier

        setScore((prev) => prev + points)
        setStreak((prev) => prev + 1)
        setMaxStreak((prev) => Math.max(prev, streak + 1))
        setCorrect((prev) => prev + 1)
        setFeedback({ type: "correct", chosenValue: answer, correctValue: question.answer, points })

        correctInRow.current += 1

        if (isBurstMode) {
          play("burst")
          setBurstCount((prev) => {
            if (prev + 1 >= burstLength) {
              setIsBurstMode(false)
              correctInRow.current = 0
              return 0
            }
            return prev + 1
          })
        } else if (correctInRow.current >= burstThreshold) {
          play("burst")
          setIsBurstMode(true)
          setBurstCount(0)
        } else if ((streak + 1) % 5 === 0 && streak > 0) {
          play("streak")
        } else {
          play("correct")
        }
      } else {
        play("wrong")
        setStreak(0)
        setIncorrect((prev) => prev + 1)
        setFeedback({ type: "wrong", chosenValue: answer, correctValue: question.answer })
        correctInRow.current = 0
        setIsBurstMode(false)
        setBurstCount(0)
      }

      setTransitionPhase("feedback")

      const burstDifficulty = isBurstMode ? Math.max(1, difficulty - 1) : difficulty
      const chainAnswer = mode === "combo" && isCorrect && typeof answer === "number" ? answer : undefined
      pendingQuestion.current = generateQuestion(mode, burstDifficulty, chainAnswer)

      setTimeout(() => {
        setTransitionPhase("transitioning")
        setFeedback({ type: null })

        setTimeout(() => {
          if (pendingQuestion.current) {
            setQuestion(pendingQuestion.current)
            pendingQuestion.current = null
          }
          questionStartTime.current = Date.now()
          setTransitionPhase("idle")
        }, TRANSITION_DURATION)
      }, FEEDBACK_DURATION)
    },
    [question.answer, multiplier, streak, mode, difficulty, isBurstMode, transitionPhase, play],
  )

  const startGame = useCallback(
    (newMode: GameMode) => {
      setQuestion(generateQuestion(newMode, baseDifficulty))
      setScore(0)
      setStreak(0)
      setMaxStreak(0)
      setCorrect(0)
      setIncorrect(0)
      setTimeLeft(gameDuration)
      setDifficulty(baseDifficulty)
      setFeedback({ type: null })
      setIsBurstMode(false)
      setBurstCount(0)
      setTransitionPhase("idle")
      correctInRow.current = 0
      gameEnded.current = false
      questionStartTime.current = Date.now()
    },
    [gameDuration, baseDifficulty],
  )

  return (
    <GameContext.Provider
      value={{
        question,
        score,
        streak,
        maxStreak,
        correct,
        incorrect,
        timeLeft,
        difficulty,
        feedback,
        isBurstMode,
        burstCount,
        burstLength,
        multiplier,
        submitAnswer,
        startGame,
        mode,
        transitionPhase,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
