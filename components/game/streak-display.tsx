"use client"

import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

interface StreakDisplayProps {
  streak: number
  multiplier: number
}

export function StreakDisplay({ streak, multiplier }: StreakDisplayProps) {
  return (
    <div className="text-right">
      <p className="font-mono text-sm text-muted-foreground">STREAK</p>
      <div className="flex items-center justify-end gap-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={streak}
            initial={{ scale: 1.3, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            className={cn(
              "font-mono text-2xl font-bold",
              streak >= 10 && "animate-streak-glow text-accent",
              streak >= 5 && streak < 10 && "text-primary",
              streak < 5 && "text-foreground",
            )}
          >
            {streak}
          </motion.p>
        </AnimatePresence>
        {multiplier > 1 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn("rounded-full px-2 py-0.5 text-sm font-bold", "bg-accent text-accent-foreground")}
          >
            x{multiplier}
          </motion.span>
        )}
      </div>
    </div>
  )
}
