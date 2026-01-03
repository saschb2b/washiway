"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface StreakDisplayProps {
  streak: number
  multiplier: number
}

export function StreakDisplay({ streak, multiplier }: StreakDisplayProps) {
  return (
    <div className="text-right">
      <p className="text-sm text-muted-foreground font-mono">STREAK</p>
      <div className="flex items-center gap-2 justify-end">
        <AnimatePresence mode="wait">
          <motion.p
            key={streak}
            initial={{ scale: 1.3, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            className={cn(
              "text-2xl font-bold font-mono",
              streak >= 10 && "text-accent animate-streak-glow",
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
            className={cn("px-2 py-0.5 rounded-full text-sm font-bold", "bg-accent text-accent-foreground")}
          >
            x{multiplier}
          </motion.span>
        )}
      </div>
    </div>
  )
}
