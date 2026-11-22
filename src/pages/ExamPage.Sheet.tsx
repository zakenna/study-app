import { AlertTriangle, Pause, Play, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import { EXAM_MINUTES, type Exam } from "../data/exams";
import type { ExamAnswers } from "../lib/exam";
import { saveExamDraft } from "../lib/storage";
import ExamCbtBody from "./ExamPage.Cbt";
import type { PageTarget } from "./ExamPage.PdfViewer";

export type ExamMode = "omr" | "cbt";

/** 이어서 풀기: 임시 저장된 답안·남은 시간·다시 보기 */
export interface ExamResume {
  answers: ExamAnswers;
  remaining: number;
  flagged?: number[];
}

interface ExamSheetProps {
  exam: Exam;
  mode: ExamMode;
  resume?: ExamResume;
  onSubmit: (answers: ExamAnswers, durationSec: number) => void;
  onQuit: () => void;
}

const TOTAL_SEC = EXAM_MINUTES * 60;
const MARKS = ["①", "②", "③", "④", "⑤"];

const formatClock = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

type Dialog =
  | { kind: "submit"; blanks: number[]; flagged: number[] }
  | { kind: "quit" }
  | null;

/** 2단계: ⏱️ 80분 타이머 + 답안 (OMR만 / 문제지를 보며 푸는 CBT) */
function ExamSheet({ exam, mode, resume, onSubmit, onQuit }: ExamSheetProps) {
  const [answers, setAnswers] = useState<ExamAnswers>(() =>
    exam.questions.map((_, i) => resume?.answers[i] ?? 0),
  );
  const [flagged, setFlagged] = useState<number[]>(() =>
    (resume?.flagged ?? []).filter((no) =>
      exam.questions.some((q) => q.no === no),
    ),
  );
  const [remaining, setRemaining] = useState(() =>
    Math.min(TOTAL_SEC, Math.max(0, resume?.remaining ?? TOTAL_SEC)),
  );
  const [paused, setPaused] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  // CBT: 지금 보는 문항(index)과 문제지 이동 요청
  const [current, setCurrent] = useState(0);
  const [target, setTarget] = useState<PageTarget>({
    page: exam.questionPages?.[0] ?? 1,
    seq: 0,
  });
  const [mobileTab, setMobileTab] = useState<"paper" | "answer">("paper");
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

  // 답안·남은 시간·다시 보기가 바뀔 때마다 임시 저장 (다른 탭에 갔다 와도 이어서 응시). 제출·그만두기 때 상위에서 지운다
  useEffect(() => {
    saveExamDraft({
      examId: exam.id,
      answers,
      remaining,
      flagged,
      savedAt: Date.now(),
    });
  }, [exam.id, answers, remaining, flagged]);

  const mark = (index: number, choice: number) =>
    setAnswers((prev) =>
      prev.map((a, i) => (i === index ? (a === choice ? 0 : choice) : a)),
    );

  const toggleFlag = (no: number) =>
    setFlagged((prev) =>
      prev.includes(no)
        ? prev.filter((n) => n !== no)
        : [...prev, no].sort((a, b) => a - b),
    );

  const select = (index: number) => {
    const i = Math.min(exam.questions.length - 1, Math.max(0, index));
    setCurrent(i);
    setTarget((t) => ({ page: exam.questionPages?.[i] ?? 1, seq: t.seq + 1 }));
  };

  const trySubmit = () => {
    const blanks = answers.flatMap((a, i) =>
      a === 0 ? [exam.questions[i].no] : [],
    );
    if (blanks.length > 0 || flagged.length > 0)
      setDialog({ kind: "submit", blanks, flagged });
    else onSubmit(answers, TOTAL_SEC - remaining);
  };

  const jumpTo = (no: number) => {
    setDialog(null);
    if (mode === "cbt") {
      select(no - 1);
      setMobileTab("paper");
      return;
    }
    const row = rowRefs.current[no - 1];
    row?.scrollIntoView({ block: "center", behavior: "smooth" });
    row?.querySelector("button")?.focus({ preventScroll: true });
  };

  // CBT 키보드: ←/→ 문항 이동, 1~5 표시, F 다시 보기
  // (매 렌더 다시 등록해서 항상 최신 상태를 본다)
  useEffect(() => {
    if (mode !== "cbt" || paused || dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        select(current + (e.key === "ArrowLeft" ? -1 : 1));
      } else if (/^[1-5]$/.test(e.key)) {
        mark(current, Number(e.key));
      } else if (e.key === "f" || e.key === "F" || e.key === "ㄹ") {
        toggleFlag(exam.questions[current].no);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const pauseOverlay = (
    <AnimatePresence>
      {paused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 z-10 flex items-start justify-center rounded-2xl pt-24 ${
            mode === "cbt"
              ? "bg-canvas" // 문제지도 완전히 가린다
              : "bg-canvas/80 backdrop-blur-md"
          }`}
        >
          <div className="text-center">
            <p className="text-lg font-bold">일시정지 중</p>
            <p className="mt-1 text-sm text-muted">
              타이머가 멈췄어요.{" "}
              {mode === "cbt"
                ? "문제지와 답안도 잠시 가려요."
                : "표시도 잠시 막혀요."}
            </p>
            <Button className="mt-4" onClick={() => setPaused(false)}>
              <Play size={16} aria-hidden />
              이어서 풀기
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      className={
        mode === "cbt"
          ? // CBT는 데스크톱에서 본문 폭(3xl)을 넘어 화면을 넓게 쓴다 (사이드바 15rem + 여백 4rem 제외)
            "space-y-3 lg:mx-[calc(50%-min(640px,calc(50vw-9.5rem)))] lg:w-[min(1280px,calc(100vw-19rem))]"
          : "space-y-4"
      }
    >
      {/* 상단 고정: 회차 · 타이머 · 진행 */}
      <div
        className={`sticky top-[59px] z-20 -mx-4 space-y-2 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur-xl md:-mx-8 md:px-8 ${mode === "cbt" ? "lg:mx-0 lg:rounded-b-2xl lg:border-x lg:px-4" : ""}`}
      >
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
          {mode === "cbt" && <Badge tone="primary">CBT</Badge>}
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
            {flagged.length > 0 && ` · 🚩 ${flagged.length}`}
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

      {mode === "cbt" ? (
        <div className="relative">
          <ExamCbtBody
            exam={exam}
            answers={answers}
            flagged={flagged}
            current={current}
            target={target}
            disabled={paused}
            mobileTab={mobileTab}
            onMobileTab={setMobileTab}
            onSelect={select}
            onMark={(choice) => mark(current, choice)}
            onToggleFlag={() => toggleFlag(exam.questions[current].no)}
            onSubmit={trySubmit}
          />
          {pauseOverlay}
        </div>
      ) : (
        <>
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
            {pauseOverlay}
          </div>

          <Button
            className="min-h-12 w-full text-base"
            onClick={trySubmit}
            disabled={paused}
          >
            <Send size={18} aria-hidden />
            제출하고 채점하기
          </Button>
        </>
      )}

      <AnimatePresence>
        {dialog && (
          <ConfirmDialog onClose={() => setDialog(null)}>
            {dialog.kind === "submit" ? (
              <>
                <p className="text-lg font-bold">
                  {dialog.blanks.length > 0
                    ? `빈 문항이 ${dialog.blanks.length}개 있어요`
                    : "제출하기 전에 확인해 주세요"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  번호를 누르면 그 문항으로 이동해요.
                </p>
                {dialog.blanks.length > 0 && (
                  <NumberList
                    title="빈 문항"
                    numbers={dialog.blanks}
                    tone="danger"
                    onPick={jumpTo}
                  />
                )}
                {dialog.flagged.length > 0 && (
                  <NumberList
                    title={`🚩 다시 보기 ${dialog.flagged.length}개`}
                    numbers={dialog.flagged}
                    tone="accent"
                    onPick={jumpTo}
                  />
                )}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button variant="ghost" onClick={() => setDialog(null)}>
                    계속 풀기
                  </Button>
                  <Button
                    variant={dialog.blanks.length > 0 ? "danger" : "primary"}
                    onClick={() => onSubmit(answers, TOTAL_SEC - remaining)}
                  >
                    {dialog.blanks.length > 0 ? "그래도 제출" : "제출하기"}
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

function NumberList({
  title,
  numbers,
  tone,
  onPick,
}: {
  title: string;
  numbers: number[];
  tone: "danger" | "accent";
  onPick: (no: number) => void;
}) {
  return (
    <div className="mt-3">
      <p
        className={`text-xs font-semibold ${tone === "danger" ? "text-danger" : "text-accent"}`}
      >
        {title}
      </p>
      <div className="mt-1.5 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
        {numbers.map((no) => (
          <button
            key={no}
            type="button"
            onClick={() => onPick(no)}
            className={`min-w-9 rounded-lg border px-2 py-1 text-sm font-semibold tabular-nums ${
              tone === "danger"
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-accent/40 bg-accent/10 text-accent"
            }`}
          >
            {no}
          </button>
        ))}
      </div>
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
