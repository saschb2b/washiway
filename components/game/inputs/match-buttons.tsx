"use client"

import { motion } from "framer-motion"
import { useAudio } from "@/lib/audio-context"
import { WashiTapeStrip } from "@/components/ui/stationery"

interface MatchButtonsProps {
  options: string[]
  onAnswer: (index: number) => void
  disabled: boolean
}

const TAPE_COLORS: ("mint" | "pink" | "peach")[] = ["mint", "pink", "peach"]
const TAPE_PATTERNS: ("dots" | "stripes" | "dashes")[] = ["dots", "stripes", "dashes"]

export function MatchButtons({ options, onAnswer, disabled }: MatchButtonsProps) {
  const { play } = useAudio()

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
      {options.map((option, index) => (
        <motion.div
          key={index}
          whileTap={disabled ? {} : { scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <WashiTapeStrip
            color={TAPE_COLORS[index % TAPE_COLORS.length]}
            pattern={TAPE_PATTERNS[index % TAPE_PATTERNS.length]}
            onClick={() => {
              if (disabled) return
              play("tap")
              onAnswer(index)
            }}
            className={disabled ? "opacity-60 pointer-events-none" : ""}
          >
            <div className="flex items-center justify-center p-4">
              <span className="text-xl font-bold font-mono text-foreground">{option}</span>
            </div>
          </WashiTapeStrip>
        </motion.div>
      ))}
    </div>
  )
}
