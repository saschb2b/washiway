"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import type { GameMode, GameStats } from "@/lib/game-types"
import type { SessionResult } from "@/lib/skill-context"
import { GameProvider, useGame } from "@/lib/game-context"
import { useI18n, useLocalize } from "@/lib/i18n-context"
import { fmt } from "@/lib/math/format"
import { TruthButtons } from "./inputs/truth-buttons"
import { DigitPad } from "./inputs/digit-pad"
import { ChoiceButtons } from "./inputs/choice-buttons"
import { NumberLine } from "./inputs/number-line"
import { TargetTiles } from "./inputs/target-tiles"
import { TimerRing, StreakDisplay, BurstIndicator, FeedbackOverlay } from "./feedback-overlay"
import { QuestionCard } from "./question-card"
import { PaperBackground } from "@/components/ui/stationery"

interface GameScreenProps {
  mode: GameMode
  timed: boolean
  onGameEnd: (stats: GameStats, session: SessionResult) => void
}

export function GameScreen({ mode, timed, onGameEnd }: GameScreenProps) {
  return (
    <GameProvider mode={mode} timed={timed} onGameEnd={onGameEnd}>
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
  const { score, question, mode, feedback, transitionPhase, submitAnswer, continueNow } = useGame()
  const { t } = useI18n()
  const text = useLocalize()
  const missed = feedback.outcome === "wrong" || feedback.outcome === "skipped"

  // "?" or Escape means "don't know".
  useEffect(() => {
    if (transitionPhase !== "idle") return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" || e.key === "Escape") {
        e.preventDefault()
        submitAnswer(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [transitionPhase, submitAnswer])

  // Enter, Space or a tap moves on from a solution once it has been read.
  useEffect(() => {
    if (!missed) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        continueNow()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [missed, continueNow])

  return (
    <PaperBackground>
      <div
        className="relative flex min-h-dvh flex-1 flex-col overflow-hidden"
        onClick={missed ? continueNow : undefined}
      >
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
            <TimerRing />
            {mode === "mix" && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                {t.modes[question.skill].name}
              </span>
            )}
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

        <div className="mt-2 flex justify-center">
          <BurstIndicator />
        </div>

        <FeedbackOverlay className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
          <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{text(question.prompt)}</p>
          <QuestionCard content={text(question.display)} className="w-full max-w-sm" />
          <SolutionPanel />
        </FeedbackOverlay>

        <div className="relative">
          <div
            className="absolute -top-3 left-1/2 h-[6px] w-24 -translate-x-1/2 rounded-full opacity-60"
            style={{
              background: `linear-gradient(90deg, var(--theme-primary), var(--theme-secondary), var(--theme-highlight))`,
            }}
          />
          <div className="relative z-10 space-y-3 p-4 pb-6">
            <QuestionInput />
            <div className="flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  submitAnswer(null)
                }}
                disabled={transitionPhase !== "idle"}
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted disabled:opacity-0"
              >
                {t.game.skip} <span className="ml-1 rounded bg-black/5 px-1 font-mono text-xs">?</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PaperBackground>
  )
}

// After a miss: the solution and the strategy that gets there.
function SolutionPanel() {
  const { question, feedback } = useGame()
  const { t } = useI18n()
  const text = useLocalize()
  const show = feedback.outcome === "wrong" || feedback.outcome === "skipped"

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="w-full max-w-sm rounded-lg border border-border bg-card/95 px-4 py-3 text-center shadow-sm"
        >
          {question.kind === "number" && (
            <p className="font-mono text-lg font-bold text-foreground">
              {t.game.solution}: {fmt(question.answer)}
            </p>
          )}
          <p className="mt-1 font-mono text-sm leading-snug text-muted-foreground">{text(question.explanation)}</p>
          <p className="mt-2 text-xs text-muted-foreground/70">{t.game.tapToContinue}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function QuestionInput() {
  const { question, submitAnswer, transitionPhase, feedback } = useGame()
  const disabled = transitionPhase !== "idle"
  const answered = feedback.outcome !== null

  switch (question.kind) {
    case "truefalse":
      return <TruthButtons onAnswer={submitAnswer} disabled={disabled} />
    case "choice":
      return (
        <ChoiceButtons
          options={question.options}
          onAnswer={submitAnswer}
          disabled={disabled}
          chosen={answered ? ((feedback.answer as number | null) ?? null) : undefined}
          correct={question.answer}
        />
      )
    case "number":
      return <DigitPad key={question.id} onAnswer={submitAnswer} disabled={disabled} correctAnswer={question.answer} />
    case "line":
      return (
        <NumberLine
          key={question.id}
          question={question}
          onAnswer={submitAnswer}
          disabled={disabled}
          guess={answered ? ((feedback.answer as number | null) ?? null) : undefined}
        />
      )
    case "target":
      return (
        <TargetTiles
          key={question.id}
          question={question}
          onAnswer={submitAnswer}
          disabled={disabled}
          chosen={answered ? ((feedback.answer as number[] | null) ?? null) : undefined}
        />
      )
  }
}
