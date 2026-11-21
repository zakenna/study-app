import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Badge from "../components/ui/Badge";
import GlassCard from "../components/ui/GlassCard";
import ProgressBar from "../components/ui/ProgressBar";
import TipCard from "../components/ui/TipCard";
import { getTipById } from "../data/tips";
import { ERA_LABELS } from "../lib/labels";
import type { Question, QuestionStat } from "../types";
import ForgettingCurveChart from "./WrongNotePage.Chart";

interface WrongNoteCardProps {
  question: Question;
  stat: QuestionStat;
  retention: number;
  now: number;
  expanded: boolean;
  onToggle: () => void;
  isMemorized: (tipId: string) => boolean;
  onToggleMemorized: (tipId: string) => void;
}

const GRADUATE_STREAK = 2;

/** 오답노트 카드: 요약(문제·정답·틀린 횟수·기억 확률·연속 정답) + 펼치면 해설·꿀팁·망각곡선 */
function WrongNoteCard({
  question,
  stat,
  retention,
  now,
  expanded,
  onToggle,
  isMemorized,
  onToggleMemorized,
}: WrongNoteCardProps) {
  const percent = Math.round(retention * 100);
  // 오답노트에 있는 문제는 모두 복습 대상 → 초록(괜찮음) 대신 primary. 방금 틀린 문제는 공식상 100%로 나오기 때문
  const tone = retention < 0.5 ? "danger" : "primary";
  const tip = question.tipId ? getTipById(question.tipId) : undefined;
  const panelId = `wrong-note-${question.id}`;

  return (
    <GlassCard>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="w-full space-y-2.5 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{ERA_LABELS[question.era]}</Badge>
          <Badge tone="danger">✗ 틀린 횟수 {stat.wrong}</Badge>
          <span
            className="ml-auto flex items-center gap-1"
            aria-label={`연속 정답 ${stat.correctStreak} / ${GRADUATE_STREAK}`}
            title="2번 연속 맞히면 졸업"
          >
            {Array.from({ length: GRADUATE_STREAK }, (_, i) => (
              <span
                key={i}
                aria-hidden
                className={`size-2.5 rounded-full ${
                  i < stat.correctStreak
                    ? "bg-success"
                    : "border border-muted/60"
                }`}
              />
            ))}
          </span>
        </div>

        <p className="leading-relaxed font-medium">{question.question}</p>
        <p className="text-sm text-success">
          정답 · {question.options[question.answer]}
        </p>

        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-muted">기억 확률</span>
          <ProgressBar
            value={retention}
            tone={tone}
            label="기억 확률"
            className="flex-1"
          />
          <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums">
            {percent}%
          </span>
          <ChevronDown
            size={18}
            aria-hidden
            className={`shrink-0 text-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 border-t border-line pt-4">
              <p className="text-sm leading-relaxed text-ink/90">
                {question.explanation}
              </p>
              {tip && (
                <TipCard
                  tip={tip}
                  memorized={isMemorized(tip.id)}
                  onToggleMemorized={onToggleMemorized}
                />
              )}
              <ForgettingCurveChart stat={stat} now={now} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

export default WrongNoteCard;
