import { ChevronDown, Layers, Search, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import ProgressBar from "../components/ui/ProgressBar";
import TipCard from "../components/ui/TipCard";
import { tips } from "../data/tips";
import { ERAS, ERA_LABELS, TIP_KIND_LABELS } from "../lib/labels";
import { isTipMemorized, toggleTipMemorized } from "../lib/storage";
import { useStudyData } from "../lib/useStudyData";
import type { Era, Tip } from "../types";
import { matchesSearch, questionsByTip } from "./TipsPage.helpers";
import TipsInlineQuiz from "./TipsPage.InlineQuiz";

interface TipsListProps {
  onStartCards: () => void;
}

type KindFilter = Tip["kind"] | "all";
type StatusFilter = "all" | "memorized" | "todo";

const KIND_OPTIONS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "number", label: TIP_KIND_LABELS.number },
  { value: "acronym", label: TIP_KIND_LABELS.acronym },
  { value: "story", label: TIP_KIND_LABELS.story },
];
const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "memorized", label: "외움" },
  { value: "todo", label: "아직" },
];

/** 꿀팁 목록: 진행도 → 검색·필터 → 꿀팁 카드(+ 연결 문제 풀기) */
function TipsList({ onStartCards }: TipsListProps) {
  const { tipVotes } = useStudyData();
  const [query, setQuery] = useState("");
  const [era, setEra] = useState<Era | "all">("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [openQuizTipId, setOpenQuizTipId] = useState<string | null>(null);

  const memorizedCount = tips.filter((t) =>
    isTipMemorized(tipVotes, t.id),
  ).length;
  const allMemorized = tips.length > 0 && memorizedCount === tips.length;
  const todoCount = tips.length - memorizedCount;

  const visible = tips.filter((tip) => {
    const memorized = isTipMemorized(tipVotes, tip.id);
    return (
      matchesSearch(tip, query) &&
      (era === "all" || tip.era === era) &&
      (kind === "all" || tip.kind === kind) &&
      (status === "all" || (status === "memorized" ? memorized : !memorized))
    );
  });
  const isFiltered =
    query !== "" || era !== "all" || kind !== "all" || status !== "all";

  const resetFilters = () => {
    setQuery("");
    setEra("all");
    setKind("all");
    setStatus("all");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">꿀팁 모음</h2>
        <p className="mt-1 text-sm text-muted">
          외운 꿀팁은 👍로 표시하고, 연결된 문제로 바로 확인해 보세요.
        </p>
      </div>

      {/* 진행도 */}
      <GlassCard className="relative overflow-hidden">
        <p className="font-semibold">
          {tips.length}개 꿀팁 중{" "}
          <span className="text-accent tabular-nums">{memorizedCount}개</span>{" "}
          외웠어요
        </p>
        <ProgressBar
          className="mt-3"
          value={memorizedCount}
          max={tips.length}
          tone={allMemorized ? "success" : "accent"}
          label="외운 꿀팁 비율"
        />
        {allMemorized && <AllDone />}
        <Button
          className="mt-4 w-full"
          variant={todoCount > 0 ? "primary" : "ghost"}
          onClick={onStartCards}
          disabled={todoCount === 0}
        >
          <Layers size={18} aria-hidden />
          {todoCount > 0
            ? `🎴 암기 카드로 외우기 (${todoCount}장)`
            : "🎴 아직 못 외운 꿀팁이 없어요"}
        </Button>
      </GlassCard>

      {/* 검색·필터 */}
      <div className="space-y-3">
        <label className="relative block">
          <span className="sr-only">꿀팁 검색</span>
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="꿀팁 문장, 사건, 인물로 검색 (예: 임진왜란)"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pr-10 pl-9 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="검색어 지우기"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-ink"
            >
              <X size={16} aria-hidden />
            </button>
          )}
        </label>

        <div
          role="group"
          aria-label="시대 필터"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Chip active={era === "all"} onClick={() => setEra("all")}>
            전체 시대
          </Chip>
          {ERAS.map((e) => (
            <Chip key={e} active={era === e} onClick={() => setEra(e)}>
              {ERA_LABELS[e]}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Segmented
            label="종류"
            options={KIND_OPTIONS}
            value={kind}
            onChange={setKind}
          />
          <Segmented
            label="상태"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
        </div>
      </div>

      {/* 목록 */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span aria-live="polite">{visible.length}개 꿀팁</span>
        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="hover:text-ink"
          >
            필터 초기화
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <GlassCard className="py-10 text-center">
          <p className="text-3xl" aria-hidden>
            🔍
          </p>
          <p className="mt-2 font-semibold">조건에 맞는 꿀팁이 없어요</p>
          <Button variant="ghost" className="mt-4" onClick={resetFilters}>
            필터 초기화
          </Button>
        </GlassCard>
      ) : (
        <ul className="space-y-4">
          {visible.map((tip) => {
            const linked = questionsByTip.get(tip.id)?.[0];
            const isOpen = openQuizTipId === tip.id;
            return (
              <li key={tip.id} className="space-y-2">
                <TipCard
                  tip={tip}
                  memorized={isTipMemorized(tipVotes, tip.id)}
                  onToggleMemorized={toggleTipMemorized}
                />
                {linked && (
                  <>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenQuizTipId(isOpen ? null : tip.id)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs text-muted transition hover:text-ink"
                    >
                      {isOpen ? "문제 닫기" : "연결된 문제 풀어보기"}
                      <ChevronDown
                        size={14}
                        aria-hidden
                        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <TipsInlineQuiz question={linked} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** 전부 외웠을 때 축하 */
function AllDone() {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.p
      role="status"
      initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
      className="mt-3 text-center font-bold text-success"
    >
      🎉 모든 꿀팁을 외웠어요! 한국사 마스터!
    </motion.p>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition ${
        active
          ? "border-primary bg-primary/15 font-semibold text-primary"
          : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      <div className="flex rounded-lg border border-line bg-surface p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-2.5 py-1 text-xs transition ${
              value === opt.value
                ? "bg-primary/15 font-semibold text-primary"
                : "text-muted hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TipsList;
