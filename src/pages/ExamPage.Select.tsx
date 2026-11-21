import {
  ExternalLink,
  FileQuestion,
  PencilLine,
  RotateCcw,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import {
  EXAM_BOARD_URL,
  EXAM_MINUTES,
  EXAM_QUESTION_COUNT,
  EXAM_SOURCE_LABEL,
  exams,
  type Exam,
} from "../data/exams";
import { gradeFor, type ExamAnswers } from "../lib/exam";
import { getExamDraft, type ExamDraft } from "../lib/storage";
import { useStudyData } from "../lib/useStudyData";
import { ConfirmDialog } from "./ExamPage.Sheet";

const formatDate = (key: string) => {
  const [y, m, d] = key.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
};

/** 1단계: 회차 선택 (공식 기출 문제지는 링크로만 안내) */
const formatClock = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

interface ExamSelectProps {
  onStart: (
    exam: Exam,
    resume?: { answers: ExamAnswers; remaining: number },
  ) => void;
}

function ExamSelect({ onStart }: ExamSelectProps) {
  const { examResults } = useStudyData();
  // 화면에 들어올 때 한 번 읽는다 (sessionStorage 임시 저장)
  const [draft] = useState<ExamDraft | null>(() => getExamDraft());
  const [choiceFor, setChoiceFor] = useState<Exam | null>(null);

  const handleStart = (exam: Exam) => {
    if (draft && draft.examId === exam.id) setChoiceFor(exam);
    else onStart(exam);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">기출 채점</h2>
        <p className="mt-1 text-sm text-muted">
          공식 기출 문제지를 펴 놓고, 여기 OMR에 답을 표시하면 바로 채점해
          드려요.
        </p>
      </div>

      <GlassCard className="flex items-start gap-3 text-sm">
        <FileQuestion
          size={20}
          className="mt-0.5 shrink-0 text-accent"
          aria-hidden
        />
        <p className="text-muted">
          문제지는 국사편찬위원회 <span className="text-ink">시험 자료실</span>
          에서 내려받아 보세요. 이 앱에는 문제 원문이 없고, 정답·배점만으로
          채점해요.
        </p>
      </GlassCard>

      {exams.length === 0 ? (
        <GlassCard className="py-10 text-center">
          <p className="font-semibold">아직 등록된 회차가 없어요</p>
          <p className="mt-1 text-sm text-muted">
            공식 정답이 확인되는 대로 추가할게요.
          </p>
        </GlassCard>
      ) : (
        <ul className="space-y-3">
          {exams.map((exam) => {
            const mine = examResults.filter((r) => r.examId === exam.id);
            const best =
              mine.length > 0 ? Math.max(...mine.map((r) => r.score)) : null;
            return (
              <li key={exam.id}>
                <GlassCard className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold">
                        {exam.isSample ? "샘플 회차" : `제${exam.round}회`}{" "}
                        <span className="text-sm font-medium text-muted">
                          심화
                        </span>
                      </p>
                      <p className="text-xs text-muted">
                        {exam.isSample
                          ? "개발 확인용 · 가짜 정답"
                          : `시행일 ${formatDate(exam.date)}`}{" "}
                        · {EXAM_QUESTION_COUNT}문항 · {EXAM_MINUTES}분
                      </p>
                    </div>
                    {exam.isSample && <Badge tone="danger">샘플</Badge>}
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-canvas/40 px-3 py-2 text-sm">
                    <span className="text-muted">내 최고 점수</span>
                    {best === null ? (
                      <span className="text-muted">아직 응시 전</span>
                    ) : (
                      <span className="font-semibold tabular-nums">
                        {best}점 · {gradeFor(best)}{" "}
                        <span className="text-xs font-normal text-muted">
                          ({mine.length}회 응시)
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <a
                      href={EXAM_BOARD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink transition hover:border-primary/60"
                    >
                      공식 기출 PDF 열기
                      <ExternalLink size={14} aria-hidden />
                      <span className="sr-only">
                        (새 창, 국사편찬위원회 시험 자료실)
                      </span>
                    </a>
                    <Button onClick={() => handleStart(exam)}>
                      <PencilLine size={16} aria-hidden />
                      {draft?.examId === exam.id
                        ? "OMR 이어서 응시"
                        : "OMR 응시하기"}
                    </Button>
                  </div>
                </GlassCard>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-center text-[11px] text-muted">{EXAM_SOURCE_LABEL}</p>

      <AnimatePresence>
        {choiceFor && draft && (
          <ConfirmDialog onClose={() => setChoiceFor(null)}>
            <p className="text-lg font-bold">풀던 답안이 있어요</p>
            <p className="mt-1 text-sm text-muted">
              {draft.answers.filter((a) => a > 0).length}문항 표시 · 남은 시간{" "}
              {formatClock(Math.max(0, Math.round(draft.remaining)))}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => onStart(choiceFor)}>
                <RotateCcw size={16} aria-hidden />
                새로 시작
              </Button>
              <Button
                onClick={() =>
                  onStart(choiceFor, {
                    answers: draft.answers,
                    remaining: draft.remaining,
                  })
                }
              >
                <PencilLine size={16} aria-hidden />
                이어서 풀기
              </Button>
            </div>
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExamSelect;
