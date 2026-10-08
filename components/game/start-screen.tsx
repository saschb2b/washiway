"use client"

import { useState } from "react"
import { motion } from "motion/react"
import type { GameMode } from "@/lib/game-types"
import { ModeConfigSheet } from "./mode-config-sheet"
import { WashiBinder } from "./washi-binder"
import { useAudio } from "@/lib/audio-context"
import { useI18n } from "@/lib/i18n-context"
import { LanguageToggle } from "./language-toggle"
import { Volume2, VolumeX, ChevronRight, BookOpen } from "lucide-react"
import { PaperBackground, WashiwayLogo, WashiTapeStrip } from "@/components/ui/stationery"

interface StartScreenProps {
  onStartGame: (mode: GameMode) => void
}

const MODE_IDS: GameMode[] = ["truth", "compare", "digit", "missing", "combo", "match"]

const MODE_STYLES: Record<
  GameMode,
  {
    color: "mint" | "pink" | "blue" | "peach" | "lavender" | "yellow"
    pattern: "dots" | "stripes" | "dashes" | "zigzag"
    icon: string
  }
> = {
  truth: { color: "blue", pattern: "dots", icon: "?" },
  compare: { color: "peach", pattern: "stripes", icon: "⟷" },
  digit: { color: "mint", pattern: "dashes", icon: "#" },
  missing: { color: "pink", pattern: "zigzag", icon: "_" },
  combo: { color: "lavender", pattern: "dots", icon: "★" },
  match: { color: "yellow", pattern: "stripes", icon: "≡" },
}

export function StartScreen({ onStartGame }: StartScreenProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [isBinderOpen, setIsBinderOpen] = useState(false)
  const { play, isMuted, setMuted } = useAudio()
  const { t } = useI18n()

  return (
    <PaperBackground>
      <div className="relative flex min-h-dvh flex-1 flex-col items-center justify-center gap-5 overflow-hidden p-6">
        {/* Language toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 left-4 z-20"
        >
          <LanguageToggle />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 right-4 z-20 flex items-center gap-2"
        >
          <button
            onClick={() => {
              play("tap")
              setIsBinderOpen(true)
            }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black/[0.08] shadow-sm transition-transform hover:scale-105"
            style={{ backgroundColor: "var(--theme-highlight)" }}
          >
            <BookOpen className="h-5 w-5 text-foreground" />
          </button>

          {/* Mute button */}
          <button
            onClick={() => {
              play("tap")
              setMuted(!isMuted)
            }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-border bg-card shadow-sm transition-colors hover:bg-muted"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Volume2 className="h-5 w-5 text-foreground" />
            )}
          </button>
        </motion.div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[5%] -left-12 h-4 w-40 -rotate-12 transform rounded-sm"
            style={{
              backgroundColor: "var(--theme-highlight)",
              opacity: 0.5,
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.03) 4px, rgba(0,0,0,0.03) 8px)`,
            }}
          />
          <div
            className="absolute top-[20%] -right-8 h-3.5 w-32 rotate-6 transform rounded-sm"
            style={{
              backgroundColor: "var(--theme-muted)",
              opacity: 0.5,
              backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)`,
              backgroundSize: "8px 8px",
            }}
          />
          <div
            className="absolute bottom-[18%] left-[3%] h-3 w-28 -rotate-2 transform rounded-sm"
            style={{
              backgroundColor: "var(--theme-primary)",
              opacity: 0.4,
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.03) 6px, rgba(0,0,0,0.03) 12px)`,
            }}
          />
          <div
            className="absolute right-[5%] bottom-[7%] h-3 w-24 rotate-8 transform rounded-sm"
            style={{
              backgroundColor: "var(--theme-secondary)",
              opacity: 0.4,
              backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.03) 4px, rgba(0,0,0,0.03) 8px)`,
            }}
          />
          <div
            className="absolute top-[45%] -left-6 h-2.5 w-20 rotate-3 transform rounded-sm"
            style={{ backgroundColor: "var(--theme-highlight)", opacity: 0.3 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="z-10"
        >
          <WashiwayLogo size="md" />
        </motion.div>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="z-10 w-full max-w-sm space-y-3"
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="h-2 flex-1 rounded-sm"
              style={{
                backgroundColor: "var(--theme-primary)",
                opacity: 0.5,
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 6px)`,
              }}
            />
            <span className="px-1 text-sm font-bold tracking-wider text-muted-foreground uppercase">
              {t.menu.chooseMode}
            </span>
            <div
              className="h-2 flex-1 rounded-sm"
              style={{
                backgroundColor: "var(--theme-primary)",
                opacity: 0.5,
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 6px)`,
              }}
            />
          </div>

          {MODE_IDS.map((modeId, index) => {
            const modeTranslation = t.modes[modeId]
            const style = MODE_STYLES[modeId]
            return (
              <motion.div
                key={modeId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.06 }}
              >
                <WashiTapeStrip
                  color={style.color}
                  pattern={style.pattern}
                  onClick={() => {
                    play("tap")
                    setSelectedMode(modeId)
                  }}
                >
                  <div className="flex items-center gap-3 p-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.06] bg-white/80 text-base font-bold text-foreground/80 shadow-sm">
                      {style.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground">{modeTranslation.name}</p>
                      <p className="truncate text-sm text-foreground/70">{modeTranslation.description}</p>
                    </div>
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/60">
                      <ChevronRight className="h-4 w-4 text-foreground/50" />
                    </div>
                  </div>
                </WashiTapeStrip>
              </motion.div>
            )
          })}
        </motion.div>

        <ModeConfigSheet
          mode={selectedMode}
          onClose={() => setSelectedMode(null)}
          onStart={(mode) => {
            setSelectedMode(null)
            onStartGame(mode)
          }}
        />

        <WashiBinder isOpen={isBinderOpen} onClose={() => setIsBinderOpen(false)} />
      </div>
    </PaperBackground>
  )
}
