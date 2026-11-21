import { ArrowLeft, Check, RotateCcw, ScrollText, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Badge, { type BadgeTone } from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import { EXAM_SOURCE_LABEL, type Exam, type ExamEra } from "../data/exams";
import {
  weakestEra,
  type ExamAnswers,
  type ExamGrade,
  type ExamScore,
} from "../lib/exam";
import { ERAS, ERA_LABELS } from "../lib/labels";
import { useCountUp } from "../lib/useCountUp";
import type { Era } from "../types";

interface ExamResultViewProps {
  exam: Exam;
  answers: ExamAnswers;
  durationSec: number;
  result: ExamScore;
  isBest: boolean;
  onRetry: () => void;
  onBack: () => void;
  onGoQuiz: (era: Era) => void;
}

const GRADE_TONES: Record<ExamGrade, BadgeTone> = {
  "1급": "success",
  "2급": "primary",
  "3급": "accent",
  불합격: "danger",
};
const eraLabel = (era: ExamEra) =>
  era === "integrated" ? "통합·지역사" : ERA_LABELS[era];
const ERA_ORDER: ExamEra[] = [...ERAS, "integrated"];

/** 3단계: 점수·급수, 시대별 정답률, 문항별 채점 */
function ExamResultView({
  exam,
  answers,
  durationSec,
  result,
  isBest,
  onRetry,
  onBack,
  onGoQuiz,
}: ExamResultViewProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const shownScore = useCountUp(result.score);
  const weak = weakestEra(result.eraScores);
  const weakRate = weak
    ? (result.eraScores.find((s) => s.era === weak)?.rate ?? 0)
    : 0;
  const eraRows = [...result.eraScores].sort(
    (a, b) => ERA_ORDER.indexOf(a.era) - ERA_ORDER.indexOf(b.era),
  );
  const minutes = Math.floor(durationSec / 60);

  return (
    <div className="space-y-4">
      <GlassCard className="text-center">
        <p className="text-sm text-muted">
          {exam.isSample ? "샘플 회차 (가짜 정답)" : `제${exam.round}회 심화`}
        </p>
        <p className="mt-2 text-6xl font-black tabular-nums">
          {shownScore}
          <span className="text-xl font-medium text-muted">
            {" "}
            / {result.maxScore}
          </span>
        </p>
        <motion.div
          initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            bounce: 0.5,
            duration: 0.6,
            delay: 0.6,
          }}
          className="mt-3"
        >
          <Badge
            tone={GRADE_TONES[result.grade]}
            className="px-4 py-1 text-base"
          >
            {result.grade === "불합격" ? "불합격" : `${result.grade} 합격`}
          </Badge>
        </motion.div>
        <p className="mt-3 text-sm text-muted">
          {exam.questions.length}문항 중 {result.correctCount}문항 정답
          {result.blankCount > 0 && ` · 빈칸 ${result.blankCount}`} · {minutes}
          분 사용
        </p>
        {isBest && (
          <p className="mt-2 font-semibold text-accent">
            🏆 이 회차 최고 점수!
          </p>
        )}
        {exam.isSample && (
          <p className="mt-2 text-xs text-danger">
            샘플 회차라 점수는 화면 확인용이에요.
          </p>
        )}
      </GlassCard>

      {/* 시대별 정답률 */}
      <GlassCard>
        <h3 className="font-bold">📊 시대별 정답률</h3>
        <ul className="mt-4 space-y-2.5">
          {eraRows.map((row, i) => {
            const percent = Math.round(row.rate * 100);
            return (
              <li
                key={row.era}
                className="grid grid-cols-[5.5rem_1fr_4.5rem] items-center gap-2 sm:grid-cols-[7rem_1fr_5rem]"
                aria-label={`${eraLabel(row.era)}: ${row.total}문항 중 ${row.correct}문항 정답, ${percent}%`}
              >
                <span className="truncate text-xs sm:text-sm">
                  {eraLabel(row.era)}
                </span>
                <span className="relative h-2.5 overflow-hidden rounded-full bg-line">
                  <motion.span
                    className={`absolute inset-y-0 left-0 rounded-full ${row.era === weak ? "bg-danger" : "bg-primary"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.6, delay: 0.04 * i }}
                  />
                </span>
                <span className="text-right text-xs tabular-nums">
                  <span className="font-semibold">{percent}%</span>{" "}
                  <span className="text-muted">
                    {row.correct}/{row.total}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        {weak && (
          <Button className="mt-4 w-full" onClick={() => onGoQuiz(weak)}>
            <ScrollText size={16} aria-hidden />
            가장 약한 시대: {ERA_LABELS[weak]} ({Math.round(weakRate * 100)}%) →{" "}
            {ERA_LABELS[weak]} 퀴즈로
          </Button>
        )}
      </GlassCard>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden />
          회차 목록
        </Button>
        <Button variant="ghost" onClick={onRetry}>
          <RotateCcw size={16} aria-hidden />
          다시 응시
        </Button>
      </div>

      {/* 문항별 채점 */}
      <GlassCard>
        <h3 className="font-bold">문항별 채점</h3>
        <p className="mt-0.5 text-xs text-muted">
          틀린 문항은 정답 번호와 내 답을 함께 보여 줘요.
        </p>
        <ol className="mt-4 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {exam.questions.map((q, i) => {
            const correct = result.perQuestion[i];
            const mine = answers[i];
            return (
              <li
                key={q.no}
                aria-label={`${q.no}번 ${correct ? "정답" : `오답, 정답 ${q.answer}번, 내 답 ${mine ? `${mine}번` : "빈칸"}`}`}
                className={`flex flex-col items-center rounded-lg border px-1 py-1.5 text-center ${
                  correct
                    ? "border-success/40 bg-success/10"
                    : "border-danger/40 bg-danger/10"
                }`}
              >
                <span className="flex items-center gap-0.5 text-xs font-bold tabular-nums">
                  {q.no}
                  {correct ? (
                    <Check size={12} className="text-success" aria-hidden />
                  ) : (
                    <X size={12} className="text-danger" aria-hidden />
                  )}
                </span>
                {!correct && (
                  <span className="mt-0.5 text-[10px] leading-tight">
                    <span className="font-semibold text-success">
                      정답 {q.answer}
                    </span>
                    <br />
                    <span className="text-muted">
                      {mine ? `내 답 ${mine}` : "빈칸"}
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </GlassCard>

      <p className="text-center text-[11px] text-muted">{EXAM_SOURCE_LABEL}</p>
    </div>
  );
}

export default ExamResultView;
