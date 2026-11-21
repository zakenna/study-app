import { Clock, MousePointerClick, Trophy, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Badge from "../components/ui/Badge";
import { ERA_LABELS } from "../lib/labels";
import { useStudyData } from "../lib/useStudyData";
import PersonAvatar from "./MatchPage.Avatar";
import { formatSeconds, personById, type MatchCard } from "./MatchPage.helpers";

interface MatchBoardProps {
  deck: MatchCard[];
  pairs: number;
  onComplete: (seconds: number, attempts: number) => void;
  onQuit: () => void;
}

const MISMATCH_MS = 900;

/** 카드 뒤집기 매칭 판: 2장 뒤집기 → 짝이면 빛나며 고정, 아니면 흔들린 뒤 덮기 */
function MatchBoard({ deck, pairs, onComplete, onQuit }: MatchBoardProps) {
  const { matchBest } = useStudyData();
  const reduceMotion = useReducedMotion() ?? false;
  const [open, setOpen] = useState<string[]>([]); // 지금 앞면인 카드 key (최대 2)
  const [matched, setMatched] = useState<Set<string>>(new Set()); // 짝 맞춘 personId
  const [shaking, setShaking] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [announce, setAnnounce] = useState("");
  const timeoutRef = useRef<number | undefined>(undefined);
  const best = matchBest[String(pairs)];

  // 시계: 첫 카드를 뒤집은 순간부터
  useEffect(() => {
    if (startedAt === null) return;
    const id = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt) / 1000)),
      250,
    );
    return () => window.clearInterval(id);
  }, [startedAt]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const flip = (card: MatchCard) => {
    if (
      matched.has(card.personId) ||
      open.includes(card.key) ||
      open.length >= 2
    )
      return;
    const now = Date.now();
    const start = startedAt ?? now;
    if (startedAt === null) setStartedAt(now);

    const nextOpen = [...open, card.key];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    const [a, b] = nextOpen.map((key) => deck.find((c) => c.key === key)!);
    if (a.personId === b.personId) {
      const nextMatched = new Set(matched).add(a.personId);
      setMatched(nextMatched);
      setOpen([]);
      setAnnounce(`짝을 찾았어요! ${personById.get(a.personId)?.person}`);
      if (nextMatched.size === pairs) {
        const seconds = Math.max(1, Math.round((now - start) / 1000));
        setElapsed(seconds);
        setStartedAt(null);
        timeoutRef.current = window.setTimeout(
          () => onComplete(seconds, nextAttempts),
          reduceMotion ? 200 : 900,
        );
      }
    } else {
      setShaking(nextOpen);
      setAnnounce("짝이 아니에요");
      timeoutRef.current = window.setTimeout(() => {
        setOpen([]);
        setShaking([]);
      }, MISMATCH_MS);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onQuit}
          aria-label="매칭 그만하기"
          className="rounded-lg p-1.5 text-muted transition hover:text-ink"
        >
          <X size={18} aria-hidden />
        </button>
        <Badge tone="primary">
          <Clock size={12} aria-hidden />
          <span className="tabular-nums">{formatSeconds(elapsed)}</span>
        </Badge>
        <Badge>
          <MousePointerClick size={12} aria-hidden />
          시도 <span className="tabular-nums">{attempts}</span>
        </Badge>
        <Badge tone="accent">
          <Trophy size={12} aria-hidden />
          최고 {best !== undefined ? formatSeconds(best) : "—"}
        </Badge>
        <span className="ml-auto text-xs text-muted tabular-nums">
          {matched.size} / {pairs} 쌍
        </span>
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      <ul className="grid grid-cols-4 gap-2 sm:gap-3" aria-label="매칭 카드">
        {deck.map((card, i) => {
          const isMatched = matched.has(card.personId);
          const isOpen = isMatched || open.includes(card.key);
          return (
            <li key={card.key}>
              <FlipCard
                card={card}
                index={i}
                isOpen={isOpen}
                isMatched={isMatched}
                isShaking={shaking.includes(card.key)}
                reduceMotion={reduceMotion}
                onFlip={() => flip(card)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface FlipCardProps {
  card: MatchCard;
  index: number;
  isOpen: boolean;
  isMatched: boolean;
  isShaking: boolean;
  reduceMotion: boolean;
  onFlip: () => void;
}

function FlipCard({
  card,
  index,
  isOpen,
  isMatched,
  isShaking,
  reduceMotion,
  onFlip,
}: FlipCardProps) {
  const person = personById.get(card.personId);
  if (!person) return null;
  const label = isOpen
    ? `${card.kind === "person" ? "인물" : "업적"}: ${card.kind === "person" ? person.person : person.deed}${isMatched ? " (짝 맞춤)" : ""}`
    : `${index + 1}번 카드, 뒤집기`;

  return (
    <motion.button
      type="button"
      onClick={onFlip}
      aria-label={label}
      aria-pressed={isOpen}
      disabled={isMatched}
      animate={
        isShaking && !reduceMotion
          ? { x: [0, -6, 6, -4, 4, 0] }
          : isMatched && !reduceMotion
            ? { scale: [1, 1.06, 1] }
            : { x: 0, scale: 1 }
      }
      transition={{
        duration: isShaking ? 0.45 : 0.4,
        delay: isShaking ? 0.35 : 0,
      }}
      className="relative block aspect-[3/4] w-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary sm:aspect-[4/3]"
      style={{ perspective: 800 }}
    >
      <motion.span
        className="absolute inset-0 block"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isOpen ? 180 : 0 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }
        }
      >
        {/* 뒷면 (덮인 상태) */}
        <span
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          className="absolute inset-0 grid place-items-center rounded-xl border border-line bg-surface text-2xl text-muted backdrop-blur-xl hover:border-primary/60"
        >
          <span aria-hidden>📜</span>
        </span>

        {/* 앞면 */}
        <span
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl border p-1.5 text-center transition-shadow sm:p-2 ${
            isMatched
              ? "border-success bg-success/15 shadow-[0_0_18px_var(--color-success)]"
              : isShaking
                ? "border-danger bg-danger/15"
                : "border-primary/60 bg-surface"
          }`}
        >
          {card.kind === "person" ? (
            <>
              <PersonAvatar name={person.person} era={person.era} />
              <span className="text-[11px] leading-tight font-bold sm:text-sm">
                {person.person}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-muted sm:text-xs">업적</span>
              <span className="text-[11px] leading-snug font-medium sm:text-sm">
                {person.deed}
              </span>
              {isMatched && (
                <span className="text-[9px] text-muted sm:text-[11px]">
                  {ERA_LABELS[person.era]}
                </span>
              )}
            </>
          )}
        </span>
      </motion.span>
    </motion.button>
  );
}

export default MatchBoard;
