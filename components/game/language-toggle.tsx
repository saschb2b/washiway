"use client"

import { motion } from "framer-motion"
import { useI18n, type Language } from "@/lib/i18n-context"
import { useAudio } from "@/lib/audio-context"
import { cn } from "@/lib/utils"

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
]

export function LanguageToggle() {
  const { language, setLanguage } = useI18n()
  const { play } = useAudio()

  return (
    <div className="flex overflow-hidden rounded-full border-2 border-border/50 bg-card/80">
      {LANGUAGES.map((lang) => (
        <motion.button
          key={lang.code}
          onClick={() => {
            play("tap")
            setLanguage(lang.code)
          }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-all duration-200",
            language === lang.code ? "bg-pastel-blue text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {lang.label}
        </motion.button>
      ))}
    </div>
  )
}
