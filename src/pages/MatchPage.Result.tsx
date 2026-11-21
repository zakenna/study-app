import { Lightbulb, RotateCcw, Settings2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import TipCard from "../components/ui/TipCard";
import { personTips } from "../data/persons";
import { getTipById } from "../data/tips";
import { ERA_LABELS } from "../lib/labels";
import { isTipMemorized, toggleTipMemorized } from "../lib/storage";
import { useStudyData } from "../lib/useStudyData";
import PersonAvatar from "./MatchPage.Avatar";
import { formatSeconds, personById } from "./MatchPage.helpers";

interface MatchResultProps {
  personIds: string[];
  seconds: number;
  attempts: number;
  isRecord: boolean;
  onReplay: () => void;
  onSettings: () => void;
}

/** 완료 화면: 시간·시도·기록 경신 + 맞춘 쌍 목록(💡 꿀팁 펼치기) */
function MatchResult({
  personIds,
  seconds,
  attempts,
  isRecord,
  onReplay,
  onSettings,
}: MatchResultProps) {
  const { tipVotes } = useStudyData();
  const reduceMotion = useReducedMotion() ?? false;
  const [openId, setOpenId] = useState<string | null>(null);
  const perfect = attempts === personIds.length;

  return (
    <div className="space-y-4">
      <GlassCard className="text-center">
        <motion.p
          initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.45, duration: 0.5 }}
          className="text-lg font-bold"
        >
          {perfect ? "한 번도 안 틀렸어요! 🎯" : "모두 찾았어요! 🎉"}
        </motion.p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-3xl font-bold tabular-nums">
              {formatSeconds(seconds)}
            </p>
            <p className="text-xs text-muted">걸린 시간</p>
          </div>
          <div>
            <p className="text-3xl font-bold tabular-nums">{attempts}</p>
            <p className="text-xs text-muted">
              시도 횟수 ({personIds.length}쌍)
            </p>
          </div>
        </div>
        {isRecord && (
          <motion.p
            role="status"
            initial={reduceMotion ? false : { y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 font-semibold text-accent"
          >
            🏆 {personIds.length}쌍 최단 기록 경신!
          </motion.p>
        )}
      </GlassCard>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={onSettings}>
          <Settings2 size={16} aria-hidden />
          설정 바꾸기
        </Button>
        <Button onClick={onReplay}>
          <RotateCcw size={16} aria-hidden />
          다시 하기
        </Button>
      </div>

      <section aria-labelledby="pairs-heading" className="space-y-2">
        <h3 id="pairs-heading" className="text-sm font-semibold text-muted">
          맞춘 쌍
        </h3>
        <ul className="space-y-2">
          {personIds.map((id) => {
            const person = personById.get(id);
            if (!person) return null;
            const tip = personTips[id] ? getTipById(personTips[id]) : undefined;
            const isOpen = openId === id;
            return (
              <li
                key={id}
                className="rounded-xl border border-line bg-surface p-3"
              >
                <div className="flex items-center gap-3">
                  <PersonAvatar
                    name={person.person}
                    era={person.era}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{person.person}</p>
                    <p className="text-sm text-muted">{person.deed}</p>
                  </div>
                  <Badge className="shrink-0">{ERA_LABELS[person.era]}</Badge>
                  {tip && (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-label={`${person.person} 꿀팁 ${isOpen ? "닫기" : "보기"}`}
                      onClick={() => setOpenId(isOpen ? null : id)}
                      className={`shrink-0 rounded-md p-1 transition ${isOpen ? "text-accent" : "text-muted hover:text-accent"}`}
                    >
                      <Lightbulb size={18} aria-hidden />
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
                        className="mt-3"
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
        </ul>
      </section>
    </div>
  );
}

export default MatchResult;
