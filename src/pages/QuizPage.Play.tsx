import { Check, Lightbulb, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Badge, { type BadgeTone } from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import ProgressBar from "../components/ui/ProgressBar";
import TipCard from "../components/ui/TipCard";
import { getTipById } from "../data/tips";
import { ERA_LABELS } from "../lib/labels";
import { isCorrectChoice, type QuestionSnapshot } from "../lib/quiz";
import {
  isTipMemorized,
  recordAnswer,
  toggleTipMemorized,
} from "../lib/storage";
import { useStudyData } from "../lib/useStudyData";
import type { Question } from "../types";

export interface AnswerRecord {
  question: Question;
  choice: number;
  isCorrect: boolean;
}

interface QuizPlayProps {
  quiz: Question[];
  /** 퀴즈 시작 시점의 문제 상태 (기억 확률, 복습 필요 여부) */
  snapshot: Record<string, QuestionSnapshot>;
  onFinish: (answers: AnswerRecord[], maxCombo: number) => void;
  onQuit: () => void;
}

const OPTION_MARKS = ["①", "②", "③", "④"];

function statusBadge(snap: QuestionSnapshot | undefined): {
  tone: BadgeTone;
  text: string;
} {
  if (!snap || snap.retention === null)
    return { tone: "primary", text: "새 문제" };
  // 방금 틀린 문제는 공식상 기억 확률이 100%로 나오므로, 오답노트 문제는 "복습 필요"로 표시
  if (snap.needsReview) return { tone: "danger", text: "복습 필요" };
  const p = snap.retention;
  const percent = Math.round(p * 100);
  const tone: BadgeTone = p < 0.5 ? "danger" : p < 0.8 ? "accent" : "success";
  return { tone, text: `기억 확률 ${percent}%` };
}

/** 2단계: 문제 풀기 */
function QuizPlay({ quiz, snapshot, onFinish, onQuit }: QuizPlayProps) {
  const { tipVotes } = useStudyData();
  const reduceMotion = useReducedMotion() ?? false;

  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isTipOpen, setIsTipOpen] = useState(false);

  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const question = quiz[index];
  const answered = choice !== null;
  const isCorrect = answered && isCorrectChoice(question, choice);
  const isLast = index === quiz.length - 1;
  const tip = question.tipId ? getTipById(question.tipId) : undefined;
  const badge = statusBadge(snapshot[question.id]);

  const choose = (selected: number) => {
    if (answered) return;
    const correct = isCorrectChoice(question, selected);
    setChoice(selected);
    recordAnswer(question.id, correct); // 헤더 🔥, 대시보드가 즉시 갱신됨 (studyapp:change)
    setAnswers((prev) => [
      ...prev,
      { question, choice: selected, isCorrect: correct },
    ]);
    if (correct) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((m) => Math.max(m, nextCombo));
      setIsTipOpen(false);
    } else {
      setCombo(0);
      setIsTipOpen(true); // 💡 오답이면 꿀팁이 바로 튀어나온다
    }
  };

  const goNext = () => {
    if (!answered) return;
    if (isLast) {
      onFinish(answers, maxCombo);
      return;
    }
    setIndex((i) => i + 1);
    setChoice(null);
    setIsTipOpen(false);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  // 키보드: 1~4 선택, Enter 다음
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      // 입력창·모달(프로필 수정)에서 누른 키는 무시. target이 window/document일 수도 있어 Element인지 확인
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("input, textarea, select, [role=dialog]")
      )
        return;

      if (!answered && ["1", "2", "3", "4"].includes(event.key)) {
        event.preventDefault();
        choose(Number(event.key) - 1);
      } else if (answered && event.key === "Enter") {
        event.preventDefault(); // 포커스된 버튼의 기본 클릭과 겹치지 않게
        goNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // 채점 후: 해설이 보이도록 스크롤하고, 다음 버튼에 포커스
  useEffect(() => {
    if (!answered) return;
    feedbackRef.current?.scrollIntoView({
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
    nextButtonRef.current?.focus({ preventScroll: true });
  }, [answered, reduceMotion]);

  return (
    <div className="space-y-4">
      {/* 상단: 진행 / 콤보 / 기억 확률 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums">
            {index + 1} / {quiz.length}
          </span>
          <ProgressBar
            value={index + (answered ? 1 : 0)}
            max={quiz.length}
            label="퀴즈 진행도"
            className="flex-1"
          />
          <button
            type="button"
            onClick={onQuit}
            aria-label="퀴즈 그만하기"
            className="rounded-lg p-1.5 text-muted transition hover:text-ink"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{ERA_LABELS[question.era]}</Badge>
          <Badge tone={badge.tone}>{badge.text}</Badge>
          <motion.span
            key={combo}
            initial={reduceMotion || combo === 0 ? false : { scale: 1.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="ml-auto"
          >
            <Badge tone={combo >= 2 ? "accent" : "muted"}>
              🔥 콤보 {combo}
            </Badge>
          </motion.span>
        </div>
      </div>

      {/* 문제 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={reduceMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="space-y-4"
        >
          <GlassCard>
            <h2 className="text-lg leading-relaxed font-semibold sm:text-xl">
              {question.question}
            </h2>
          </GlassCard>

          <div className="space-y-2.5" role="group" aria-label="보기">
            {question.options.map((option, i) => (
              <OptionButton
                key={i}
                index={i}
                text={option}
                state={
                  !answered
                    ? "idle"
                    : i === question.answer
                      ? "correct"
                      : i === choice
                        ? "wrong"
                        : "dimmed"
                }
                celebrate={isCorrect && i === question.answer}
                reduceMotion={reduceMotion}
                disabled={answered}
                onClick={() => choose(i)}
              />
            ))}
            {!answered && (
              <p className="hidden text-center text-xs text-muted sm:block">
                키보드 1~4로도 고를 수 있어요
              </p>
            )}
          </div>

          {/* 채점 결과 + 해설 + 꿀팁 */}
          {answered && (
            <div ref={feedbackRef} className="scroll-mb-28 space-y-3">
              <GlassCard
                className={`ring-1 ${isCorrect ? "ring-success/40" : "ring-danger/40"}`}
              >
                <p
                  className={`mb-1.5 font-bold ${isCorrect ? "text-success" : "text-danger"}`}
                >
                  {isCorrect
                    ? "정답이에요! 🎉"
                    : `아쉬워요 — 정답은 ${OPTION_MARKS[question.answer]} ${question.options[question.answer]}`}
                </p>
                <p className="text-sm leading-relaxed text-ink/90">
                  {question.explanation}
                </p>
              </GlassCard>

              {tip && !isTipOpen && (
                <Button
                  variant="ghost"
                  className="w-full text-accent"
                  onClick={() => setIsTipOpen(true)}
                >
                  <Lightbulb size={16} aria-hidden />
                  꿀팁 보기
                </Button>
              )}
              <AnimatePresence>
                {tip && isTipOpen && (
                  <TipCard
                    key={tip.id}
                    tip={tip}
                    memorized={isTipMemorized(tipVotes, tip.id)}
                    onToggleMemorized={toggleTipMemorized}
                  />
                )}
              </AnimatePresence>

              <Button
                ref={nextButtonRef}
                className="w-full text-base"
                onClick={goNext}
              >
                {isLast ? "결과 보기" : "다음 문제"}
                <kbd className="hidden rounded border border-canvas/30 px-1.5 text-xs font-normal sm:inline">
                  Enter
                </kbd>
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

type OptionState = "idle" | "correct" | "wrong" | "dimmed";

interface OptionButtonProps {
  index: number;
  text: string;
  state: OptionState;
  celebrate: boolean;
  reduceMotion: boolean;
  disabled: boolean;
  onClick: () => void;
}

const OPTION_CLASSES: Record<OptionState, string> = {
  idle: "border-line bg-surface hover:border-primary/60 hover:bg-primary/5",
  correct: "border-success bg-success/15",
  wrong: "border-danger bg-danger/15",
  dimmed: "border-line bg-surface opacity-45",
};

function OptionButton({
  index,
  text,
  state,
  celebrate,
  reduceMotion,
  disabled,
  onClick,
}: OptionButtonProps) {
  const animate =
    reduceMotion || state === "idle" || state === "dimmed"
      ? { x: 0, scale: 1 }
      : state === "wrong"
        ? { x: [0, -10, 10, -6, 6, 0], scale: 1 }
        : { x: 0, scale: [1, 1.03, 1] };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      animate={animate}
      transition={{ duration: state === "wrong" ? 0.4 : 0.3 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      aria-label={`${index + 1}번 보기: ${text}`}
      className={`relative flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-default ${OPTION_CLASSES[state]}`}
    >
      <span
        aria-hidden
        className={`grid size-7 shrink-0 place-items-center rounded-lg border text-sm font-semibold ${
          state === "correct"
            ? "border-success text-success"
            : state === "wrong"
              ? "border-danger text-danger"
              : "border-line text-muted"
        }`}
      >
        {index + 1}
      </span>
      <span className="flex-1 leading-snug">{text}</span>
      {state === "correct" && (
        <Check size={20} className="shrink-0 text-success" aria-hidden />
      )}
      {state === "wrong" && (
        <X size={20} className="shrink-0 text-danger" aria-hidden />
      )}
      {celebrate && !reduceMotion && <Burst />}
    </motion.button>
  );
}

const BURST_COLORS = ["bg-success", "bg-primary", "bg-accent"];
const BURST_COUNT = 14;

/** 정답 시 가벼운 축하 효과: 작은 점들이 사방으로 퍼졌다 사라진다 */
function Burst() {
  return (
    <span aria-hidden className="pointer-events-none absolute top-1/2 right-10">
      {Array.from({ length: BURST_COUNT }, (_, i) => {
        const angle = (i / BURST_COUNT) * Math.PI * 2;
        const distance = 34 + (i % 3) * 14;
        return (
          <motion.span
            key={i}
            className={`absolute size-1.5 rounded-full ${BURST_COLORS[i % BURST_COLORS.length]}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: 0,
              scale: 0.5,
            }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
        );
      })}
    </span>
  );
}

export default QuizPlay;
