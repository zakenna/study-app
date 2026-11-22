import { ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";
import { motion } from "motion/react";
import { useRef, type ReactNode, type TouchEvent } from "react";
import Button from "../components/ui/Button";
import type { Exam } from "../data/exams";
import type { ExamAnswers } from "../lib/exam";
import PdfViewer, { type PageTarget } from "./ExamPage.PdfViewer";

const MARKS = ["①", "②", "③", "④", "⑤"];

interface ExamCbtBodyProps {
  exam: Exam;
  answers: ExamAnswers;
  flagged: number[];
  current: number; // 지금 문항 index
  target: PageTarget;
  disabled: boolean; // 일시정지
  mobileTab: "paper" | "answer";
  onMobileTab: (tab: "paper" | "answer") => void;
  onSelect: (index: number) => void;
  onMark: (choice: number) => void;
  onToggleFlag: () => void;
  onSubmit: () => void;
}

/** CBT: 왼쪽 문제지(60%) | 오른쪽 답안(40%). 모바일은 "문제지 | 답안" 탭 + 스와이프 */
function ExamCbtBody(props: ExamCbtBodyProps) {
  const { exam, current, target, mobileTab, onMobileTab } = props;
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  // 답안 탭에서 오른쪽으로 밀면 문제지로
  const onTouchStart = (e: TouchEvent) => {
    swipeStart.current =
      e.touches.length === 1
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const s = swipeStart.current;
    swipeStart.current = null;
    if (!s || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - s.x;
    const dy = e.changedTouches[0].clientY - s.y;
    if (dx > 70 && Math.abs(dy) < 50) onMobileTab("paper");
  };

  const q = exam.questions[current];

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-4">
      {/* 모바일 탭 */}
      <div
        role="tablist"
        aria-label="응시 화면"
        className="mb-3 grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1 lg:hidden"
      >
        {(
          [
            ["paper", "문제지"],
            ["answer", "답안"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`cbt-tab-${id}`}
            aria-selected={mobileTab === id}
            aria-controls={`cbt-panel-${id}`}
            onClick={() => onMobileTab(id)}
            className={`relative min-h-9 rounded-lg text-sm transition ${
              mobileTab === id ? "font-semibold text-canvas" : "text-muted"
            }`}
          >
            {mobileTab === id && (
              <motion.span
                layoutId="cbt-tab"
                className="absolute inset-0 -z-0 rounded-lg bg-primary"
                transition={{ duration: 0.2 }}
              />
            )}
            <span className="relative">
              {label}
              {id === "answer" && (
                <span className="ml-1 text-xs tabular-nums opacity-80">
                  {props.answers.filter((a) => a > 0).length}/
                  {props.answers.length}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* 문제지 */}
      <section
        id="cbt-panel-paper"
        aria-labelledby="cbt-tab-paper"
        className={`min-w-0 ${mobileTab === "paper" ? "" : "hidden lg:block"}`}
      >
        <PdfViewer
          examId={exam.id}
          target={target}
          onSwipe={(dir) => dir === "left" && onMobileTab("answer")}
          className="h-[calc(100svh-23.5rem)] min-h-80 lg:h-[calc(100svh-13.5rem)]"
        />
        <MiniAnswerBar {...props} q={q} />
      </section>

      {/* 답안 */}
      <section
        id="cbt-panel-answer"
        aria-labelledby="cbt-tab-answer"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`min-w-0 ${mobileTab === "answer" ? "" : "hidden lg:block"} lg:h-[calc(100svh-13.5rem)] lg:overflow-y-auto`}
      >
        <AnswerPanel {...props} q={q} />
      </section>
    </div>
  );
}

type PanelProps = ExamCbtBodyProps & { q: Exam["questions"][number] };

/** 모바일 문제지 탭 아래: 현재 문항 ①~⑤ */
function MiniAnswerBar({
  exam,
  answers,
  flagged,
  current,
  disabled,
  onSelect,
  onMark,
  onToggleFlag,
  q,
}: PanelProps) {
  const isFlagged = flagged.includes(q.no);
  return (
    <div className="mt-2 flex items-center justify-between gap-1 rounded-2xl border border-line bg-surface px-1.5 py-1.5 lg:hidden">
      <IconButton
        label="이전 문항"
        onClick={() => onSelect(current - 1)}
        disabled={disabled || current === 0}
      >
        <ChevronLeft size={18} aria-hidden />
      </IconButton>
      <span className="w-8 shrink-0 text-center text-sm font-bold tabular-nums">
        {q.no}
        <span className="sr-only">번 문항</span>
      </span>
      <div
        role="radiogroup"
        aria-label={`${q.no}번`}
        className="flex flex-1 justify-between gap-1"
      >
        {MARKS.map((label, c) => (
          <Choice
            key={c}
            no={q.no}
            choice={c + 1}
            label={label}
            selected={answers[current] === c + 1}
            disabled={disabled}
            onClick={() => onMark(c + 1)}
            size="sm"
          />
        ))}
      </div>
      <IconButton
        label={isFlagged ? "다시 보기 해제" : "다시 보기 표시"}
        pressed={isFlagged}
        onClick={onToggleFlag}
        disabled={disabled}
      >
        <Flag
          size={16}
          aria-hidden
          className={isFlagged ? "fill-current text-accent" : ""}
        />
      </IconButton>
      <IconButton
        label="다음 문항"
        onClick={() => onSelect(current + 1)}
        disabled={disabled || current === exam.questions.length - 1}
      >
        <ChevronRight size={18} aria-hidden />
      </IconButton>
    </div>
  );
}

/** 답안 패널: 현재 문항 크게 + 번호판 50칸 */
function AnswerPanel({
  exam,
  answers,
  flagged,
  current,
  disabled,
  onSelect,
  onMark,
  onToggleFlag,
  onSubmit,
  q,
}: PanelProps) {
  const isFlagged = flagged.includes(q.no);
  const page = exam.questionPages?.[current];
  return (
    <div className="space-y-3">
      {/* 현재 문항 */}
      <div className="hanji rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tabular-nums">{q.no}번</p>
          <p className="text-xs text-muted">
            배점 {q.points}점{page ? ` · 문제지 ${page}쪽` : ""}
          </p>
          <button
            type="button"
            aria-pressed={isFlagged}
            onClick={onToggleFlag}
            disabled={disabled}
            className={`ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-sm transition disabled:opacity-40 ${
              isFlagged
                ? "border-accent/60 bg-accent/10 font-semibold text-accent"
                : "border-line text-muted hover:text-ink"
            }`}
          >
            <Flag
              size={14}
              aria-hidden
              className={isFlagged ? "fill-current" : ""}
            />
            다시 보기
          </button>
        </div>
        <div
          role="radiogroup"
          aria-label={`${q.no}번`}
          className="mt-4 flex justify-between gap-2"
        >
          {MARKS.map((label, c) => (
            <Choice
              key={c}
              no={q.no}
              choice={c + 1}
              label={label}
              selected={answers[current] === c + 1}
              disabled={disabled}
              onClick={() => onMark(c + 1)}
              size="lg"
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            onClick={() => onSelect(current - 1)}
            disabled={disabled || current === 0}
          >
            <ChevronLeft size={16} aria-hidden />
            이전 문항
          </Button>
          <Button
            variant="ghost"
            onClick={() => onSelect(current + 1)}
            disabled={disabled || current === exam.questions.length - 1}
          >
            다음 문항
            <ChevronRight size={16} aria-hidden />
          </Button>
        </div>
        <p className="mt-2 hidden text-center text-[11px] text-muted lg:block">
          키보드: ← → 문항 이동 · 1~5 표시 · F 다시 보기
        </p>
      </div>

      {/* 번호판 */}
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold">답안 번호판</h3>
          <ul className="flex gap-3 text-[11px] text-muted" aria-hidden>
            <li className="flex items-center gap-1">
              <span className="size-3 rounded-sm border border-primary/60 bg-primary/20" />
              표시함
            </li>
            <li className="flex items-center gap-1">
              <span className="size-3 rounded-sm border border-line" />안 함
            </li>
            <li className="flex items-center gap-1">
              <Flag size={11} className="fill-current text-accent" />
              다시 보기
            </li>
          </ul>
        </div>
        <ol aria-label="답안 번호판" className="mt-3 grid grid-cols-10 gap-1">
          {exam.questions.map((item, i) => {
            const a = answers[i];
            const f = flagged.includes(item.no);
            const isCurrent = i === current;
            return (
              <li key={item.no}>
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  disabled={disabled}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${item.no}번 문항으로 이동, ${a ? `${a}번 표시함` : "안 함"}${f ? ", 다시 보기" : ""}`}
                  className={`relative flex h-11 w-full flex-col items-center justify-center rounded-md border text-xs leading-none tabular-nums transition ${
                    a
                      ? "border-primary/60 bg-primary/15 font-semibold text-ink"
                      : "border-line bg-canvas/40 text-muted"
                  } ${isCurrent ? "outline-2 outline-offset-1 outline-ink" : ""}`}
                >
                  {item.no}
                  <span className="mt-0.5 h-3 text-[10px] text-primary">
                    {a ? MARKS[a - 1] : ""}
                  </span>
                  {f && (
                    <Flag
                      size={9}
                      aria-hidden
                      className="absolute top-0.5 right-0.5 fill-current text-accent"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <Button
        className="min-h-12 w-full text-base"
        onClick={onSubmit}
        disabled={disabled}
      >
        <Send size={18} aria-hidden />
        제출하고 채점하기
      </Button>
    </div>
  );
}

function Choice({
  no,
  choice,
  label,
  selected,
  disabled,
  onClick,
  size,
}: {
  no: number;
  choice: number;
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  size: "sm" | "lg";
}) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${no}번 ${choice}`}
      disabled={disabled}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className={`grid shrink-0 place-items-center rounded-full border transition-colors ${
        size === "lg" ? "size-13 text-xl" : "size-9 text-base"
      } ${
        selected
          ? "border-primary bg-primary font-bold text-canvas"
          : "border-line text-muted hover:border-primary/60 hover:text-ink"
      }`}
    >
      {label}
    </motion.button>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      disabled={disabled}
      className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export default ExamCbtBody;
