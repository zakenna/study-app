import { NotebookPen, ScrollText } from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import ProgressBar from "../components/ui/ProgressBar";
import { questions as allQuestions } from "../data/questions";
import { ERA_LABELS } from "../lib/labels";
import { retention } from "../lib/memory";
import { rankWeakStats } from "../lib/quiz";
import { isInWrongNote } from "../lib/storage";
import type { QuestionStat } from "../types";

interface DashboardMemoryProps {
  stats: Record<string, QuestionStat>;
  now: number;
  onGoWrongNote: () => void;
  onGoQuiz: () => void;
}

const questionById = new Map(allQuestions.map((q) => [q.id, q]));

/** 🧠 기억 상태: 평균 기억 확률, 곧 잊을 문제 수, 약점 TOP 5 */
function DashboardMemory({
  stats,
  now,
  onGoWrongNote,
  onGoQuiz,
}: DashboardMemoryProps) {
  const solved = Object.values(stats).filter((s) =>
    questionById.has(s.questionId),
  );
  const retentions = solved.map((s) => retention(s, now));
  const average =
    retentions.length > 0
      ? retentions.reduce((sum, p) => sum + p, 0) / retentions.length
      : 0;
  const forgetting = retentions.filter((p) => p < 0.5).length;
  // 퀴즈 "약점 집중"과 같은 기준: 오답노트 문제 먼저 → 기억 확률 낮은 순
  const weakest = rankWeakStats(stats, now).slice(0, 5);

  return (
    <GlassCard>
      <h3 className="font-bold">🧠 기억 상태</h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-canvas/40 p-3">
          <p className="text-xs text-muted">평균 기억 확률</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {Math.round(average * 100)}
            <span className="text-sm font-medium text-muted">%</span>
          </p>
          <ProgressBar
            className="mt-2"
            value={average}
            label="평균 기억 확률"
          />
        </div>
        <div className="rounded-xl border border-line bg-canvas/40 p-3">
          <p className="text-xs text-muted">곧 잊을 문제 (50% 미만)</p>
          <p
            className={`mt-1 text-2xl font-bold tabular-nums ${forgetting > 0 ? "text-danger" : ""}`}
          >
            {forgetting}
            <span className="text-sm font-medium text-muted">개</span>
          </p>
          <p className="mt-2 text-[11px] text-muted">
            {forgetting > 0
              ? "오늘 복습하면 다시 올라가요"
              : "모두 잘 기억하고 있어요"}
          </p>
        </div>
      </div>

      <h4 className="mt-5 mb-2 text-sm font-semibold text-muted">약점 TOP 5</h4>
      <ol className="space-y-2">
        {weakest.map((stat, i) => {
          const question = questionById.get(stat.questionId);
          if (!question) return null;
          const p = retention(stat, now);
          const needsReview = isInWrongNote(stat);
          return (
            <li
              key={stat.questionId}
              className="flex items-center gap-3 rounded-xl border border-line bg-canvas/30 px-3 py-2.5"
            >
              <span className="w-4 shrink-0 text-center text-sm font-bold text-muted tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{question.question}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge className="px-1.5 py-0 text-[10px]">
                    {ERA_LABELS[question.era]}
                  </Badge>
                  {needsReview && (
                    <Badge tone="danger" className="px-1.5 py-0 text-[10px]">
                      복습 필요
                    </Badge>
                  )}
                </div>
              </div>
              <span
                className={`shrink-0 text-sm font-semibold tabular-nums ${p < 0.5 ? "text-danger" : "text-ink"}`}
              >
                {Math.round(p * 100)}%
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={onGoWrongNote}>
          <NotebookPen size={16} aria-hidden />
          오답노트로
        </Button>
        <Button onClick={onGoQuiz}>
          <ScrollText size={16} aria-hidden />
          퀴즈 풀기
        </Button>
      </div>
    </GlassCard>
  );
}

export default DashboardMemory;
