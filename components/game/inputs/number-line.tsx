"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import type { NumberLineQuestion } from "@/lib/math"
import { useLocalize } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

interface NumberLineProps {
  question: NumberLineQuestion
  onAnswer: (value: number) => void
  disabled: boolean
  // After answering: where the player tapped (null when skipped).
  guess?: number | null
}

// Press to place a marker, slide to adjust, release to answer. Keyboard:
// arrows move the marker (Shift for bigger steps), Enter answers.
export function NumberLine({ question, onAnswer, disabled, guess }: NumberLineProps) {
  const text = useLocalize()
  const trackRef = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const span = question.max - question.min
  const revealed = guess !== undefined

  const share = (value: number) => ((value - question.min) / span) * 100
  const valueAt = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect) return question.min
      const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      return question.min + t * span
    },
    [question.min, span],
  )

  useEffect(() => {
    if (disabled) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault()
        const step = (e.shiftKey ? 0.05 : 0.01) * span * (e.key === "ArrowLeft" ? -1 : 1)
        setCursor((c) => Math.min(question.max, Math.max(question.min, (c ?? question.min + span / 2) + step)))
      } else if ((e.key === "Enter" || e.key === " ") && cursor !== null) {
        e.preventDefault()
        onAnswer(cursor)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [disabled, cursor, span, question.min, question.max, onAnswer])

  const marker = revealed ? guess : cursor
  const band = question.tolerance * 100

  return (
    <div className="mx-auto w-full max-w-md px-2 select-none">
      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={question.min}
        aria-valuemax={question.max}
        aria-valuenow={cursor ?? undefined}
        tabIndex={0}
        className={cn("relative h-28 touch-none", disabled ? "cursor-default" : "cursor-crosshair")}
        onPointerDown={(e) => {
          if (disabled) return
          e.currentTarget.setPointerCapture(e.pointerId)
          setDragging(true)
          setCursor(valueAt(e.clientX))
        }}
        onPointerMove={(e) => {
          if (dragging) setCursor(valueAt(e.clientX))
        }}
        onPointerUp={(e) => {
          if (!dragging) return
          setDragging(false)
          onAnswer(valueAt(e.clientX))
        }}
        onPointerCancel={() => setDragging(false)}
      >
        {/* The line itself, as a strip of washi tape */}
        <div
          className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-sm shadow-sm"
          style={{
            backgroundColor: "var(--theme-primary)",
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.45) 6px, rgba(255,255,255,0.45) 8px)",
          }}
        />
        {/* End caps and benchmark ticks */}
        {[question.min, question.max].map((v) => (
          <div
            key={v}
            className="absolute top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded bg-foreground/70"
            style={{ left: `${share(v)}%` }}
          />
        ))}
        {question.ticks.map((v) => (
          <div
            key={v}
            className="absolute top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded bg-foreground/40"
            style={{ left: `${share(v)}%` }}
          />
        ))}
        <span className="absolute bottom-0 left-0 -translate-x-1/2 font-mono text-sm font-bold text-foreground/80">
          {text(question.minLabel)}
        </span>
        <span className="absolute right-0 bottom-0 translate-x-1/2 font-mono text-sm font-bold text-foreground/80">
          {text(question.maxLabel)}
        </span>

        {/* After answering: the hit zone and the true position */}
        {revealed && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-1/2 h-6 -translate-y-1/2 rounded bg-emerald-400/35"
              style={{
                left: `${Math.max(0, share(question.value) - band)}%`,
                width: `${Math.min(100, share(question.value) + band) - Math.max(0, share(question.value) - band)}%`,
              }}
            />
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              className="absolute top-3 h-[calc(50%+0.5rem)] w-1 -translate-x-1/2 rounded bg-emerald-600"
              style={{ left: `${share(question.value)}%` }}
            />
          </>
        )}

        {/* The player's marker */}
        {marker !== null && marker !== undefined && (
          <div className="pointer-events-none absolute top-1/2 -translate-x-1/2" style={{ left: `${share(marker)}%` }}>
            <div
              className={cn(
                "-mt-9 h-6 w-6 rotate-45 rounded-tl-full rounded-tr-full rounded-bl-full border-2 border-white shadow-md",
                revealed ? "bg-foreground/70" : "bg-foreground",
              )}
            />
          </div>
        )}
      </div>
    </div>
  )
}
