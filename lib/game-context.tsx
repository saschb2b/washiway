"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { type Answer, checkAnswer, generateQuestion, type Question, reissue, type Skill, skillForMode } from "./math"
import { type Outcome, multiplierFor, pointsFor, updateRecord } from "./math/adaptive"
import { type GameMode, type GameStats, type LevelChange, GAME_DURATION, PRACTICE_LENGTH } from "./game-types"
import { type SessionResult, type SkillRecords, questionKey, useSkills } from "./skill-context"
import { useAudio } from "./audio-context"

interface FeedbackState {
  outcome: Outcome | null
  answer?: Answer | null
  points?: number
}

type TransitionPhase = "idle" | "feedback" | "transitioning"

interface GameContextValue {
  question: Question
  mode: GameMode
  timed: boolean
  score: number
  streak: number
  multiplier: number
  timeLeft: number
  answered: number
  feedback: FeedbackState
  isBurstMode: boolean
  burstCount: number
  burstLength: number
  transitionPhase: TransitionPhase
  // Pass `null` for "don't know".
  submitAnswer: (answer: Answer | null) => void
  // Skip the rest of the feedback after a mistake.
  continueNow: () => void
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
  timed: boolean
  onGameEnd: (stats: GameStats, session: SessionResult) => void
}

const CORRECT_FEEDBACK = 450
// Long enough to read the solution and strategy; tapping continues sooner.
const MISS_FEEDBACK = 2600
const TRANSITION_DURATION = 250
const BURST_THRESHOLD = 8
const BURST_LENGTH = 3

export function GameProvider({ children, mode, timed, onGameEnd }: GameProviderProps) {
  const { records: savedRecords, reviewFor } = useSkills()
  const { play } = useAudio()

  const [initial] = useState(() => {
    const deck = reviewFor(mode)
    const skill = skillForMode(mode)
    return {
      // Saved misses from earlier sessions are spread through the opening questions.
      queue: deck.map((q, i) => ({ question: reissue(q), due: 2 + i * 3 })),
      deckKeys: new Set(deck.map(questionKey)),
      first: generateQuestion(skill, savedRecords[skill].level),
    }
  })

  // Levels move after every answer; the saved copy is only replaced at the end.
  const recordsRef = useRef<SkillRecords>(savedRecords)
  const startRecords = useRef<SkillRecords>(savedRecords)
  // Missed questions come back a few questions later.
  const queueRef = useRef<{ question: Question; due: number }[]>(initial.queue)
  const fromDeck = useRef(initial.deckKeys)
  const missed = useRef(new Map<string, Question>())
  const requeued = useRef(new Map<string, number>())
  const cleared = useRef(new Set<string>())
  const touched = useRef(new Set<Skill>())

  const [question, setQuestion] = useState<Question>(initial.first)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [skipped, setSkipped] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [feedback, setFeedback] = useState<FeedbackState>({ outcome: null })
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>("idle")
  const [isBurstMode, setIsBurstMode] = useState(false)
  const [burstCount, setBurstCount] = useState(0)

  const responseTimes = useRef<number[]>([])
  const questionStartTime = useRef(0)
  const correctInRow = useRef(0)
  const gameEnded = useRef(false)
  const pending = useRef<Question | null>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const feedbackAt = useRef(0)

  const multiplier = multiplierFor(streak)

  useEffect(() => {
    questionStartTime.current = Date.now()
    if (!timed) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timed])

  const finish = useCallback(() => {
    if (gameEnded.current) return
    gameEnded.current = true
    play("gameOver")
    const times = responseTimes.current
    const levelChanges: LevelChange[] = [...touched.current].map((skill) => ({
      skill,
      from: startRecords.current[skill].level,
      to: recordsRef.current[skill].level,
    }))
    const missedList = [...missed.current.values()]
    onGameEnd(
      {
        score,
        maxStreak,
        correct,
        incorrect,
        skipped,
        avgTime: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
        timed,
        levelChanges,
        reviewSaved: missedList.length,
      },
      { records: recordsRef.current, missed: missedList, cleared: [...cleared.current] },
    )
  }, [score, maxStreak, correct, incorrect, skipped, timed, onGameEnd, play])

  useEffect(() => {
    if (timed && timeLeft === 0) finish()
  }, [timed, timeLeft, finish])

  const nextQuestion = useCallback(
    (answeredSoFar: number, burst: boolean): Question => {
      const queue = queueRef.current
      const dueIndex = queue.findIndex((item) => item.due <= answeredSoFar)
      if (dueIndex >= 0) return queue.splice(dueIndex, 1)[0].question
      const skill = skillForMode(mode)
      const level = recordsRef.current[skill].level - (burst ? 1 : 0)
      return generateQuestion(skill, level)
    },
    [mode],
  )

  const advance = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    advanceTimer.current = null
    if (gameEnded.current) return
    if (!timed && answered >= PRACTICE_LENGTH) {
      finish()
      return
    }
    setTransitionPhase("transitioning")
    setFeedback({ outcome: null })
    setTimeout(() => {
      if (pending.current) {
        setQuestion(pending.current)
        pending.current = null
      }
      questionStartTime.current = Date.now()
      setTransitionPhase("idle")
    }, TRANSITION_DURATION)
  }, [answered, timed, finish])

  const continueNow = useCallback(() => {
    // Ignore the tail of the tap that gave the answer.
    if (Date.now() - feedbackAt.current < 400) return
    if (transitionPhase === "feedback" && advanceTimer.current) advance()
  }, [transitionPhase, advance])

  // Once the feedback for an answer has been set up, schedule the next step.
  useEffect(() => {
    if (transitionPhase !== "feedback" || advanceTimer.current) return
    const delay = feedback.outcome === "correct" ? CORRECT_FEEDBACK : MISS_FEEDBACK
    advanceTimer.current = setTimeout(advance, delay)
  }, [transitionPhase, feedback.outcome, advance])

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    },
    [],
  )

  const submitAnswer = useCallback(
    (answer: Answer | null) => {
      if (transitionPhase !== "idle" || gameEnded.current) return

      const responseTime = Date.now() - questionStartTime.current
      const result = checkAnswer(question, answer)
      const outcome: Outcome = answer === null ? "skipped" : result.correct ? "correct" : "wrong"
      const key = questionKey(question)

      recordsRef.current = {
        ...recordsRef.current,
        [question.skill]: updateRecord(recordsRef.current[question.skill], question, outcome, responseTime),
      }
      touched.current.add(question.skill)

      let points = pointsFor(question, outcome, responseTime, result.accuracy, multiplier)
      let burstNext = isBurstMode

      if (outcome === "correct") {
        responseTimes.current.push(responseTime)
        if (isBurstMode) points += 20 * multiplier
        setStreak((s) => s + 1)
        setMaxStreak((m) => Math.max(m, streak + 1))
        setCorrect((c) => c + 1)
        if (fromDeck.current.has(key)) cleared.current.add(key)
        correctInRow.current += 1

        if (isBurstMode) {
          play("burst")
          const nextCount = burstCount + 1
          if (nextCount >= BURST_LENGTH) {
            setIsBurstMode(false)
            setBurstCount(0)
            correctInRow.current = 0
            burstNext = false
          } else setBurstCount(nextCount)
        } else if (correctInRow.current >= BURST_THRESHOLD) {
          play("burst")
          setIsBurstMode(true)
          setBurstCount(0)
          burstNext = true
        } else if ((streak + 1) % 5 === 0) {
          play("streak")
        } else {
          play("correct")
        }
      } else {
        play("wrong")
        setStreak(0)
        if (outcome === "wrong") setIncorrect((c) => c + 1)
        else setSkipped((c) => c + 1)
        correctInRow.current = 0
        setIsBurstMode(false)
        setBurstCount(0)
        burstNext = false
        missed.current.set(key, question)
        // Bring it back a few questions later, but at most twice per round.
        const times = requeued.current.get(key) ?? 0
        if (times < 2) {
          requeued.current.set(key, times + 1)
          queueRef.current.push({ question: reissue(question), due: answered + 3 + Math.floor(Math.random() * 3) })
        }
      }

      setScore((s) => Math.max(0, s + points))
      feedbackAt.current = Date.now()
      setFeedback({ outcome, answer, points })
      setTransitionPhase("feedback")
      setAnswered(answered + 1)
      pending.current = nextQuestion(answered + 1, burstNext)
    },
    [question, transitionPhase, multiplier, isBurstMode, burstCount, streak, answered, nextQuestion, play],
  )

  return (
    <GameContext.Provider
      value={{
        question,
        mode,
        timed,
        score,
        streak,
        multiplier,
        timeLeft,
        answered,
        feedback,
        isBurstMode,
        burstCount,
        burstLength: BURST_LENGTH,
        transitionPhase,
        submitAnswer,
        continueNow,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
