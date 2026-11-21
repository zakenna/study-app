import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { projectRetention } from "../lib/memory";
import type { QuestionStat } from "../types";

interface ForgettingCurveChartProps {
  stat: Pick<QuestionStat, "strength" | "lastReviewedAt">;
  now: number;
}

interface Point {
  day: number;
  percent: number;
}

const dayLabel = (day: number) => (day === 0 ? "오늘" : `${day}일`);

/** 툴팁: 글자는 텍스트 색 토큰, 배경은 테마 표면 */
function CurveTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: Point }>;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="rounded-lg border border-line bg-canvas/95 px-2.5 py-1.5 text-xs text-ink shadow-lg">
      <span className="text-muted">
        {point.day === 0 ? "오늘" : `${point.day}일 뒤`}
      </span>{" "}
      · 기억 확률 <span className="font-semibold">{point.percent}%</span>
    </div>
  );
}

/** 📉 앞으로 7일 기억 확률 (망각곡선). 시리즈 하나라 범례 없이 제목으로 이름을 밝힌다 */
function ForgettingCurveChart({ stat, now }: ForgettingCurveChartProps) {
  const data = projectRetention(stat, 7, now);
  const gradientId = `curve-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const day3 = data[3]?.percent ?? 0;

  return (
    <figure className="rounded-xl border border-line bg-canvas/40 p-3">
      <figcaption className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">📉 앞으로 7일 기억 확률</span>
        <span className="text-xs text-muted">복습 안 하면 3일 뒤 {day3}%</span>
      </figcaption>

      <div className="h-[120px]" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--color-line)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="day"
              tickFormatter={dayLabel}
              interval={0}
              tick={{ fill: "var(--color-muted)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: "var(--color-muted)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CurveTooltip />}
              cursor={{ stroke: "var(--color-muted)", strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="percent"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 5,
                fill: "var(--color-primary)",
                stroke: "var(--color-canvas)",
                strokeWidth: 2,
              }}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 스크린리더·표 보기용 */}
      <table className="sr-only">
        <caption>앞으로 7일 기억 확률</caption>
        <tbody>
          {data.map((p) => (
            <tr key={p.day}>
              <th scope="row">{dayLabel(p.day)}</th>
              <td>{p.percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export default ForgettingCurveChart;
