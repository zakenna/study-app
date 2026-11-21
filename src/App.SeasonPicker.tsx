import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Season } from "./types";

const OPTIONS: { value: Season; emoji: string; label: string }[] = [
  { value: "spring", emoji: "🌸", label: "봄" },
  { value: "summer", emoji: "🌿", label: "여름" },
  { value: "autumn", emoji: "🍁", label: "가을" },
  { value: "winter", emoji: "❄️", label: "겨울" },
];

interface SeasonPickerProps {
  season: Season;
  onChange: (season: Season) => void;
}

/**
 * 🏯 계절 선택기. 데스크톱(sm 이상)은 4개 버튼을 바로, 모바일은 현재 계절 버튼을 누르면 펼친다
 * (하단 탭이 7칸이라 모바일 헤더 공간을 아끼려고).
 */
function SeasonPicker({ season, onChange }: SeasonPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find((o) => o.value === season) ?? OPTIONS[0];

  // 바깥을 누르거나 Esc를 누르면 닫기 (모바일 펼침)
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (
        e instanceof KeyboardEvent
          ? e.key === "Escape"
          : !wrapRef.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  const buttons = (onPick?: () => void) =>
    OPTIONS.map((o) => (
      <button
        key={o.value}
        type="button"
        aria-pressed={season === o.value}
        aria-label={`${o.label} 테마`}
        title={`${o.label} 테마`}
        onClick={() => {
          onChange(o.value);
          onPick?.();
        }}
        className={`grid size-8 place-items-center rounded-lg text-base transition ${
          season === o.value
            ? "bg-primary/15 ring-1 ring-primary/50"
            : "opacity-60 hover:opacity-100"
        }`}
      >
        <span aria-hidden>{o.emoji}</span>
      </button>
    ));

  return (
    <div ref={wrapRef} className="relative">
      {/* 데스크톱 */}
      <div
        role="group"
        aria-label="계절 테마"
        className="hidden items-center gap-0.5 sm:flex"
      >
        {buttons()}
      </div>

      {/* 모바일 */}
      <div className="sm:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-label={`계절 테마 바꾸기 (지금: ${current.label})`}
          onClick={() => setOpen((v) => !v)}
          className="grid size-8 place-items-center rounded-lg text-base ring-1 ring-line"
        >
          <span aria-hidden>{current.emoji}</span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              role="group"
              aria-label="계절 테마"
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-10 right-0 z-30 flex gap-0.5 rounded-xl border border-line bg-paper p-1 shadow-lg shadow-black/15"
            >
              {buttons(() => setOpen(false))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SeasonPicker;
