"use client"
import { useI18n } from "@/lib/i18n-context"
import { StickerButton } from "@/components/ui/stationery"

interface TruthButtonsProps {
  onAnswer: (answer: boolean) => void
  disabled?: boolean
}

export function TruthButtons({ onAnswer, disabled }: TruthButtonsProps) {
  const { t } = useI18n()

  return (
    <div className="flex gap-4">
      <StickerButton
        color="mint"
        size="lg"
        disabled={disabled}
        onClick={() => onAnswer(true)}
        className="flex-1 py-8 text-2xl"
      >
        {t.inputs.true}
      </StickerButton>
      <StickerButton
        color="pink"
        size="lg"
        disabled={disabled}
        onClick={() => onAnswer(false)}
        className="flex-1 py-8 text-2xl"
      >
        {t.inputs.false}
      </StickerButton>
    </div>
  )
}
