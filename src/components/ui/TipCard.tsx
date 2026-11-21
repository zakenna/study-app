import { Lightbulb, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import { ERA_LABELS, formatYear, TIP_KIND_LABELS } from "../../lib/labels";
import type { Tip } from "../../types";
import Badge from "./Badge";

interface TipCardProps {
  tip: Tip;
  /** 👍 "외워졌어요" 수. 넘기지 않으면 버튼을 숨긴다 */
  votes?: number;
  onVote?: (tipId: string) => void;
  className?: string;
}

/**
 * 💡 암기 꿀팁 카드 (퀴즈 오답·해설, 오답노트, 꿀팁 모음에서 공통 사용).
 * 나타날 때 살짝 튀어오르는 애니메이션.
 */
function TipCard({ tip, votes, onVote, className = "" }: TipCardProps) {
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

      {onVote && votes !== undefined && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => onVote(tip.id)}
          className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs text-muted transition hover:border-accent/60 hover:text-accent"
        >
          <ThumbsUp size={14} aria-hidden />
          외워졌어요 {votes}
        </motion.button>
      )}
    </motion.div>
  );
}

export default TipCard;
