import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import TimelineChronicle from "./TimelinePage.Chronicle";
import TimelineGame from "./TimelinePage.Game";

type Mode = "game" | "chronicle";

const MODES: { value: Mode; label: string }[] = [
  { value: "game", label: "🎯 순서 맞추기" },
  { value: "chronicle", label: "📜 연표 보기" },
];

/** 🗺️ 타임라인: 순서 맞추기 게임 ↔ 연표 보기 */
function TimelinePage() {
  const [mode, setMode] = useState<Mode>("game");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">타임라인</h2>
        <p className="mt-1 text-sm text-muted">
          사건의 앞뒤를 알면 연도가 저절로 외워져요.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="타임라인 모드"
        className="grid grid-cols-2 rounded-xl border border-line bg-surface p-1"
      >
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={mode === m.value}
            onClick={() => setMode(m.value)}
            className={`relative rounded-lg py-2 text-sm transition ${
              mode === m.value
                ? "font-semibold text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {mode === m.value && (
              <motion.span
                layoutId="timeline-mode"
                className="absolute inset-0 rounded-lg bg-primary/15 ring-1 ring-primary/40"
                transition={{ duration: 0.25 }}
              />
            )}
            <span className="relative">{m.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {mode === "game" ? <TimelineGame /> : <TimelineChronicle />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default TimelinePage;
