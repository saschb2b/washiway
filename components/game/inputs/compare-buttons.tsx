"use client"

import { StickerButton } from "@/components/ui/stationery"
import { useI18n } from "@/lib/i18n-context"

interface CompareButtonsProps {
  onAnswer: (answer: "left" | "right") => void
  disabled?: boolean
}

export function CompareButtons({ onAnswer, disabled }: CompareButtonsProps) {
  const { t } = useI18n()

  return (
    <div className="flex gap-4">
      <StickerButton
        color="blue"
        size="lg"
        disabled={disabled}
        onClick={() => onAnswer("left")}
        className="flex-1 py-6 flex items-center justify-center gap-2"
      >
        <span className="text-2xl font-bold">{t.inputs.left}</span>
      </StickerButton>

      <StickerButton
        color="peach"
        size="lg"
        disabled={disabled}
        onClick={() => onAnswer("right")}
        className="flex-1 py-6 flex items-center justify-center gap-2"
      >
        <span className="text-2xl font-bold">{t.inputs.right}</span>
      </StickerButton>
    </div>
  )
}
