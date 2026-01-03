"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5 relative overflow-hidden min-h-dvh">
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
            className="w-11 h-11 rounded-xl border-2 border-black/[0.08] flex items-center justify-center hover:scale-105 transition-transform shadow-sm"
            style={{ backgroundColor: "var(--theme-highlight)" }}
          >
            <BookOpen className="w-5 h-5 text-foreground" />
          </button>

          {/* Mute button */}
          <button
            onClick={() => {
              play("tap")
              setMuted(!isMuted)
            }}
            className="w-11 h-11 rounded-xl bg-card border-2 border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Volume2 className="w-5 h-5 text-foreground" />
            )}
          </button>
        </motion.div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-[5%] -left-12 w-40 h-4 transform -rotate-12 rounded-sm"
            style={{
              backgroundColor: "var(--theme-highlight)",
              opacity: 0.5,
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.03) 4px, rgba(0,0,0,0.03) 8px)`,
            }}
          />
          <div
            className="absolute top-[20%] -right-8 w-32 h-3.5 transform rotate-6 rounded-sm"
            style={{
              backgroundColor: "var(--theme-muted)",
              opacity: 0.5,
              backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)`,
              backgroundSize: "8px 8px",
            }}
          />
          <div
            className="absolute bottom-[18%] left-[3%] w-28 h-3 transform -rotate-2 rounded-sm"
            style={{
              backgroundColor: "var(--theme-primary)",
              opacity: 0.4,
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.03) 6px, rgba(0,0,0,0.03) 12px)`,
            }}
          />
          <div
            className="absolute bottom-[7%] right-[5%] w-24 h-3 transform rotate-8 rounded-sm"
            style={{
              backgroundColor: "var(--theme-secondary)",
              opacity: 0.4,
              backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.03) 4px, rgba(0,0,0,0.03) 8px)`,
            }}
          />
          <div
            className="absolute top-[45%] -left-6 w-20 h-2.5 transform rotate-3 rounded-sm"
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
          className="w-full max-w-sm space-y-3 z-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex-1 h-2 rounded-sm"
              style={{
                backgroundColor: "var(--theme-primary)",
                opacity: 0.5,
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 6px)`,
              }}
            />
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
              {t.menu.chooseMode}
            </span>
            <div
              className="flex-1 h-2 rounded-sm"
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
                    <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-base font-bold shadow-sm border border-black/[0.06] text-foreground/80">
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground">{modeTranslation.name}</p>
                      <p className="text-sm text-foreground/70 truncate">{modeTranslation.description}</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/60 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-foreground/50" />
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
