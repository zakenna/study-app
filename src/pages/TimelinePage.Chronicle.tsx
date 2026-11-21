import { Lightbulb } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type CSSProperties } from "react";
import TipCard from "../components/ui/TipCard";
import { getTipById } from "../data/tips";
import { ERAS, ERA_LABELS, eraColor, formatYear } from "../lib/labels";
import { isTipMemorized, toggleTipMemorized } from "../lib/storage";
import { useStudyData } from "../lib/useStudyData";
import { eventsInScope, sortByYear } from "./TimelinePage.helpers";

/** 📜 연표 보기: 시대별 색 띠 + 세로 연표, 💡 누르면 꿀팁 */
function TimelineChronicle() {
  const { tipVotes } = useStudyData();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ol className="space-y-6" aria-label="한국사 연표">
      {ERAS.map((era) => {
        const events = sortByYear(eventsInScope(era));
        if (events.length === 0) return null;
        const style = { "--band": eraColor(era) } as CSSProperties;
        return (
          <li key={era} style={style}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className="h-5 w-1.5 rounded-full bg-(--band)"
                aria-hidden
              />
              <h3 className="font-bold">{ERA_LABELS[era]}</h3>
              <span className="text-xs text-muted">
                {formatYear(events[0].year)} ~{" "}
                {formatYear(events[events.length - 1].year)}
              </span>
            </div>

            <ol className="ml-[3px] space-y-3 border-l-2 border-(--band) pl-5">
              {events.map((event) => {
                const tip = event.tipId ? getTipById(event.tipId) : undefined;
                const isOpen = openId === event.id;
                return (
                  <li key={event.id} className="relative">
                    <span
                      aria-hidden
                      className="absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-(--band) bg-canvas"
                    />
                    <div className="flex items-start gap-3">
                      <span className="w-[6.5rem] shrink-0 text-sm font-bold whitespace-nowrap text-ink tabular-nums">
                        {formatYear(event.year)}
                      </span>
                      <span className="min-w-0 flex-1 text-sm leading-relaxed">
                        {event.title}
                      </span>
                      {tip && (
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={`${event.title} 꿀팁 ${isOpen ? "닫기" : "보기"}`}
                          onClick={() => setOpenId(isOpen ? null : event.id)}
                          className={`shrink-0 rounded-md p-1 transition ${
                            isOpen
                              ? "text-accent"
                              : "text-muted hover:text-accent"
                          }`}
                        >
                          <Lightbulb size={16} aria-hidden />
                        </button>
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {tip && isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <TipCard
                            className="mt-2"
                            tip={tip}
                            memorized={isTipMemorized(tipVotes, tip.id)}
                            onToggleMemorized={toggleTipMemorized}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ol>
          </li>
        );
      })}
    </ol>
  );
}

export default TimelineChronicle;
