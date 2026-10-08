"use client"

import { motion } from "motion/react"
import { GAME_DURATION, type GameMode, type GameStats } from "@/lib/game-types"
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Top left diagonal tape */}
      <div
        className="absolute -top-4 -left-12 h-5 w-40 -rotate-[35deg] transform rounded-sm"
        style={{
          backgroundColor: "var(--theme-primary)",
          opacity: 0.4,
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.5) 6px, rgba(255,255,255,0.5) 8px)`,
        }}
      />
      {/* Top right small tape */}
      <div
        className="absolute top-20 -right-8 h-4 w-28 rotate-[25deg] transform rounded-sm"
        style={{
          backgroundColor: "var(--theme-secondary)",
          opacity: 0.3,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: "6px 6px",
        }}
      />
      {/* Bottom left tape */}
      <div
        className="absolute bottom-32 -left-10 h-4 w-36 -rotate-[20deg] transform rounded-sm"
        style={{
          backgroundColor: "var(--theme-highlight)",
          opacity: 0.3,
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)`,
        }}
      />
      {/* Bottom right diagonal tape */}
      <div
        className="absolute -right-16 -bottom-2 h-5 w-44 rotate-[30deg] transform rounded-sm"
        style={{
          backgroundColor: "var(--theme-muted)",
          opacity: 0.35,
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.4) 8px, rgba(255,255,255,0.4) 10px)`,
        }}
      />
      {/* Middle accent tape */}
      <div
        className="absolute top-1/2 -left-6 h-3 w-20 -rotate-[15deg] transform rounded-sm"
        style={{ backgroundColor: "var(--theme-secondary)", opacity: 0.25 }}
      />
    </div>
  )
}

function GameScreenContent() {
  const { score } = useGame()

  return (
    <PaperBackground>
      <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden">
        <DecoWashiStrips />

        <div className="relative mx-3 mt-3">
          <div
            className="absolute -top-1.5 left-4 z-20 h-3 w-12 -rotate-2 transform rounded-sm"
            style={{
              backgroundColor: "var(--theme-primary)",
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 6px)`,
            }}
          />
          <div className="relative z-10 flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <TimerRing duration={GAME_DURATION} />
            <div className="relative z-10 text-right">
              <motion.p
                key={score}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="font-mono text-2xl font-bold text-foreground"
              >
                {score.toLocaleString()}
              </motion.p>
              <StreakDisplay />
            </div>
          </div>
        </div>
        {/* Burst indicator */}
        <div className="mt-2 flex justify-center">
          <BurstIndicator />
        </div>

        {/* Question Display */}
        <FeedbackOverlay className="flex flex-1 items-center justify-center p-4">
          <ModeQuestionDisplay />
        </FeedbackOverlay>

        <div className="relative">
          <div
            className="absolute -top-3 left-1/2 h-[6px] w-24 -translate-x-1/2 rounded-full opacity-60"
            style={{
              background: `linear-gradient(90deg, var(--theme-primary), var(--theme-secondary), var(--theme-highlight))`,
            }}
          />
          <div className="relative z-10 p-4 pb-8">
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
        <QuestionCardGroup className="flex w-full max-w-md gap-4">
          <QuestionCard cardId="left" content={question.display} className="flex-1 px-4 py-10" />
          <QuestionCard cardId="right" content={question.displaySecondary || ""} className="flex-1 px-4 py-10" />
        </QuestionCardGroup>
      )

    case "match":
      return (
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative overflow-hidden rounded-lg px-5 py-2.5"
            style={{
              backgroundColor: "var(--theme-highlight)",
              opacity: 0.9,
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.4) 6px, rgba(255,255,255,0.4) 8px)`,
            }}
          >
            {/* Torn edge effects */}
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-r from-black/[0.06] to-transparent" />
            <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-l from-black/[0.06] to-transparent" />
            <span className="relative z-10 text-lg font-bold text-foreground">{question.display}</span>
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
          key={question.id}
          onAnswer={submitAnswer}
          disabled={disabled}
          correctAnswer={question.answer as number}
        />
      )
    default:
      return null
  }
}
