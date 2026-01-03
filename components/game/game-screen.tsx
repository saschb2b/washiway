"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { GAME_DURATION, GAME_MODES, type GameMode, type GameStats } from "@/lib/game-types"
import { TruthButtons } from "./inputs/truth-buttons"
import { CompareButtons } from "./inputs/compare-buttons"
import { DigitPad } from "./inputs/digit-pad"
import { GameProvider, useGame } from "@/lib/game-context"
import { TimerRing, StreakDisplay, BurstIndicator, FeedbackOverlay } from "./feedback-overlay"
import { QuestionCard, QuestionCardGroup } from "./question-card"
import { PaperBackground } from "@/components/ui/stationery"

interface GameScreenProps {
  mode: GameMode
  onGameEnd: (stats: GameStats) => void
}

export function GameScreen({ mode, onGameEnd }: GameScreenProps) {
  return (
    <GameProvider mode={mode} onGameEnd={onGameEnd} gameDuration={GAME_DURATION}>
      <GameScreenContent />
    </GameProvider>
  )
}

function GameScreenContent() {
  const { mode, score, question, timeLeft } = useGame()
  const modeConfig = GAME_MODES.find((m) => m.id === mode)
  const gameStarted = useRef(false)

  useEffect(() => {
    if (!gameStarted.current) {
      gameStarted.current = true
    }
  }, [])

  return (
    <PaperBackground>
      <div className="flex-1 flex flex-col relative overflow-hidden min-h-dvh">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle sticky notes in corners */}
          <div className="absolute top-[5%] left-[3%] w-8 h-8 bg-pastel-yellow/30 rounded-sm transform -rotate-12" />
          <div className="absolute top-[8%] right-[5%] w-6 h-6 bg-pastel-pink/30 rounded-sm transform rotate-8" />
          <div className="absolute bottom-[15%] left-[5%] w-10 h-10 bg-pastel-mint/20 rounded-sm transform rotate-6" />
          <div className="absolute bottom-[20%] right-[3%] w-7 h-7 bg-pastel-blue/20 rounded-sm transform -rotate-3" />

          {/* Paper clip decoration */}
          <div className="absolute top-[30%] left-[2%] w-3 h-8 border-2 border-pastel-blue/30 rounded-full" />
        </div>

        {/* Top bar styled as index card */}
        <div className="mx-4 mt-4 p-4 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between relative z-10">
          <TimerRing duration={GAME_DURATION} />
          <div className="text-right">
            <motion.p
              key={score}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold font-mono text-foreground"
            >
              {score.toLocaleString()}
            </motion.p>
            <StreakDisplay />
          </div>
        </div>

        {/* Burst indicator */}
        <div className="flex justify-center mt-2">
          <BurstIndicator />
        </div>

        {/* Question Display */}
        <FeedbackOverlay className="flex-1 flex items-center justify-center p-6">
          <ModeQuestionDisplay />
        </FeedbackOverlay>

        {/* Input Area */}
        <div className="p-6 pb-10 relative z-10">
          <ModeInput />
        </div>
      </div>
    </PaperBackground>
  )
}

function ModeQuestionDisplay() {
  const { mode, question } = useGame()

  switch (mode) {
    case "compare":
      return (
        <QuestionCardGroup className="flex gap-4 w-full max-w-md">
          <QuestionCard cardId="left" content={question.display} className="flex-1 py-10 px-4" />
          <QuestionCard cardId="right" content={question.displaySecondary || ""} className="flex-1 py-10 px-4" />
        </QuestionCardGroup>
      )

    default:
      return <QuestionCard content={question.display} secondary={question.displaySecondary} className="min-w-[280px]" />
  }
}

function ModeInput() {
  const { mode, submitAnswer, transitionPhase, question } = useGame()
  const disabled = transitionPhase !== "idle"

  switch (mode) {
    case "truth":
      return <TruthButtons onAnswer={submitAnswer} disabled={disabled} />
    case "compare":
      return <CompareButtons onAnswer={submitAnswer} disabled={disabled} />
    case "digit":
    case "missing":
    case "combo":
      return (
        <DigitPad
          onAnswer={submitAnswer}
          disabled={disabled}
          correctAnswer={question.answer as number}
          questionId={question.id}
        />
      )
    default:
      return null
  }
}
