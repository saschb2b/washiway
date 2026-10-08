"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import type { TargetQuestion } from "@/lib/math"
import { useLocalize } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

interface TargetTilesProps {
  question: TargetQuestion
  onAnswer: (indices: number[]) => void
  disabled: boolean
  // After answering: the tiles the player picked (null when skipped).
  chosen?: number[] | null
}

// Rendered with key={question.id}, so the selection starts empty each time.
export function TargetTiles({ question, onAnswer, disabled, chosen }: TargetTilesProps) {
  const text = useLocalize()
  const [selected, setSelected] = useState<number[]>([])
  const revealed = chosen !== undefined

  const toggle = (index: number) => {
    if (disabled) return
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index))
      return
    }
    const next = [...selected, index]
    setSelected(next)
    if (next.length === question.pick) onAnswer(next)
  }

  useEffect(() => {
    if (disabled) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const index = Number(e.key) - 1
      if (Number.isInteger(index) && index >= 0 && index < question.tiles.length) {
        e.preventDefault()
        toggle(index)
      } else if (e.key === "Backspace") {
        e.preventDefault()
        setSelected([])
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  })

  const picked = revealed ? (chosen ?? []) : selected
  const columns = question.tiles.length === 4 ? "grid-cols-2" : "grid-cols-3"

  return (
    <div className={cn("mx-auto grid w-full max-w-sm gap-3", columns)}>
      {question.tiles.map((tile, index) => {
        const isPicked = picked.includes(index)
        const isSolution = revealed && question.answer.includes(index)
        const pickedWrong = revealed && isPicked && chosen !== null && !isSolution
        return (
          <motion.button
            key={index}
            whileTap={disabled ? {} : { scale: 0.94, y: 2 }}
            onClick={() => toggle(index)}
            disabled={disabled && !revealed}
            className={cn(
              "relative overflow-hidden rounded-xl border-2 py-5 font-mono text-2xl font-bold text-foreground",
              "shadow-[0_3px_0_rgba(0,0,0,0.06),0_4px_10px_rgba(0,0,0,0.06)] transition-colors",
              isPicked && !revealed ? "border-foreground/40" : "border-black/[0.06]",
              isSolution && "ring-4 ring-emerald-500",
              pickedWrong && "ring-4 ring-rose-400",
              revealed && !isSolution && !pickedWrong && "opacity-50",
            )}
            style={{
              backgroundColor: isPicked && !revealed ? "var(--theme-highlight)" : "var(--card)",
            }}
          >
            <span className="absolute top-1 left-2 text-[10px] font-normal text-foreground/40">{index + 1}</span>
            {text(tile)}
          </motion.button>
        )
      })}
    </div>
  )
}
