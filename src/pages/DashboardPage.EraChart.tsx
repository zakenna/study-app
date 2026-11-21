import { motion } from "motion/react";
import GlassCard from "../components/ui/GlassCard";
import { ERAS, ERA_LABELS } from "../lib/labels";
import { getEraProgress } from "../lib/quiz";
import type { QuestionStat } from "../types";

interface DashboardEraChartProps {
  stats: Record<string, QuestionStat>;
}

/**
 * 📊 시대별 정답률: 9개 시대 가로 막대 (값 = 누적 정답 / 누적 풀이).
 * 시리즈 하나(정답률)라 한 가지 색, 값은 막대 옆에 글자로도 표시. 호버·포커스하면 상세 툴팁.
 */
function DashboardEraChart({ stats }: DashboardEraChartProps) {
  const rows = ERAS.map((era) => ({ era, ...getEraProgress(era, stats) }));

  return (
    <GlassCard>
      <h3 className="font-bold">📊 시대별 정답률</h3>
      <p className="mt-0.5 text-xs text-muted">누적 정답 ÷ 누적 풀이</p>

      <ul className="mt-4 space-y-2.5">
        {rows.map((row, i) => {
          const percent = row.rate === null ? null : Math.round(row.rate * 100);
          return (
            <li
              key={row.era}
              tabIndex={0}
              aria-label={
                percent === null
                  ? `${ERA_LABELS[row.era]}: 미응시`
                  : `${ERA_LABELS[row.era]}: 정답률 ${percent}%, ${row.attempts}회 중 ${row.correct}회 정답`
              }
              className="group relative grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:grid-cols-[7rem_1fr_3.5rem]"
            >
              <span className="truncate text-xs text-ink sm:text-sm">
                {ERA_LABELS[row.era]}
              </span>
              <span className="relative h-2.5 overflow-hidden rounded-full bg-line">
                {percent !== null && (
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{
                      duration: 0.6,
                      delay: 0.05 * i,
                      ease: "easeOut",
                    }}
                  />
                )}
              </span>
              <span
                className={`text-right text-xs tabular-nums ${percent === null ? "text-muted" : "font-semibold text-ink"}`}
              >
                {percent === null ? "미응시" : `${percent}%`}
              </span>

              {/* 툴팁 (호버·키보드 포커스) */}
              {percent !== null && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute -top-8 left-24 z-10 rounded-md border border-line bg-canvas/95 px-2 py-1 text-[11px] whitespace-nowrap text-ink opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:left-28"
                >
                  {ERA_LABELS[row.era]} · {row.attempts}회 중 {row.correct}회
                  정답 · {row.solved}/{row.total}문제 풀어 봄
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

export default DashboardEraChart;
