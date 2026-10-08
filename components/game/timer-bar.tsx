"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface TimerBarProps {
  timeLeft: number
  totalTime: number
}

export function TimerBar({ timeLeft, totalTime }: TimerBarProps) {
  const percentage = (timeLeft / totalTime) * 100
  const isLow = timeLeft <= 10
  const isCritical = timeLeft <= 5

  return (
    <div className="h-2 w-full bg-muted">
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "linear" }}
        className={cn(
          "h-full transition-colors duration-300",
          isCritical && "bg-destructive",
          isLow && !isCritical && "bg-accent",
          !isLow && "bg-primary",
        )}
      />
      {isCritical && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
          className="absolute top-4 left-1/2 -translate-x-1/2 font-mono font-bold text-destructive"
        >
          {timeLeft}
        </motion.div>
      )}
    </div>
  )
}
