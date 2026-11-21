import { Check, Lightbulb, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import { ERA_LABELS, formatYear, TIP_KIND_LABELS } from "../../lib/labels";
import type { Tip } from "../../types";
import Badge from "./Badge";

interface TipCardProps {
  tip: Tip;
  /** 👍 "외워졌어요" 상태 (storage의 isTipMemorized) */
  memorized?: boolean;
  /** 넘기면 "외워졌어요" 토글 버튼이 생긴다 (storage의 toggleTipMemorized) */
  onToggleMemorized?: (tipId: string) => void;
  className?: string;
}

/**
 * 💡 암기 꿀팁 카드 (퀴즈 오답·해설, 오답노트, 꿀팁 모음에서 공통 사용).
 * 나타날 때 살짝 튀어오르는 애니메이션.
 */
function TipCard({
  tip,
  memorized = false,
  onToggleMemorized,
  className = "",
}: TipCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0.35 }}
      className={`rounded-2xl border border-accent/40 bg-accent/10 p-4 backdrop-blur-xl ${className}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
          <Lightbulb size={16} aria-hidden />
          암기 꿀팁
        </span>
        <Badge tone="accent">{TIP_KIND_LABELS[tip.kind]}</Badge>
        <Badge>
          {ERA_LABELS[tip.era]}
          {tip.year !== undefined && ` · ${formatYear(tip.year)}`}
        </Badge>
      </div>

      <p className="text-[1.0625rem] leading-relaxed font-medium text-ink">
        {tip.text}
      </p>

      {onToggleMemorized && (
        <motion.button
          type="button"
          aria-pressed={memorized}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggleMemorized(tip.id)}
          className={`mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs transition ${
            memorized
              ? "border-accent bg-accent/20 font-semibold text-accent"
              : "border-line text-muted hover:border-accent/60 hover:text-accent"
          }`}
        >
          <motion.span
            key={String(memorized)}
            initial={memorized ? { scale: 1.6, rotate: -15 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 14 }}
            className="inline-flex"
          >
            {memorized ? (
              <Check size={14} aria-hidden />
            ) : (
              <ThumbsUp size={14} aria-hidden />
            )}
          </motion.span>
          {memorized ? "외워졌어요!" : "외워졌어요"}
        </motion.button>
      )}
    </motion.div>
  );
}

export default TipCard;
