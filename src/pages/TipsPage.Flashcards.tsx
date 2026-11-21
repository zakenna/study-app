import { ArrowLeft, Check, RotateCcw, RotateCw, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import ProgressBar from "../components/ui/ProgressBar";
import { tips } from "../data/tips";
import { ERA_LABELS, TIP_KIND_LABELS } from "../lib/labels";
import { shuffle } from "../lib/quiz";
import {
  getTipVotes,
  isTipMemorized,
  toggleTipMemorized,
} from "../lib/storage";
import { useStudyData } from "../lib/useStudyData";
import type { Tip, TipVote } from "../types";
import { flashCardFor } from "./TipsPage.helpers";

interface TipsFlashcardsProps {
  onExit: () => void;
}

/** 아직 못 외운 꿀팁 중 카드로 만들 수 있는 것만, 섞어서 */
function buildDeck(votes: TipVote[]): Tip[] {
  return shuffle(
    tips.filter(
      (t) => !isTipMemorized(votes, t.id) && flashCardFor(t) !== null,
    ),
  );
}

/** 🎴 암기 카드 모드: 앞면 질문 → 뒤집어 꿀팁·정답 확인 → 외웠어요 / 다시 볼래요 */
function TipsFlashcards({ onExit }: TipsFlashcardsProps) {
  const { tipVotes } = useStudyData();
  const reduceMotion = useReducedMotion() ?? false;
  const [deck, setDeck] = useState<Tip[]>(() => buildDeck(tipVotes));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [knownIds, setKnownIds] = useState<string[]>([]);
  const [again, setAgain] = useState<Tip[]>([]);

  const tip = deck[index];
  const card = tip ? flashCardFor(tip) : null;
  const done = index >= deck.length;

  const flip = () => setFlipped((f) => !f);

  const answer = (knew: boolean) => {
    if (!tip || !flipped) return;
    if (knew) {
      // 클릭 처리 안에서 최신 값을 읽어, 이미 외움 상태면 토글로 취소되지 않게 한다
      if (!isTipMemorized(getTipVotes(), tip.id)) toggleTipMemorized(tip.id);
      setKnownIds((ids) => [...ids, tip.id]);
    } else {
      setAgain((list) => [...list, tip]);
    }
    setDirection(knew ? 1 : -1);
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  const restartWith = (next: Tip[]) => {
    setDeck(shuffle(next));
    setIndex(0);
    setFlipped(false);
    setKnownIds([]);
    setAgain([]);
  };

  // 키보드: Space/Enter 뒤집기, → 외웠어요, ← 다시 볼래요
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (done || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("input, textarea, select, [role=dialog]")
      )
        return;
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        flip();
      } else if (event.key === "ArrowRight" && flipped) {
        event.preventDefault();
        answer(true);
      } else if (event.key === "ArrowLeft" && flipped) {
        event.preventDefault();
        answer(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExit}
          aria-label="암기 카드 그만하기"
          className="rounded-lg p-1.5 text-muted transition hover:text-ink"
        >
          <X size={18} aria-hidden />
        </button>
        <h2 className="text-lg font-bold">🎴 암기 카드</h2>
        {!done && (
          <span className="ml-auto text-sm font-semibold tabular-nums">
            {index + 1} / {deck.length}
          </span>
        )}
      </div>
      {!done && (
        <ProgressBar
          value={index}
          max={deck.length}
          tone="accent"
          label="암기 카드 진행도"
        />
      )}

      {deck.length === 0 ? (
        <GlassCard className="py-10 text-center">
          <p className="text-4xl" aria-hidden>
            🎉
          </p>
          <p className="mt-3 font-bold">아직 못 외운 꿀팁이 없어요</p>
          <Button variant="ghost" className="mt-4" onClick={onExit}>
            <ArrowLeft size={16} aria-hidden />
            목록으로
          </Button>
        </GlassCard>
      ) : done ? (
        <Summary
          known={knownIds.length}
          again={again.length}
          onRetryAgain={() => restartWith(again)}
          onExit={onExit}
        />
      ) : (
        tip &&
        card && (
          <>
            <div className="relative h-80" style={{ perspective: 1200 }}>
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={tip.id}
                  custom={direction}
                  variants={{
                    enter: { opacity: 0, y: 16, scale: 0.96 },
                    center: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
                    exit: (dir: 1 | -1) =>
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, x: dir * 320, rotate: dir * 10 },
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <motion.button
                    type="button"
                    onClick={flip}
                    aria-label={flipped ? "카드 앞면 보기" : "카드 뒤집기"}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 260, damping: 24 }
                    }
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative block size-full text-left"
                  >
                    {/* 앞면 */}
                    <CardFace>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{ERA_LABELS[tip.era]}</Badge>
                        <Badge tone="accent">{TIP_KIND_LABELS[tip.kind]}</Badge>
                      </div>
                      <p className="my-auto text-center text-xl leading-relaxed font-bold sm:text-2xl">
                        {card.prompt}
                      </p>
                      <p className="text-center text-xs text-muted">
                        <RotateCw
                          size={12}
                          className="mr-1 inline"
                          aria-hidden
                        />
                        탭하거나 스페이스로 뒤집기
                      </p>
                    </CardFace>

                    {/* 뒷면 */}
                    <CardFace back>
                      <p className="text-xs text-muted">정답</p>
                      <p className="text-2xl font-black text-success sm:text-3xl">
                        {card.answer}
                      </p>
                      <div className="my-auto rounded-xl border border-accent/40 bg-accent/10 p-4">
                        <p className="mb-1 text-xs font-semibold text-accent">
                          💡 암기 꿀팁
                        </p>
                        <p className="leading-relaxed font-medium">
                          {tip.text}
                        </p>
                      </div>
                    </CardFace>
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            </div>

            {flipped ? (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={() => answer(false)}>
                  <RotateCcw size={16} aria-hidden />
                  다시 볼래요
                  <kbd className="hidden text-xs text-muted sm:inline">←</kbd>
                </Button>
                <Button onClick={() => answer(true)}>
                  <Check size={16} aria-hidden />
                  외웠어요
                  <kbd className="hidden text-xs sm:inline">→</kbd>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" className="w-full" onClick={flip}>
                <RotateCw size={16} aria-hidden />
                뒤집어서 정답 보기
                <kbd className="hidden text-xs text-muted sm:inline">Space</kbd>
              </Button>
            )}
          </>
        )
      )}
    </div>
  );
}

/** 카드 한 면 (뒷면은 180도 돌려 둔다) */
function CardFace({
  back = false,
  children,
}: {
  back?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
      }}
      className={`absolute inset-0 flex flex-col gap-3 rounded-2xl border p-6 shadow-xl shadow-black/30 backdrop-blur-xl ${
        back ? "border-success/40 bg-surface" : "border-line bg-surface"
      }`}
    >
      {children}
    </div>
  );
}

function Summary({
  known,
  again,
  onRetryAgain,
  onExit,
}: {
  known: number;
  again: number;
  onRetryAgain: () => void;
  onExit: () => void;
}) {
  return (
    <GlassCard className="space-y-5 text-center">
      <motion.p
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.45, duration: 0.5 }}
        className="text-lg font-bold"
      >
        {again === 0 ? "모두 외웠어요! 🎉" : "한 바퀴 끝! 👏"}
      </motion.p>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-canvas/40 p-3">
          <p className="text-3xl font-bold text-success tabular-nums">
            {known}
          </p>
          <p className="text-xs text-muted">외운 꿀팁</p>
        </div>
        <div className="rounded-xl border border-line bg-canvas/40 p-3">
          <p className="text-3xl font-bold text-accent tabular-nums">{again}</p>
          <p className="text-xs text-muted">다시 볼 꿀팁</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button onClick={onRetryAgain} disabled={again === 0}>
          <RotateCcw size={16} aria-hidden />
          다시 볼 꿀팁 {again}장 한 번 더
        </Button>
        <Button variant="ghost" onClick={onExit}>
          <ArrowLeft size={16} aria-hidden />
          목록으로
        </Button>
      </div>
    </GlassCard>
  );
}

export default TipsFlashcards;
