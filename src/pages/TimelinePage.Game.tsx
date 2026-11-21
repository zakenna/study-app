import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  Play,
  RotateCcw,
  Settings2,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  Reorder,
  useDragControls,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import TipCard from "../components/ui/TipCard";
import { getTipById } from "../data/tips";
import { ERAS, ERA_LABELS, formatYear } from "../lib/labels";
import {
  isTipMemorized,
  saveTimelineBest,
  toggleTipMemorized,
} from "../lib/storage";
import { useStudyData } from "../lib/useStudyData";
import type { TimelineEvent } from "../types";
import {
  buildRound,
  eventsInScope,
  gradeOrder,
  ROUND_SIZES,
  sortByYear,
  type RoundSize,
  type Scope,
} from "./TimelinePage.helpers";

type Phase = "setup" | "play" | "checked";

/** 🎯 순서 맞추기: 설정 → 드래그(또는 ↑↓)로 정렬 → 확인(채점·연도 공개·정답 순서로 재배치) */
function TimelineGame() {
  const { tipVotes, timelineBest } = useStudyData();
  const reduceMotion = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<Phase>("setup");
  const [scope, setScope] = useState<Scope>("all");
  const [size, setSize] = useState<RoundSize>(4);
  const [items, setItems] = useState<TimelineEvent[]>([]);
  const [grades, setGrades] = useState<Record<string, boolean>>({});
  const [round, setRound] = useState(0);
  const [streak, setStreak] = useState(0);
  const [newRecord, setNewRecord] = useState(false);
  const sortTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(sortTimer.current), []);

  const poolSize = eventsInScope(scope).length;
  const effectiveSize = Math.min(size, poolSize) as RoundSize;

  const startRound = () => {
    window.clearTimeout(sortTimer.current);
    setItems(buildRound(scope, effectiveSize));
    setGrades({});
    setNewRecord(false);
    setRound((r) => r + 1);
    setPhase("play");
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  const check = () => {
    const result = gradeOrder(items);
    const allCorrect = Object.values(result).every(Boolean);
    setGrades(result);
    setPhase("checked");
    if (allCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setNewRecord(saveTimelineBest(nextStreak));
    } else {
      setStreak(0);
    }
    // 내가 놓은 자리에서 ✓/✗를 먼저 보여 준 뒤, 정답 순서로 카드가 움직인다
    sortTimer.current = window.setTimeout(
      () => setItems((current) => sortByYear(current)),
      reduceMotion ? 0 : 700,
    );
  };

  const correctCount = Object.values(grades).filter(Boolean).length;
  const allCorrect = phase === "checked" && correctCount === items.length;
  const wrongWithTips = items.filter((e) => grades[e.id] === false && e.tipId);

  if (phase === "setup") {
    return (
      <GlassCard className="space-y-5">
        <div>
          <p className="font-semibold">범위</p>
          <div
            role="group"
            aria-label="범위"
            className="mt-2 flex flex-wrap gap-2"
          >
            <Chip active={scope === "all"} onClick={() => setScope("all")}>
              전체 시대
            </Chip>
            {ERAS.map((era) => {
              const count = eventsInScope(era).length;
              return (
                <Chip
                  key={era}
                  active={scope === era}
                  disabled={count < ROUND_SIZES[0]}
                  onClick={() => setScope(era)}
                >
                  {ERA_LABELS[era]} <span className="opacity-60">{count}</span>
                </Chip>
              );
            })}
          </div>
        </div>

        <div>
          <p className="font-semibold">난이도 (카드 수)</p>
          <div
            role="group"
            aria-label="카드 수"
            className="mt-2 grid grid-cols-3 gap-2"
          >
            {ROUND_SIZES.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={effectiveSize === n}
                disabled={n > poolSize}
                onClick={() => setSize(n)}
                className={`rounded-xl border py-2.5 text-sm transition disabled:opacity-35 ${
                  effectiveSize === n
                    ? "border-primary bg-primary/15 font-semibold text-primary"
                    : "border-line bg-surface text-muted hover:text-ink"
                }`}
              >
                {n}장
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted">
          🏆 최고 기록{" "}
          <span className="font-semibold text-ink">{timelineBest}라운드</span>{" "}
          연속 성공
        </p>

        <Button className="min-h-12 w-full text-base" onClick={startRound}>
          <Play size={18} aria-hidden />
          시작하기
        </Button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge tone="primary">라운드 {round}</Badge>
        <Badge tone={streak > 0 ? "accent" : "muted"}>🔥 연속 {streak}</Badge>
        <Badge>🏆 최고 {timelineBest}</Badge>
        <span className="ml-auto text-xs text-muted">
          {scope === "all" ? "전체 시대" : ERA_LABELS[scope]} · {items.length}장
        </span>
      </div>

      <p className="text-sm text-muted">
        {phase === "play"
          ? "오래된 사건이 위로 오도록 순서를 맞춰 보세요. ⠿를 끌거나 ↑↓ 버튼을 쓰세요."
          : "정답 순서예요. 연도를 함께 확인해 보세요."}
      </p>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={setItems}
        className="space-y-2"
        aria-label="사건 목록 (위가 오래된 순서)"
      >
        {items.map((event, index) => (
          <TimelineCard
            key={event.id}
            event={event}
            index={index}
            total={items.length}
            locked={phase === "checked"}
            correct={grades[event.id]}
            onMove={move}
          />
        ))}
      </Reorder.Group>

      {phase === "play" ? (
        <Button className="min-h-12 w-full text-base" onClick={check}>
          <Check size={18} aria-hidden />
          확인
        </Button>
      ) : (
        <div className="space-y-4">
          <motion.div
            role="status"
            initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.45, duration: 0.5 }}
            className={`rounded-2xl border p-4 text-center ${
              allCorrect
                ? "border-success/40 bg-success/10"
                : "border-line bg-surface"
            }`}
          >
            <p
              className={`text-lg font-bold ${allCorrect ? "text-success" : "text-ink"}`}
            >
              {allCorrect
                ? `완벽해요! 🎉 연속 ${streak}라운드`
                : `${items.length}장 중 ${correctCount}장 맞았어요`}
            </p>
            {newRecord && (
              <p className="mt-1 text-sm font-semibold text-accent">
                🏆 최고 기록 경신!
              </p>
            )}
            {!allCorrect && (
              <p className="mt-1 text-xs text-muted">
                연속 기록이 0으로 돌아갔어요
              </p>
            )}
          </motion.div>

          {wrongWithTips.length > 0 && (
            <section aria-label="틀린 사건의 꿀팁" className="space-y-2">
              <p className="text-sm font-semibold text-muted">틀린 사건 꿀팁</p>
              {wrongWithTips.map((event) => {
                const tip = event.tipId ? getTipById(event.tipId) : undefined;
                return tip ? (
                  <TipCard
                    key={event.id}
                    tip={tip}
                    memorized={isTipMemorized(tipVotes, tip.id)}
                    onToggleMemorized={toggleTipMemorized}
                  />
                ) : null;
              })}
            </section>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => setPhase("setup")}>
              <Settings2 size={16} aria-hidden />
              설정 바꾸기
            </Button>
            <Button onClick={startRound}>
              <RotateCcw size={16} aria-hidden />
              다음 라운드
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface TimelineCardProps {
  event: TimelineEvent;
  index: number;
  total: number;
  locked: boolean;
  correct: boolean | undefined;
  onMove: (index: number, delta: -1 | 1) => void;
}

/** 사건 카드: ⠿ 손잡이로만 드래그(나머지 영역은 페이지 스크롤), ↑↓ 버튼은 키보드·스크린리더용 */
function TimelineCard({
  event,
  index,
  total,
  locked,
  correct,
  onMove,
}: TimelineCardProps) {
  const controls = useDragControls();
  const tone =
    correct === undefined
      ? "border-line bg-surface"
      : correct
        ? "border-success/60 bg-success/10"
        : "border-danger/60 bg-danger/10";

  return (
    <Reorder.Item
      value={event}
      dragListener={false}
      dragControls={controls}
      whileDrag={{
        scale: 1.03,
        boxShadow: "0 12px 30px rgb(0 0 0 / 0.35)",
        zIndex: 10,
      }}
      className="relative list-none"
    >
      <div
        className={`flex items-center gap-2 rounded-xl border p-3 backdrop-blur-xl transition-colors ${tone}`}
      >
        {!locked && (
          <button
            type="button"
            aria-label={`${event.title} 끌어서 옮기기`}
            onPointerDown={(e) => controls.start(e)}
            className="shrink-0 cursor-grab touch-none rounded-md p-1.5 text-muted hover:text-ink active:cursor-grabbing"
          >
            <GripVertical size={18} aria-hidden />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <p className="leading-snug font-medium">{event.title}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge className="px-1.5 py-0 text-[10px]">
              {ERA_LABELS[event.era]}
            </Badge>
            <AnimatePresence>
              {locked && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-bold text-primary tabular-nums"
                >
                  {formatYear(event.year)}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {locked ? (
          <StatusIcon correct={correct} />
        ) : (
          <div className="flex shrink-0 flex-col">
            <IconButton
              label={`${event.title} 위로`}
              disabled={index === 0}
              onClick={() => onMove(index, -1)}
            >
              <ArrowUp size={16} aria-hidden />
            </IconButton>
            <IconButton
              label={`${event.title} 아래로`}
              disabled={index === total - 1}
              onClick={() => onMove(index, 1)}
            >
              <ArrowDown size={16} aria-hidden />
            </IconButton>
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}

function StatusIcon({ correct }: { correct: boolean | undefined }) {
  if (correct === undefined) return null;
  return correct ? (
    <span
      className="grid size-8 shrink-0 place-items-center rounded-full bg-success/20 text-success"
      aria-label="맞은 자리"
    >
      <Check size={18} aria-hidden />
    </span>
  ) : (
    <span
      className="grid size-8 shrink-0 place-items-center rounded-full bg-danger/20 text-danger"
      aria-label="틀린 자리"
    >
      <X size={18} aria-hidden />
    </span>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-md p-1 text-muted transition hover:text-ink disabled:opacity-25"
    >
      {children}
    </button>
  );
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition disabled:opacity-35 ${
        active
          ? "border-primary bg-primary/15 font-semibold text-primary"
          : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default TimelineGame;
