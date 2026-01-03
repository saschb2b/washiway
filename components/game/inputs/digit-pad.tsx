"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DigitPadProps {
  onAnswer: (answer: number) => void
  disabled?: boolean
  correctAnswer: number
  questionId: string
}

export function DigitPad({ onAnswer, disabled, correctAnswer, questionId }: DigitPadProps) {
  const [input, setInput] = useState("")
  const [isNegative, setIsNegative] = useState(false)

  const inputRef = useRef("")
  const isNegativeRef = useRef(false)
  const hasSubmittedRef = useRef(false)
  const lastQuestionIdRef = useRef(questionId)

  if (questionId !== lastQuestionIdRef.current) {
    lastQuestionIdRef.current = questionId
    inputRef.current = ""
    isNegativeRef.current = false
    hasSubmittedRef.current = false
    if (input !== "") setInput("")
    if (isNegative !== false) setIsNegative(false)
  }

  useEffect(() => {
    if (disabled) return
    if (inputRef.current === "") return
    if (hasSubmittedRef.current) return

    const currentValue = isNegativeRef.current
      ? -Number.parseInt(inputRef.current, 10)
      : Number.parseInt(inputRef.current, 10)
    const answerStr = Math.abs(correctAnswer).toString()

    if (inputRef.current.length === answerStr.length) {
      hasSubmittedRef.current = true
      onAnswer(currentValue)
    }
  }, [input, isNegative, correctAnswer, onAnswer, disabled])

  const handleDigit = useCallback(
    (digit: string) => {
      if (disabled || hasSubmittedRef.current) return
      if (inputRef.current.length >= 4) return
      const newInput = inputRef.current + digit
      inputRef.current = newInput
      setInput(newInput)
    },
    [disabled],
  )

  const handleDelete = useCallback(() => {
    if (disabled || hasSubmittedRef.current) return
    const newInput = inputRef.current.slice(0, -1)
    inputRef.current = newInput
    setInput(newInput)
  }, [disabled])

  const handleNegativeToggle = useCallback(() => {
    if (disabled || hasSubmittedRef.current) return
    isNegativeRef.current = !isNegativeRef.current
    setIsNegative(isNegativeRef.current)
  }, [disabled])

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "neg"]
  const displayValue = input === "" ? "" : (isNegative ? "-" : "") + input

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div
          className={cn(
            "inline-flex items-center justify-center min-w-[140px] min-h-[72px] px-8 rounded-xl relative overflow-hidden",
            "font-mono text-5xl font-bold text-foreground",
            "transition-all duration-150",
            input ? "shadow-[0_4px_12px_rgba(0,0,0,0.1)]" : "shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
          )}
          style={{
            backgroundColor: "var(--theme-primary)",
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.4) 8px, rgba(255,255,255,0.4) 10px)`,
          }}
        >
          {/* Torn edges */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-black/[0.06] to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-l from-black/[0.06] to-transparent" />
          <span className="relative z-10">{displayValue || <span className="text-foreground/30">?</span>}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
        {digits.map((digit) => (
          <motion.button
            key={digit}
            whileTap={{ scale: 0.92, y: 2 }}
            disabled={disabled}
            onClick={() => {
              if (digit === "del") handleDelete()
              else if (digit === "neg") handleNegativeToggle()
              else handleDigit(digit)
            }}
            className={cn(
              "py-5 rounded-xl text-2xl font-bold relative overflow-hidden",
              "transition-all duration-100",
              "disabled:opacity-50 disabled:pointer-events-none",
              digit === "del"
                ? "bg-pastel-pink/50 text-foreground"
                : digit !== "neg" &&
                    cn(
                      "bg-card text-card-foreground",
                      "border border-border",
                      "shadow-[0_3px_0_rgba(0,0,0,0.06)]",
                      "active:shadow-[0_1px_0_rgba(0,0,0,0.06)]",
                    ),
            )}
            style={
              digit === "neg"
                ? {
                    backgroundColor: isNegative ? "var(--theme-highlight)" : "var(--theme-muted)",
                    boxShadow: isNegative ? "0 3px 0 rgba(0,0,0,0.08)" : undefined,
                  }
                : undefined
            }
          >
            {/* Subtle shine for number buttons */}
            {digit !== "del" && digit !== "neg" && (
              <div className="absolute top-1 right-2 w-4 h-1 bg-white/30 rounded-full transform -rotate-12" />
            )}
            <span className="relative z-10">{digit === "del" ? "←" : digit === "neg" ? "±" : digit}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
