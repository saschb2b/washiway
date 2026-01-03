"use client"

import type React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StickyNoteProps {
  children: React.ReactNode
  color?: "yellow" | "pink" | "blue" | "mint" | "peach"
  className?: string
  rotate?: number
}

const stickyColors = {
  yellow: "bg-pastel-yellow",
  pink: "bg-pastel-pink",
  blue: "bg-pastel-blue",
  mint: "bg-pastel-mint",
  peach: "bg-pastel-peach",
}

export function StickyNote({ children, color = "yellow", className, rotate = 0 }: StickyNoteProps) {
  return (
    <div
      className={cn("relative p-4 rounded-sm", stickyColors[color], "shadow-[2px_3px_8px_rgba(0,0,0,0.1)]", className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* Folded corner */}
      <div
        className="absolute bottom-0 left-0 w-5 h-5 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.06) 50%)`,
        }}
      />
      {/* Subtle tape on top */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-pastel-mint/60 rounded-sm" />
      {children}
    </div>
  )
}

interface IndexCardProps {
  children: React.ReactNode
  ruled?: boolean
  className?: string
}

export function IndexCard({ children, ruled = false, className }: IndexCardProps) {
  return (
    <div
      className={cn(
        "relative bg-card border border-border rounded-lg p-4",
        "shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
        className,
      )}
    >
      {ruled && (
        <div
          className="absolute inset-x-4 top-8 bottom-4 pointer-events-none opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              transparent, transparent 22px,
              var(--border) 22px, var(--border) 23px
            )`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

interface WashiTapeProps {
  color?: "mint" | "pink" | "blue" | "peach" | "lavender"
  className?: string
  pattern?: "dots" | "stripes" | "solid"
}

const washiColors = {
  mint: "bg-pastel-mint",
  pink: "bg-pastel-pink",
  blue: "bg-pastel-blue",
  peach: "bg-pastel-peach",
  lavender: "bg-pastel-lavender",
}

export function WashiTape({ color = "mint", className, pattern = "solid" }: WashiTapeProps) {
  return (
    <div
      className={cn("h-6 w-full opacity-80", washiColors[color], className)}
      style={{
        backgroundImage:
          pattern === "dots"
            ? `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`
            : pattern === "stripes"
              ? `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)`
              : undefined,
        backgroundSize: pattern === "dots" ? "8px 8px" : undefined,
      }}
    >
      {/* Torn edges */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-transparent to-black/5" />
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-transparent to-black/5" />
    </div>
  )
}

interface WashiTapeStripProps {
  children: React.ReactNode
  color: "mint" | "pink" | "blue" | "peach" | "lavender" | "yellow"
  pattern?: "dots" | "stripes" | "dashes" | "zigzag"
  className?: string
  onClick?: () => void
}

const washiStripColors = {
  mint: { bg: "bg-pastel-mint", border: "border-pastel-mint" },
  pink: { bg: "bg-pastel-pink", border: "border-pastel-pink" },
  blue: { bg: "bg-pastel-blue", border: "border-pastel-blue" },
  peach: { bg: "bg-pastel-peach", border: "border-pastel-peach" },
  lavender: { bg: "bg-pastel-lavender", border: "border-pastel-lavender" },
  yellow: { bg: "bg-pastel-yellow", border: "border-pastel-yellow" },
}

export function WashiTapeStrip({ children, color, pattern = "dots", className, onClick }: WashiTapeStripProps) {
  const colorStyle = washiStripColors[color]

  const patternStyle = {
    dots: `radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)`,
    stripes: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.04) 8px, rgba(0,0,0,0.04) 16px)`,
    dashes: `repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.04) 20px)`,
    zigzag: `repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(0,0,0,0.04) 8px, rgba(0,0,0,0.04) 16px)`,
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full text-left rounded-lg overflow-hidden",
        colorStyle.bg,
        "shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
        "border border-black/[0.06]",
        className,
      )}
      style={{
        backgroundImage: patternStyle[pattern],
        backgroundSize: pattern === "dots" ? "10px 10px" : undefined,
      }}
    >
      {/* Left torn edge effect */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/[0.04] to-transparent" />
      {/* Right torn edge effect */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black/[0.04] to-transparent" />
      {/* Top highlight for tape sheen */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.button>
  )
}

interface StickerButtonProps {
  children: React.ReactNode
  color?: "mint" | "pink" | "blue" | "peach" | "lavender" | "yellow"
  onClick?: () => void
  disabled?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

const stickerColors = {
  mint: "bg-pastel-mint",
  pink: "bg-pastel-pink",
  blue: "bg-pastel-blue",
  peach: "bg-pastel-peach",
  lavender: "bg-pastel-lavender",
  yellow: "bg-pastel-yellow",
}

export function StickerButton({
  children,
  color = "mint",
  onClick,
  disabled,
  className,
  size = "md",
}: StickerButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95, y: 2 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative font-bold rounded-xl",
        stickerColors[color],
        "text-foreground",
        "border-2 border-black/8",
        "shadow-[0_4px_0_rgba(0,0,0,0.08),0_6px_12px_rgba(0,0,0,0.1)]",
        "active:shadow-[0_2px_0_rgba(0,0,0,0.08),0_3px_6px_rgba(0,0,0,0.1)]",
        "transition-shadow duration-100",
        "disabled:opacity-50 disabled:pointer-events-none",
        sizeClasses[size],
        className,
      )}
    >
      {/* Shine notch */}
      <div className="absolute top-2 right-3 w-6 h-2 bg-white/40 rounded-full transform -rotate-12" />
      {children}
    </motion.button>
  )
}

interface LabelStickerProps {
  children: React.ReactNode
  color?: "default" | "mint" | "pink" | "blue"
  className?: string
}

const labelColors = {
  default: "bg-card border-border",
  mint: "bg-pastel-mint/30 border-pastel-mint",
  pink: "bg-pastel-pink/30 border-pastel-pink",
  blue: "bg-pastel-blue/30 border-pastel-blue",
}

export function LabelSticker({ children, color = "default", className }: LabelStickerProps) {
  return (
    <span
      className={cn(
        "inline-flex px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide",
        "border-[1.5px]",
        "shadow-[1px_1px_2px_rgba(0,0,0,0.04)]",
        labelColors[color],
        className,
      )}
    >
      {children}
    </span>
  )
}

interface PaperBackgroundProps {
  children: React.ReactNode
  className?: string
}

export function PaperBackground({ children, className }: PaperBackgroundProps) {
  return (
    <div className={cn("relative min-h-dvh bg-background", className)}>
      {/* Paper grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

interface NotebookCardProps {
  children: React.ReactNode
  className?: string
}

export function NotebookCard({ children, className }: NotebookCardProps) {
  return (
    <div className={cn("relative bg-card rounded-lg overflow-hidden", className)}>
      {/* Spine decoration */}
      <div className="absolute left-0 top-2 bottom-2 w-2 bg-gradient-to-r from-black/8 to-transparent rounded-l" />
      {/* Spiral holes */}
      <div className="absolute left-1 top-4 bottom-4 flex flex-col justify-around">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-background shadow-inner" />
        ))}
      </div>
      <div className="pl-5">{children}</div>
    </div>
  )
}

// Tab dividers for difficulty selection
interface TabDividersProps {
  tabs: { level: number; label: string; color: string }[]
  selected: number
  onChange: (level: number) => void
}

export function TabDividers({ tabs, selected, onChange }: TabDividersProps) {
  return (
    <div className="flex gap-1">
      {tabs.map((tab, index) => (
        <motion.button
          key={tab.level}
          onClick={() => onChange(tab.level)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex-1 py-3 rounded-t-lg font-semibold text-sm transition-all",
            "border-2 border-b-0",
            selected === tab.level
              ? cn(tab.color, "border-transparent shadow-md -mb-[2px] relative z-10")
              : "bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted",
          )}
          style={{
            clipPath:
              index === 0
                ? "polygon(0 8px, 8px 0, 100% 0, 100% 100%, 0 100%)"
                : index === tabs.length - 1
                  ? "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)"
                  : undefined,
          }}
        >
          {tab.label}
        </motion.button>
      ))}
    </div>
  )
}

interface WashiwayLogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function WashiwayLogo({ size = "md", className }: WashiwayLogoProps) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl md:text-5xl",
    lg: "text-5xl md:text-6xl",
  }

  const tapeWidth = {
    sm: "w-16",
    md: "w-24",
    lg: "w-32",
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <h1 className={cn("font-extrabold tracking-tight text-foreground", sizeClasses[size])}>
        Washi<span className="text-pastel-mint">way</span>
      </h1>
      {/* Signature washi tape underline */}
      <div
        className={cn(
          "absolute -bottom-1 left-0 h-2 rounded-sm transform -rotate-1",
          "bg-gradient-to-r from-pastel-pink via-pastel-mint to-pastel-blue",
          tapeWidth[size],
        )}
      >
        {/* Tape texture */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(255,255,255,0.5) 3px,
              rgba(255,255,255,0.5) 4px
            )`,
          }}
        />
      </div>
    </div>
  )
}
