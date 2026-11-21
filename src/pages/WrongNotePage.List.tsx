import { BrainCircuit, GraduationCap, NotebookPen } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import { questions as allQuestions } from "../data/questions";
import { ERAS, ERA_LABELS } from "../lib/labels";
import { retention } from "../lib/memory";
import {
  isGraduated,
  isInWrongNote,
  isTipMemorized,
  toggleTipMemorized,
} from "../lib/storage";
import { useCountUp } from "../lib/useCountUp";
import { useStudyData } from "../lib/useStudyData";
import type { Era, Question, QuestionStat } from "../types";
import WrongNoteCard from "./WrongNotePage.Card";

interface WrongNoteListProps {
  onStart: (questions: Question[]) => void;
  onGoQuiz: () => void;
}

type SortKey = "retention" | "recent";

const SORT_LABELS: Record<SortKey, string> = {
  retention: "기억 확률 낮은 순",
  recent: "최근 푼 순",
};

interface NoteItem {
  question: Question;
  stat: QuestionStat;
  retention: number;
}

/** 오답노트 목록: 요약 → 다시 풀기 → 필터·정렬 → 카드 */
function WrongNoteList({ onStart, onGoQuiz }: WrongNoteListProps) {
  const { stats, tipVotes } = useStudyData();
  // 화면을 연 시점 기준으로 기억 확률을 계산 (렌더링마다 값이 흔들리지 않게)
  const [now] = useState(() => Date.now());
  const [eraFilter, setEraFilter] = useState<Era | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("retention");
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useMemo<NoteItem[]>(
    () =>
      allQuestions.flatMap((question) => {
        const stat = stats[question.id];
        return stat && isInWrongNote(stat)
          ? [{ question, stat, retention: retention(stat, now) }]
          : [];
      }),
    [stats, now],
  );
  const graduatedCount = allQuestions.filter((q) =>
    isGraduated(stats[q.id]),
  ).length;
  const lowCount = items.filter((item) => item.retention < 0.5).length;

  const erasInNote = ERAS.filter((era) =>
    items.some((item) => item.question.era === era),
  );
  const activeEra =
    eraFilter !== "all" && erasInNote.includes(eraFilter) ? eraFilter : "all";
  const visible = items
    .filter((item) => activeEra === "all" || item.question.era === activeEra)
    .sort((a, b) =>
      sortKey === "retention"
        ? a.retention - b.retention
        : b.stat.lastReviewedAt - a.stat.lastReviewedAt,
    );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">오답노트</h2>
        <p className="mt-1 text-sm text-muted">
          2번 연속 맞히면 🎓 졸업해서 목록에서 빠져요.
        </p>
      </div>

      {(items.length > 0 || graduatedCount > 0) && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <SummaryCard
            icon={<NotebookPen size={18} aria-hidden />}
            label="복습 필요"
            value={items.length}
            unit="문제"
            tone="text-danger"
          />
          <SummaryCard
            icon={<BrainCircuit size={18} aria-hidden />}
            label="기억 확률 50% 미만"
            value={lowCount}
            unit="문제"
            tone="text-accent"
            delay={0.1}
          />
          <SummaryCard
            icon={<GraduationCap size={18} aria-hidden />}
            label="졸업한 문제"
            value={graduatedCount}
            unit="개"
            tone="text-success"
            delay={0.2}
          />
        </div>
      )}

      {items.length === 0 ? (
        <GlassCard className="py-10 text-center">
          <p className="text-4xl" aria-hidden>
            🎉
          </p>
          <p className="mt-3 text-lg font-bold">아직 틀린 문제가 없어요</p>
          <p className="mt-1 text-sm text-muted">
            퀴즈에서 틀린 문제가 여기에 모여요.
          </p>
          <Button className="mt-5" onClick={onGoQuiz}>
            퀴즈 풀러 가기
          </Button>
        </GlassCard>
      ) : (
        <>
          <Button
            className="min-h-14 w-full text-lg"
            onClick={() => onStart(items.map((item) => item.question))}
          >
            ❌ 오답 {items.length}문제 다시 풀기
          </Button>

          <div className="space-y-3">
            <div
              role="group"
              aria-label="시대 필터"
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <FilterChip
                active={activeEra === "all"}
                onClick={() => setEraFilter("all")}
              >
                전체 {items.length}
              </FilterChip>
              {erasInNote.map((era) => (
                <FilterChip
                  key={era}
                  active={activeEra === era}
                  onClick={() => setEraFilter(era)}
                >
                  {ERA_LABELS[era]}{" "}
                  {items.filter((item) => item.question.era === era).length}
                </FilterChip>
              ))}
            </div>

            <div role="group" aria-label="정렬" className="flex gap-1.5">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={sortKey === key}
                  onClick={() => setSortKey(key)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs transition ${
                    sortKey === key
                      ? "bg-surface font-semibold text-ink ring-1 ring-line"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {SORT_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          <motion.ul layout className="space-y-3">
            {visible.map((item) => (
              <motion.li key={item.question.id} layout="position">
                <WrongNoteCard
                  question={item.question}
                  stat={item.stat}
                  retention={item.retention}
                  now={now}
                  expanded={openId === item.question.id}
                  onToggle={() =>
                    setOpenId((id) =>
                      id === item.question.id ? null : item.question.id,
                    )
                  }
                  isMemorized={(tipId) => isTipMemorized(tipVotes, tipId)}
                  onToggleMemorized={toggleTipMemorized}
                />
              </motion.li>
            ))}
          </motion.ul>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  unit,
  tone,
  delay = 0,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  unit: string;
  tone: string;
  delay?: number;
}) {
  const shown = useCountUp(value, delay);
  return (
    <GlassCard className="flex flex-col gap-1 px-3 py-4 sm:p-5">
      <span className={tone}>{icon}</span>
      <p className="text-2xl font-bold tabular-nums sm:text-3xl">
        {shown}
        <span className="ml-0.5 text-xs font-medium text-muted">{unit}</span>
      </p>
      <p className="text-[11px] leading-tight text-muted sm:text-xs">{label}</p>
    </GlassCard>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition ${
        active
          ? "border-primary bg-primary/15 font-semibold text-primary"
          : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default WrongNoteList;
