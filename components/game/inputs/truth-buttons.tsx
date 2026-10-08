"use client"

import type React from "react"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

interface TruthButtonsProps {
  onAnswer: (answer: boolean) => void
  disabled?: boolean
}

export function TruthButtons({ onAnswer, disabled }: TruthButtonsProps) {
  const { t } = useI18n()

  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        e.preventDefault()
        onAnswer(true)
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        e.preventDefault()
        onAnswer(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onAnswer, disabled])

  return (
    <div className="flex gap-4">
      <WashiTapeButton
        themeColor="var(--theme-primary)"
        pattern="stripes"
        disabled={disabled}
        onClick={() => onAnswer(true)}
        hint="A"
      >
        {t.inputs.true}
      </WashiTapeButton>
      <WashiTapeButton
        themeColor="var(--theme-highlight)"
        pattern="dots"
        disabled={disabled}
        onClick={() => onAnswer(false)}
        hint="D"
      >
        {t.inputs.false}
      </WashiTapeButton>
    </div>
  )
}

interface WashiTapeButtonProps {
  children: React.ReactNode
  themeColor: string
  pattern?: "dots" | "stripes" | "solid"
  disabled?: boolean
  onClick?: () => void
  hint?: string
}

function WashiTapeButton({ children, themeColor, pattern = "solid", disabled, onClick, hint }: WashiTapeButtonProps) {
  const patternStyle = {
    dots: `radial-gradient(circle, rgba(255,255,255,0.5) 1.5px, transparent 1.5px)`,
    stripes: `repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.4) 6px, rgba(255,255,255,0.4) 12px)`,
    solid: undefined,
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95, y: 2 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex-1 overflow-hidden rounded-xl py-7 text-2xl font-bold",
        "text-foreground",
        "shadow-[0_4px_0_rgba(0,0,0,0.08),0_6px_16px_rgba(0,0,0,0.1)]",
        "active:shadow-[0_2px_0_rgba(0,0,0,0.08),0_3px_8px_rgba(0,0,0,0.1)]",
        "transition-shadow duration-100",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
      style={{
        backgroundColor: themeColor,
        backgroundImage: patternStyle[pattern],
        backgroundSize: pattern === "dots" ? "12px 12px" : undefined,
      }}
    >
      {/* Left torn edge */}
      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-r from-black/[0.06] to-transparent" />
      {/* Right torn edge */}
      <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-l from-black/[0.06] to-transparent" />
      {/* Top highlight shine */}
      <div className="absolute top-0 right-4 left-4 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      {/* Shine notch */}
      <div className="absolute top-3 right-4 h-2 w-8 -rotate-12 transform rounded-full bg-white/40" />
      <span className="relative z-10">{children}</span>
      {hint && (
        <span className="absolute right-2 bottom-2 rounded bg-black/10 px-1.5 py-0.5 font-mono text-xs text-foreground/50">
          {hint}
        </span>
      )}
    </motion.button>
  )
}
