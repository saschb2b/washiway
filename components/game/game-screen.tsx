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
        className="absolute -top-4 -left-12 w-40 h-5 bg-pastel-mint/40 rounded-sm transform -rotate-[35deg]"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.5) 6px, rgba(255,255,255,0.5) 8px)`,
        }}
      />
      {/* Top right small tape */}
      <div
        className="absolute top-20 -right-8 w-28 h-4 bg-pastel-pink/30 rounded-sm transform rotate-[25deg]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: "6px 6px",
        }}
      />
      {/* Bottom left tape */}
      <div
        className="absolute bottom-32 -left-10 w-36 h-4 bg-pastel-blue/30 rounded-sm transform -rotate-[20deg]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)`,
        }}
      />
      {/* Bottom right diagonal tape */}
      <div
        className="absolute -bottom-2 -right-16 w-44 h-5 bg-pastel-peach/35 rounded-sm transform rotate-[30deg]"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.4) 8px, rgba(255,255,255,0.4) 10px)`,
        }}
      />
      {/* Middle accent tape */}
      <div className="absolute top-1/2 -left-6 w-20 h-3 bg-pastel-lavender/25 rounded-sm transform -rotate-[15deg]" />
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

  const modeColors: Record<GameMode, string> = {
    truth: "bg-pastel-blue",
    compare: "bg-pastel-peach",
    digit: "bg-pastel-mint",
    missing: "bg-pastel-pink",
    combo: "bg-pastel-lavender",
    match: "bg-pastel-yellow",
  }

  return (
    <PaperBackground>
      <div className="flex-1 flex flex-col relative overflow-hidden min-h-dvh">
        <DecoWashiStrips />

        <div className="mx-4 mt-4 relative">
          {/* Washi tape accent on top of card */}
          <div
            className={`absolute -top-2 left-6 w-16 h-5 ${modeColors[mode]} rounded-sm transform -rotate-2 z-20`}
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 6px)`,
            }}
          />
          <div className="p-4 bg-card rounded-xl border border-border shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex items-center justify-between relative z-10">
            {/* Subtle ruled lines */}
            <div
              className="absolute inset-x-4 top-4 bottom-4 pointer-events-none opacity-10"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  transparent, transparent 18px,
                  var(--border) 18px, var(--border) 19px
                )`,
              }}
            />
            <TimerRing duration={GAME_DURATION} />
            <div className="text-right relative z-10">
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
        </div>

        {/* Burst indicator */}
        <div className="flex justify-center mt-3">
          <BurstIndicator />
        </div>

        {/* Question Display */}
        <FeedbackOverlay className="flex-1 flex items-center justify-center p-6">
          <ModeQuestionDisplay />
        </FeedbackOverlay>

        <div className="relative">
          {/* Washi tape divider above inputs */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-[6px] bg-gradient-to-r from-pastel-mint via-pastel-pink to-pastel-blue rounded-full opacity-60" />
          <div className="p-6 pb-10 relative z-10">
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
            className="px-5 py-2.5 bg-pastel-yellow/80 rounded-lg relative overflow-hidden"
            style={{
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
