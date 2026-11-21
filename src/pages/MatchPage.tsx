import { Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import { ERAS, ERA_LABELS } from "../lib/labels";
import { saveMatchBest } from "../lib/storage";
import { useStudyData } from "../lib/useStudyData";
import MatchBoard from "./MatchPage.Board";
import {
  buildDeck,
  formatSeconds,
  PAIR_SIZES,
  personsInScope,
  type MatchCard,
  type MatchScope,
  type PairSize,
} from "./MatchPage.helpers";
import MatchResult from "./MatchPage.Result";

type Phase =
  | { name: "setup" }
  | { name: "play"; deck: MatchCard[]; runId: number }
  | {
      name: "result";
      personIds: string[];
      seconds: number;
      attempts: number;
      isRecord: boolean;
    };

/** 🔗 인물 ↔ 업적 카드 매칭 */
function MatchPage() {
  const { matchBest } = useStudyData();
  const [phase, setPhase] = useState<Phase>({ name: "setup" });
  const [scope, setScope] = useState<MatchScope>("all");
  const [pairs, setPairs] = useState<PairSize>(4);

  const poolSize = personsInScope(scope).length;
  const available = PAIR_SIZES.filter((n) => n <= poolSize);
  const effectivePairs = (
    available.includes(pairs) ? pairs : (available.at(-1) ?? 4)
  ) as PairSize;

  const start = () => {
    setPhase({
      name: "play",
      deck: buildDeck(scope, effectivePairs),
      runId: Date.now(),
    });
    window.scrollTo({ top: 0 });
  };

  const handleComplete =
    (deck: MatchCard[]) => (seconds: number, attempts: number) => {
      const personIds = deck
        .filter((c) => c.kind === "person")
        .map((c) => c.personId);
      const isRecord = saveMatchBest(effectivePairs, seconds);
      setPhase({ name: "result", personIds, seconds, attempts, isRecord });
      window.scrollTo({ top: 0 });
    };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">인물 매칭</h2>
        <p className="mt-1 text-sm text-muted">
          카드를 2장씩 뒤집어 인물과 업적의 짝을 찾아보세요.
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase.name === "play" ? `play-${phase.runId}` : phase.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {phase.name === "setup" && (
            <GlassCard className="space-y-5">
              <div>
                <p className="font-semibold">범위</p>
                <div
                  role="group"
                  aria-label="범위"
                  className="mt-2 flex flex-wrap gap-2"
                >
                  <Chip
                    active={scope === "all"}
                    onClick={() => setScope("all")}
                  >
                    전체 시대
                  </Chip>
                  {ERAS.map((era) => {
                    const count = personsInScope(era).length;
                    return (
                      <Chip
                        key={era}
                        active={scope === era}
                        disabled={count < PAIR_SIZES[0]}
                        onClick={() => setScope(era)}
                      >
                        {ERA_LABELS[era]}{" "}
                        <span className="opacity-60">{count}</span>
                      </Chip>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="font-semibold">쌍 수</p>
                <div
                  role="group"
                  aria-label="쌍 수"
                  className="mt-2 grid grid-cols-3 gap-2"
                >
                  {PAIR_SIZES.map((n) => {
                    const best = matchBest[String(n)];
                    return (
                      <button
                        key={n}
                        type="button"
                        aria-pressed={effectivePairs === n}
                        disabled={n > poolSize}
                        onClick={() => setPairs(n)}
                        className={`rounded-xl border py-2.5 text-sm transition disabled:opacity-35 ${
                          effectivePairs === n
                            ? "border-primary bg-primary/15 font-semibold text-primary"
                            : "border-line bg-surface text-muted hover:text-ink"
                        }`}
                      >
                        {n}쌍
                        <span className="block text-[11px] font-normal text-muted">
                          🏆 {best !== undefined ? formatSeconds(best) : "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button className="min-h-12 w-full text-base" onClick={start}>
                <Play size={18} aria-hidden />
                시작하기
              </Button>
            </GlassCard>
          )}

          {phase.name === "play" && (
            <MatchBoard
              deck={phase.deck}
              pairs={effectivePairs}
              onComplete={handleComplete(phase.deck)}
              onQuit={() => setPhase({ name: "setup" })}
            />
          )}

          {phase.name === "result" && (
            <MatchResult
              personIds={phase.personIds}
              seconds={phase.seconds}
              attempts={phase.attempts}
              isRecord={phase.isRecord}
              onReplay={start}
              onSettings={() => setPhase({ name: "setup" })}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
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

export default MatchPage;
