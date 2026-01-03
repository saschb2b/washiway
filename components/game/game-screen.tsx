"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { GAME_DURATION, GAME_MODES, type GameMode, type GameStats } from "@/lib/game-types"
import { TruthButtons } from "./inputs/truth-buttons"
import { CompareButtons } from "./inputs/compare-buttons"
import { DigitPad } from "./inputs/digit-pad"
import { MatchButtons } from "./inputs/match-buttons"
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

function DecoWashiStrips() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top left diagonal tape */}
      <div
        className="absolute -top-4 -left-12 w-40 h-5 rounded-sm transform -rotate-[35deg]"
        style={{
          backgroundColor: "var(--theme-primary)",
          opacity: 0.4,
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.5) 6px, rgba(255,255,255,0.5) 8px)`,
        }}
      />
      {/* Top right small tape */}
      <div
        className="absolute top-20 -right-8 w-28 h-4 rounded-sm transform rotate-[25deg]"
        style={{
          backgroundColor: "var(--theme-secondary)",
          opacity: 0.3,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: "6px 6px",
        }}
      />
      {/* Bottom left tape */}
      <div
        className="absolute bottom-32 -left-10 w-36 h-4 rounded-sm transform -rotate-[20deg]"
        style={{
          backgroundColor: "var(--theme-highlight)",
          opacity: 0.3,
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)`,
        }}
      />
      {/* Bottom right diagonal tape */}
      <div
        className="absolute -bottom-2 -right-16 w-44 h-5 rounded-sm transform rotate-[30deg]"
        style={{
          backgroundColor: "var(--theme-muted)",
          opacity: 0.35,
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.4) 8px, rgba(255,255,255,0.4) 10px)`,
        }}
      />
      {/* Middle accent tape */}
      <div
        className="absolute top-1/2 -left-6 w-20 h-3 rounded-sm transform -rotate-[15deg]"
        style={{ backgroundColor: "var(--theme-secondary)", opacity: 0.25 }}
      />
    </div>
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
        <DecoWashiStrips />

        <div className="mx-3 mt-3 relative">
          <div
            className="absolute -top-1.5 left-4 w-12 h-3 rounded-sm transform -rotate-2 z-20"
            style={{
              backgroundColor: "var(--theme-primary)",
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 6px)`,
            }}
          />
          <div className="py-2 px-3 bg-card rounded-xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex items-center justify-between relative z-10">
            <TimerRing duration={GAME_DURATION} />
            <div className="text-right relative z-10">
              <motion.p
                key={score}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold font-mono text-foreground"
              >
                {score.toLocaleString()}
              </motion.p>
              <StreakDisplay />
            </div>
          </div>
        </div>
        {/* Burst indicator */}
        <div className="flex justify-center mt-2">
          <BurstIndicator />
        </div>

        {/* Question Display */}
        <FeedbackOverlay className="flex-1 flex items-center justify-center p-4">
          <ModeQuestionDisplay />
        </FeedbackOverlay>

        <div className="relative">
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-[6px] rounded-full opacity-60"
            style={{
              background: `linear-gradient(90deg, var(--theme-primary), var(--theme-secondary), var(--theme-highlight))`,
            }}
          />
          <div className="p-4 pb-8 relative z-10">
            <ModeInput />
          </div>
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

    case "match":
      return (
        <div className="flex flex-col items-center gap-3">
          <div
            className="px-5 py-2.5 rounded-lg relative overflow-hidden"
            style={{
              backgroundColor: "var(--theme-highlight)",
              opacity: 0.9,
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.4) 6px, rgba(255,255,255,0.4) 8px)`,
            }}
          >
            {/* Torn edge effects */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/[0.06] to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black/[0.06] to-transparent" />
            <span className="text-lg font-bold text-foreground relative z-10">{question.display}</span>
          </div>
          <p className="text-sm text-muted-foreground">Find the match</p>
        </div>
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
    case "match":
      return <MatchButtons options={(question.options as string[]) || []} onAnswer={submitAnswer} disabled={disabled} />
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
