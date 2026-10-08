"use client"

import { useEffect } from "react"
import { motion } from "motion/react"
import { useAudio } from "@/lib/audio-context"
import { WashiTapeStrip } from "@/components/ui/stationery"

interface MatchButtonsProps {
  options: string[]
  onAnswer: (index: number) => void
  disabled: boolean
}

const TAPE_COLORS: ("mint" | "pink" | "peach")[] = ["mint", "pink", "peach"]
const TAPE_PATTERNS: ("dots" | "stripes" | "dashes")[] = ["dots", "stripes", "dashes"]
const KEY_HINTS = ["1 / A", "2 / S", "3 / D"]

export function MatchButtons({ options, onAnswer, disabled }: MatchButtonsProps) {
  const { play } = useAudio()

  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      let index = -1
      if (e.key === "1" || e.key.toLowerCase() === "a") index = 0
      else if (e.key === "2" || e.key.toLowerCase() === "s") index = 1
      else if (e.key === "3" || e.key.toLowerCase() === "d") index = 2

      if (index >= 0 && index < options.length) {
        e.preventDefault()
        play("tap")
        onAnswer(index)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [disabled, options.length, onAnswer, play])

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
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
            className={disabled ? "pointer-events-none opacity-60" : ""}
          >
            <div className="flex items-center justify-between p-4">
              <span className="font-mono text-xl font-bold text-foreground">{option}</span>
              <span className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-xs text-foreground/50">
                {KEY_HINTS[index]}
              </span>
            </div>
          </WashiTapeStrip>
        </motion.div>
      ))}
    </div>
  )
}
