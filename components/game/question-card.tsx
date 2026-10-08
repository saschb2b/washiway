"use client"

import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useGame } from "@/lib/game-context"
import { ScorePopup } from "./feedback-overlay"

interface QuestionCardProps {
  content: string
  className?: string
}

// Long expressions (chains, sequences) get a smaller type size so they fit.
function sizeFor(content: string): string {
  const length = content.length
  if (length <= 12) return "text-4xl md:text-5xl"
  if (length <= 16) return "text-3xl md:text-4xl"
  if (length <= 22) return "text-2xl md:text-3xl"
  return "text-xl md:text-2xl"
}

export function QuestionCard({ content, className }: QuestionCardProps) {
  const { feedback, question, transitionPhase } = useGame()

  const isCorrect = feedback.outcome === "correct"
  const isMiss = feedback.outcome === "wrong" || feedback.outcome === "skipped"
  const isExiting = transitionPhase === "transitioning"

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -20 : 0, scale: isExiting ? 0.95 : 1 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "relative flex flex-col items-center justify-center overflow-hidden rounded-xl px-6 py-7",
          "border border-border bg-card shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
          className,
        )}
      >
        <div
          className="absolute -top-1 -left-3 h-4 w-14 -rotate-[20deg] transform rounded-sm bg-pastel-mint/60"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 5px)`,
          }}
        />

        {/* Ruled lines for an index card feel */}
        <div
          className="pointer-events-none absolute inset-x-6 top-6 bottom-6 opacity-15"
          style={{
            backgroundImage: `repeating-linear-gradient(transparent, transparent 26px, var(--border) 26px, var(--border) 27px)`,
          }}
        />

        <motion.div
          className={cn(
            "absolute inset-0 rounded-xl border-4",
            isCorrect && "border-success bg-success/15",
            isMiss && "border-destructive bg-destructive/10",
            !isCorrect && !isMiss && "border-transparent",
          )}
          initial={false}
          animate={{ opacity: isCorrect || isMiss ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        />

        <motion.p
          className={cn(
            "relative z-10 text-center font-mono font-bold tracking-wide break-words text-card-foreground",
            sizeFor(content),
          )}
          animate={{ scale: isCorrect ? [1, 1.05, 1] : isMiss ? [1, 0.98, 1, 0.98, 1] : 1 }}
          transition={{ duration: isMiss ? 0.4 : 0.3, ease: "easeInOut" }}
        >
          {content}
        </motion.p>

        <ScorePopup className="top-0 left-1/2 -translate-x-1/2" />
      </motion.div>
    </AnimatePresence>
  )
}
