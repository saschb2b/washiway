"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

interface CompareButtonsProps {
  onAnswer: (answer: "left" | "right") => void
  disabled?: boolean
}

export function CompareButtons({ onAnswer, disabled }: CompareButtonsProps) {
  const { t } = useI18n()

  return (
    <div className="flex gap-4">
      <WashiTapeButton
        themeColor="var(--theme-primary)"
        pattern="stripes"
        disabled={disabled}
        onClick={() => onAnswer("left")}
      >
        <ChevronLeft className="w-6 h-6" />
        <span>{t.inputs.left}</span>
      </WashiTapeButton>

      <WashiTapeButton
        themeColor="var(--theme-highlight)"
        pattern="dots"
        disabled={disabled}
        onClick={() => onAnswer("right")}
      >
        <span>{t.inputs.right}</span>
        <ChevronRight className="w-6 h-6" />
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
}

function WashiTapeButton({ children, themeColor, pattern = "solid", disabled, onClick }: WashiTapeButtonProps) {
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
        "flex-1 py-6 rounded-xl text-xl font-bold relative overflow-hidden",
        "flex items-center justify-center gap-2",
        "text-foreground",
        "shadow-[0_4px_0_rgba(0,0,0,0.08),0_6px_16px_rgba(0,0,0,0.1)]",
        "active:shadow-[0_2px_0_rgba(0,0,0,0.08),0_3px_8px_rgba(0,0,0,0.1)]",
        "transition-shadow duration-100",
        "disabled:opacity-50 disabled:pointer-events-none",
      )}
      style={{
        backgroundColor: themeColor,
        backgroundImage: patternStyle[pattern],
        backgroundSize: pattern === "dots" ? "12px 12px" : undefined,
      }}
    >
      {/* Left torn edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-black/[0.06] to-transparent" />
      {/* Right torn edge */}
      <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-l from-black/[0.06] to-transparent" />
      {/* Top highlight shine */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      {/* Shine notch */}
      <div className="absolute top-3 right-4 w-8 h-2 bg-white/40 rounded-full transform -rotate-12" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
}
