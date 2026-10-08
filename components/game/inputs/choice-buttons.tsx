"use client"

import { useEffect } from "react"
import { motion } from "motion/react"
import { Check, X } from "lucide-react"
import type { Text } from "@/lib/math"
import { useLocalize } from "@/lib/i18n-context"
import { WashiTapeStrip } from "@/components/ui/stationery"
import { cn } from "@/lib/utils"

interface ChoiceButtonsProps {
  options: Text[]
  onAnswer: (index: number) => void
  disabled: boolean
  // After answering: which option was picked and which was right.
  chosen?: number | null
  correct?: number
}

const TAPE_COLORS = ["mint", "pink", "peach", "lavender"] as const
const TAPE_PATTERNS = ["dots", "stripes", "dashes", "zigzag"] as const
const KEYS = ["a", "s", "d", "f"]

export function ChoiceButtons({ options, onAnswer, disabled, chosen, correct }: ChoiceButtonsProps) {
  const text = useLocalize()
  const revealed = chosen !== undefined

  useEffect(() => {
    if (disabled) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const byNumber = Number(e.key) - 1
      const index = byNumber >= 0 && byNumber < 4 ? byNumber : KEYS.indexOf(e.key.toLowerCase())
      if (index >= 0 && index < options.length) {
        e.preventDefault()
        onAnswer(index)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [disabled, options.length, onAnswer])

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
      {options.map((option, index) => {
        const isCorrect = revealed && index === correct
        const isWrongPick = revealed && index === chosen && index !== correct
        return (
          <motion.div key={index} whileTap={disabled ? {} : { scale: 0.97 }}>
            <WashiTapeStrip
              color={TAPE_COLORS[index % TAPE_COLORS.length]}
              pattern={TAPE_PATTERNS[index % TAPE_PATTERNS.length]}
              onClick={() => {
                if (!disabled) onAnswer(index)
              }}
              className={cn(
                disabled && !revealed && "pointer-events-none opacity-60",
                revealed && "pointer-events-none",
                isCorrect && "ring-4 ring-emerald-500",
                isWrongPick && "ring-4 ring-rose-400",
                revealed && !isCorrect && !isWrongPick && "opacity-50",
              )}
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <span className="font-mono text-xl font-bold text-foreground">{text(option)}</span>
                {isCorrect ? (
                  <Check className="h-5 w-5 text-emerald-700" strokeWidth={3} />
                ) : isWrongPick ? (
                  <X className="h-5 w-5 text-rose-600" strokeWidth={3} />
                ) : (
                  <span className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-xs text-foreground/50">
                    {index + 1}
                  </span>
                )}
              </div>
            </WashiTapeStrip>
          </motion.div>
        )
      })}
    </div>
  )
}
