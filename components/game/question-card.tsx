"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useGame } from "@/lib/game-context"
import { ScorePopup } from "./feedback-overlay"

interface QuestionCardProps {
  cardId?: "left" | "right" | "single"
  content: string
  secondary?: string
  className?: string
}

export function QuestionCard({ cardId = "single", content, secondary, className }: QuestionCardProps) {
  const { feedback, question, transitionPhase } = useGame()

  const isChosen = feedback.chosenValue === cardId || (cardId === "single" && feedback.type !== null)
  const isCorrectAnswer = feedback.correctValue === cardId
  const showCorrectHighlight = feedback.type === "wrong" && isCorrectAnswer
  const showChosenCorrect = feedback.type === "correct" && isChosen
  const showChosenWrong = feedback.type === "wrong" && isChosen

  const isExiting = transitionPhase === "transitioning"

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${cardId}-${question.id}`}
        initial={{
          opacity: 0,
          x: cardId === "left" ? -20 : cardId === "right" ? 20 : 0,
          y: cardId === "single" ? 20 : 0,
          scale: 0.95,
        }}
        animate={{
          opacity: isExiting ? 0 : 1,
          x: 0,
          y: isExiting ? -20 : 0,
          scale: isExiting ? 0.95 : 1,
        }}
        transition={{
          duration: 0.25,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className={cn(
          "px-10 py-8 rounded-xl",
          "bg-card border border-border",
          "shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
          "flex flex-col items-center justify-center",
          "relative overflow-hidden",
          className,
        )}
      >
        <div
          className="absolute -top-1 -left-3 w-14 h-4 bg-pastel-mint/60 rounded-sm transform -rotate-[20deg]"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 5px)`,
          }}
        />

        {/* Subtle ruled lines for index card feel */}
        <div
          className="absolute inset-x-6 top-6 bottom-6 pointer-events-none opacity-15"
          style={{
            backgroundImage: `repeating-linear-gradient(
              transparent, transparent 26px,
              var(--border) 26px, var(--border) 27px
            )`,
          }}
        />

        {/* Feedback highlight */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-xl",
            showChosenCorrect && "bg-success/15",
            showChosenWrong && "bg-destructive/15",
            showCorrectHighlight && "bg-success/15",
          )}
          initial={{ opacity: 0 }}
          animate={{
            opacity: showChosenCorrect || showChosenWrong || showCorrectHighlight ? 1 : 0,
          }}
          transition={{ duration: 0.15 }}
        />

        {/* Border feedback */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-xl border-4",
            showChosenCorrect && "border-success",
            showChosenWrong && "border-destructive",
            showCorrectHighlight && "border-success",
            !showChosenCorrect && !showChosenWrong && !showCorrectHighlight && "border-transparent",
          )}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{
            scale: showChosenCorrect || showChosenWrong || showCorrectHighlight ? 1 : 1.05,
            opacity: showChosenCorrect || showChosenWrong || showCorrectHighlight ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />

        <motion.div
          className="relative z-10 flex flex-col items-center justify-center"
          animate={{
            scale: showChosenCorrect ? [1, 1.05, 1] : showChosenWrong ? [1, 0.98, 1, 0.98, 1] : 1,
          }}
          transition={{
            duration: showChosenWrong ? 0.4 : 0.3,
            ease: "easeInOut",
          }}
        >
          <p className="text-4xl md:text-5xl font-bold font-mono text-card-foreground tracking-wide text-center">
            {content}
          </p>
          {secondary && <p className="text-2xl font-mono text-muted-foreground mt-4 text-center">{secondary}</p>}
        </motion.div>

        {cardId === "single" && <ScorePopup className="top-0 left-1/2 -translate-x-1/2" />}
      </motion.div>
    </AnimatePresence>
  )
}

export function QuestionCardGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <ScorePopup className="top-1/4 left-1/2 -translate-x-1/2 text-2xl" />
    </div>
  )
}
