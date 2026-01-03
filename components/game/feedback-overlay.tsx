"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
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
              "absolute inset-0 pointer-events-none rounded-3xl",
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
          className={cn("absolute font-bold text-xl text-success pointer-events-none z-20", className)}
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
          className="px-5 py-2 rounded-lg relative overflow-hidden"
          style={{
            backgroundColor: "var(--theme-highlight)",
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)`,
          }}
        >
          {/* Torn edges */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/[0.06] to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black/[0.06] to-transparent" />
          <span className="text-sm font-bold text-foreground relative z-10">
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
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center justify-end gap-1.5 mt-1">
      <div className={cn("flex gap-1", streak >= 10 && "animate-streak-glow")}>
        {Array.from({ length: Math.min(streak, 10) }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.02 }}
            className="w-2.5 h-2.5 rounded-sm"
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
          className="text-sm font-bold ml-1"
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
    <div className="relative w-16 h-16">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
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
        <span className={cn("font-mono font-bold text-lg", isTimerCritical && "text-destructive animate-pulse")}>
          {timeLeft}
        </span>
      </div>
    </div>
  )
}
