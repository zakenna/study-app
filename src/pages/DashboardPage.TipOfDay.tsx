import GlassCard from "../components/ui/GlassCard";
import TipCard from "../components/ui/TipCard";
import { tips } from "../data/tips";
import { DAY_MS } from "../lib/date";
import { isTipMemorized, toggleTipMemorized } from "../lib/storage";
import type { TipVote } from "../types";

interface DashboardTipOfDayProps {
  tipVotes: TipVote[];
  now: number;
}

/** 로컬 날짜 기준 일수 (자정에 바뀜) → 하루 동안 같은 꿀팁 */
function tipIndexForDay(now: number): number {
  const d = new Date(now);
  const localDay = Math.floor(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS,
  );
  // 꿀팁 목록 순서(시대순)대로 보이지 않도록 큰 소수를 곱해 섞는다
  return (localDay * 7919) % tips.length;
}

/** 💡 오늘의 꿀팁 */
function DashboardTipOfDay({ tipVotes, now }: DashboardTipOfDayProps) {
  if (tips.length === 0) return null;
  const tip = tips[tipIndexForDay(now)];

  return (
    <GlassCard>
      <h3 className="mb-3 font-bold">💡 오늘의 꿀팁</h3>
      <TipCard
        tip={tip}
        memorized={isTipMemorized(tipVotes, tip.id)}
        onToggleMemorized={toggleTipMemorized}
      />
      <p className="mt-2 text-[11px] text-muted">
        매일 자정에 새 꿀팁으로 바뀌어요
      </p>
    </GlassCard>
  );
}

export default DashboardTipOfDay;
