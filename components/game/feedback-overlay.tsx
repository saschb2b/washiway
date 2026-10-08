"use client"

import type React from "react"

import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useGame } from "@/lib/game-context"
import { useI18n } from "@/lib/i18n-context"

interface FeedbackOverlayProps {
  children: React.ReactNode
  className?: string
}

export function FeedbackOverlay({ children, className }: FeedbackOverlayProps) {
  const { feedback } = useGame()

  return (
    <div className={cn("relative", className)}>
      {children}

      <AnimatePresence>
        {feedback.type && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "pointer-events-none absolute inset-0 rounded-3xl",
              feedback.type === "correct" ? "bg-success/8" : "bg-destructive/8",
            )}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export function ScorePopup({ className }: { className?: string }) {
  const { feedback } = useGame()

  return (
    <AnimatePresence>
      {feedback.type === "correct" && feedback.points && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: -30, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className={cn("pointer-events-none absolute z-20 text-xl font-bold text-success", className)}
        >
          +{feedback.points}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function BurstIndicator() {
  const { isBurstMode, burstCount, burstLength } = useGame()
  const { t } = useI18n()

  return (
    <AnimatePresence>
      {isBurstMode && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative overflow-hidden rounded-lg px-5 py-2"
          style={{
            backgroundColor: "var(--theme-highlight)",
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)`,
          }}
        >
          {/* Torn edges */}
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-r from-black/[0.06] to-transparent" />
          <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-l from-black/[0.06] to-transparent" />
          <span className="relative z-10 text-sm font-bold text-foreground">
            {t.game.burst} {burstCount + 1}/{burstLength}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function StreakDisplay() {
  const { streak, multiplier } = useGame()

  if (streak === 0) return null

  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1 flex items-center justify-end gap-1.5">
      <div className={cn("flex gap-1", streak >= 10 && "animate-streak-glow")}>
        {Array.from({ length: Math.min(streak, 10) }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.02 }}
            className="h-2.5 w-2.5 rounded-sm"
            style={{
              backgroundColor:
                streak >= 10
                  ? "var(--theme-highlight)"
                  : streak >= 5
                    ? "var(--theme-primary)"
                    : "var(--theme-secondary)",
            }}
          />
        ))}
      </div>
      {multiplier > 1 && (
        <span
          className="ml-1 text-sm font-bold"
          style={{ color: streak >= 10 ? "var(--theme-highlight)" : "var(--theme-primary)" }}
        >
          x{multiplier}
        </span>
      )}
    </motion.div>
  )
}

// Timer ring component
export function TimerRing({ duration = 60 }: { duration?: number }) {
  const { timeLeft } = useGame()

  const timerPercentage = (timeLeft / duration) * 100
  const isTimerLow = timeLeft <= 10
  const isTimerCritical = timeLeft <= 5

  return (
    <div className="relative h-12 w-12">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-muted" strokeWidth="3" />
        <motion.circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          style={{
            stroke: isTimerCritical
              ? "var(--color-destructive)"
              : isTimerLow
                ? "var(--theme-highlight)"
                : "var(--theme-primary)",
          }}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="97.5"
          animate={{ strokeDashoffset: 97.5 - (timerPercentage / 100) * 97.5 }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("font-mono text-base font-bold", isTimerCritical && "animate-pulse text-destructive")}>
          {timeLeft}
        </span>
      </div>
    </div>
  )
}
