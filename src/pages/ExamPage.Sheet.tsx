import { AlertTriangle, Pause, Play, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import { EXAM_MINUTES, type Exam } from "../data/exams";
import type { ExamAnswers } from "../lib/exam";
import { saveExamDraft } from "../lib/storage";

interface ExamSheetProps {
  exam: Exam;
  /** 이어서 풀기: 임시 저장된 답안과 남은 시간 */
  resume?: { answers: ExamAnswers; remaining: number };
  onSubmit: (answers: ExamAnswers, durationSec: number) => void;
  onQuit: () => void;
}

const TOTAL_SEC = EXAM_MINUTES * 60;
const MARKS = ["①", "②", "③", "④", "⑤"];

const formatClock = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

type Dialog = { kind: "submit"; blanks: number[] } | { kind: "quit" } | null;

/** 2단계: ⏱️ 80분 타이머 + OMR 50문항 */
function ExamSheet({ exam, resume, onSubmit, onQuit }: ExamSheetProps) {
  const [answers, setAnswers] = useState<ExamAnswers>(() =>
    exam.questions.map((_, i) => resume?.answers[i] ?? 0),
  );
  const [remaining, setRemaining] = useState(() =>
    Math.min(TOTAL_SEC, Math.max(0, resume?.remaining ?? TOTAL_SEC)),
  );
  const [paused, setPaused] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const marked = answers.filter((a) => a > 0).length;
  const timeUp = remaining <= 0;

  useEffect(() => {
    if (paused || timeUp || dialog) return;
    const id = window.setInterval(
      () => setRemaining((r) => Math.max(0, r - 1)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [paused, timeUp, dialog]);

  // 답안·남은 시간이 바뀔 때마다 임시 저장 (다른 탭에 갔다 와도 이어서 응시). 제출·그만두기 때 상위에서 지운다
  useEffect(() => {
    saveExamDraft({ examId: exam.id, answers, remaining, savedAt: Date.now() });
  }, [exam.id, answers, remaining]);

  const mark = (index: number, choice: number) =>
    setAnswers((prev) =>
      prev.map((a, i) => (i === index ? (a === choice ? 0 : choice) : a)),
    );

  const trySubmit = () => {
    const blanks = answers.flatMap((a, i) =>
      a === 0 ? [exam.questions[i].no] : [],
    );
    if (blanks.length > 0) setDialog({ kind: "submit", blanks });
    else onSubmit(answers, TOTAL_SEC - remaining);
  };

  const jumpTo = (no: number) => {
    setDialog(null);
    const row = rowRefs.current[no - 1];
    row?.scrollIntoView({ block: "center", behavior: "smooth" });
    row?.querySelector("button")?.focus({ preventScroll: true });
  };

  return (
    <div className="space-y-4">
      {/* 상단 고정: 회차 · 타이머 · 진행 */}
      <div className="sticky top-[59px] z-10 -mx-4 space-y-2 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              marked > 0 ? setDialog({ kind: "quit" }) : onQuit()
            }
            aria-label="응시 그만두기"
            className="rounded-lg p-1.5 text-muted transition hover:text-ink"
          >
            <X size={18} aria-hidden />
          </button>
          <p className="font-semibold">
            {exam.isSample ? "샘플 회차" : `제${exam.round}회`} 심화
          </p>
          {exam.isSample && <Badge tone="danger">샘플</Badge>}
          <div className="ml-auto flex items-center gap-1.5">
            <span
              role="timer"
              aria-label={`남은 시간 ${Math.floor(remaining / 60)}분 ${remaining % 60}초`}
              className={`text-xl font-bold tabular-nums ${timeUp || remaining < 300 ? "text-danger" : "text-ink"}`}
            >
              {formatClock(remaining)}
            </span>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              disabled={timeUp}
              aria-label={paused ? "타이머 다시 시작" : "타이머 일시정지"}
              className="rounded-lg border border-line p-1.5 text-muted transition hover:text-ink disabled:opacity-30"
            >
              {paused ? (
                <Play size={16} aria-hidden />
              ) : (
                <Pause size={16} aria-hidden />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ProgressBar
            value={marked}
            max={answers.length}
            label="표시한 문항"
            className="flex-1"
          />
          <span
            className="shrink-0 text-xs text-muted tabular-nums"
            aria-live="polite"
          >
            {marked}/{answers.length} 표시함
          </span>
        </div>
      </div>

      {timeUp && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger"
        >
          <AlertTriangle size={16} aria-hidden />
          시간이 끝났어요. 표시한 답으로 제출해 주세요.
        </p>
      )}

      {/* OMR */}
      <div className="relative">
        <div className="grid gap-x-8 rounded-2xl border border-line bg-surface p-3 sm:grid-cols-2 sm:p-5">
          {exam.questions.map((q, i) => (
            <div
              key={q.no}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              role="radiogroup"
              aria-label={`${q.no}번`}
              className={`flex items-center gap-2 py-1.5 ${q.no % 5 === 0 ? "border-b border-line pb-2.5" : ""} ${(q.no - 1) % 5 === 0 ? "pt-2.5" : ""}`}
            >
              <span
                className={`w-7 shrink-0 text-right text-sm font-bold tabular-nums ${answers[i] ? "text-ink" : "text-muted"}`}
              >
                {q.no}
              </span>
              <div className="flex flex-1 justify-between gap-1.5 sm:justify-start sm:gap-2">
                {MARKS.map((label, c) => {
                  const choice = c + 1;
                  const selected = answers[i] === choice;
                  return (
                    <motion.button
                      key={choice}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={`${q.no}번 ${choice}`}
                      disabled={paused}
                      onClick={() => mark(i, choice)}
                      whileTap={{ scale: 0.88 }}
                      className={`grid size-11 place-items-center rounded-full border text-base transition-colors sm:size-10 ${
                        selected
                          ? "border-primary bg-primary font-bold text-canvas"
                          : "border-line text-muted hover:border-primary/60 hover:text-ink"
                      }`}
                    >
                      {label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {paused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-start justify-center rounded-2xl bg-canvas/80 pt-24 backdrop-blur-md"
            >
              <div className="text-center">
                <p className="text-lg font-bold">일시정지 중</p>
                <p className="mt-1 text-sm text-muted">
                  타이머가 멈췄어요. 표시도 잠시 막혀요.
                </p>
                <Button className="mt-4" onClick={() => setPaused(false)}>
                  <Play size={16} aria-hidden />
                  이어서 풀기
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        className="min-h-12 w-full text-base"
        onClick={trySubmit}
        disabled={paused}
      >
        <Send size={18} aria-hidden />
        제출하고 채점하기
      </Button>

      <AnimatePresence>
        {dialog && (
          <ConfirmDialog onClose={() => setDialog(null)}>
            {dialog.kind === "submit" ? (
              <>
                <p className="text-lg font-bold">
                  빈 문항이 {dialog.blanks.length}개 있어요
                </p>
                <p className="mt-1 text-sm text-muted">
                  번호를 누르면 그 문항으로 이동해요.
                </p>
                <div className="mt-3 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
                  {dialog.blanks.map((no) => (
                    <button
                      key={no}
                      type="button"
                      onClick={() => jumpTo(no)}
                      className="min-w-9 rounded-lg border border-danger/40 bg-danger/10 px-2 py-1 text-sm font-semibold text-danger tabular-nums"
                    >
                      {no}
                    </button>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button variant="ghost" onClick={() => setDialog(null)}>
                    계속 풀기
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => onSubmit(answers, TOTAL_SEC - remaining)}
                  >
                    그래도 제출
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-lg font-bold">응시를 그만둘까요?</p>
                <p className="mt-1 text-sm text-muted">
                  표시한 {marked}문항은 저장되지 않아요.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button variant="ghost" onClick={() => setDialog(null)}>
                    계속 풀기
                  </Button>
                  <Button variant="danger" onClick={onQuit}>
                    그만두기
                  </Button>
                </div>
              </>
            )}
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </div>
  );
}

/** 확인 창 (Esc로 닫기) */
export function ConfirmDialog({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-canvas/70 p-4 backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="alertdialog"
        aria-modal="true"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-line bg-canvas/95 p-6 shadow-2xl shadow-black/40"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default ExamSheet;
