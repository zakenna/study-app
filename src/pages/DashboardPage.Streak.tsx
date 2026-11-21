import { useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import ProgressBar from "../components/ui/ProgressBar";
import { calcStudyStreak, toDateKey } from "../lib/date";
import type { QuestionStat, StudyLog } from "../types";

interface DashboardStreakProps {
  logs: StudyLog[];
  solvedStats: QuestionStat[];
  dailyGoal: number;
  now: number;
}

const WEEKS = 4;
const WEEKDAY_LABELS = ["월", "", "수", "", "금", "", "일"];
/** 잔디 농도: 0(없음) ~ 4(목표 달성). 한 가지 색(primary)의 진하기로만 표현 */
const LEVEL_CLASSES = [
  "bg-line",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];
const POINTS_PER_LEVEL = 10;

interface Cell {
  key: string;
  date: Date;
  solved: number;
  level: number;
  isFuture: boolean;
}

function intensity(solved: number, goal: number): number {
  if (solved <= 0) return 0;
  const ratio = goal > 0 ? solved / goal : 1;
  if (ratio >= 1) return 4;
  if (ratio >= 0.67) return 3;
  if (ratio >= 0.34) return 2;
  return 1;
}

/** 최근 4주 잔디: 열 = 주(월~일), 오늘이 있는 주가 마지막 열 */
function buildCells(logs: StudyLog[], goal: number, now: number): Cell[] {
  const solvedByDate = new Map(logs.map((log) => [log.date, log.solved]));
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const mondayOffset = (today.getDay() + 6) % 7; // 월요일 = 0
  const start = new Date(today);
  start.setDate(today.getDate() - mondayOffset - (WEEKS - 1) * 7);

  return Array.from({ length: WEEKS * 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = toDateKey(date);
    const solved = solvedByDate.get(key) ?? 0;
    return {
      key,
      date,
      solved,
      level: intensity(solved, goal),
      isFuture: date.getTime() > today.getTime(),
    };
  });
}

const formatDay = (date: Date) =>
  `${date.getMonth() + 1}월 ${date.getDate()}일`;

/** 🔥 학습 기록: 연속 학습일 + 잔디 + 레벨 */
function DashboardStreak({
  logs,
  solvedStats,
  dailyGoal,
  now,
}: DashboardStreakProps) {
  const streak = calcStudyStreak(logs, new Date(now));
  const cells = buildCells(logs, dailyGoal, now);
  // 선택은 날짜 키로 들고 있고, 칸 정보는 매번 cells에서 찾는다 (기록이 바뀌어도 최신 값)
  const [selectedKey, setSelectedKey] = useState(() =>
    toDateKey(new Date(now)),
  );
  const selected = cells.find((c) => c.key === selectedKey && !c.isFuture);
  const activeDays = cells.filter((c) => c.solved > 0).length;
  const solvedIn4Weeks = cells.reduce((sum, c) => sum + c.solved, 0);

  const totalCorrect = solvedStats.reduce((sum, s) => sum + s.correct, 0);
  const level = Math.floor(totalCorrect / POINTS_PER_LEVEL) + 1;
  const progress = totalCorrect % POINTS_PER_LEVEL;

  return (
    <GlassCard>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-bold">🔥 학습 기록</h3>
        <p className="text-sm">
          <span className="text-2xl font-bold text-accent tabular-nums">
            {streak}
          </span>
          <span className="ml-1 text-muted">일 연속</span>
        </p>
      </div>

      {/* 잔디 (정사각형 칸) + 오른쪽 4주 요약 */}
      <div className="mt-4 flex items-start gap-2">
        <div
          className="grid grid-rows-7 gap-1 text-[10px] text-muted"
          aria-hidden
        >
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i} className="flex size-5 items-center leading-none">
              {label}
            </span>
          ))}
        </div>
        <div
          role="grid"
          aria-label="최근 4주 학습 기록"
          className="grid auto-cols-[1.25rem] grid-flow-col grid-rows-7 gap-1"
        >
          {cells.map((cell) =>
            cell.isFuture ? (
              <span key={cell.key} className="size-5" aria-hidden />
            ) : (
              <button
                key={cell.key}
                type="button"
                role="gridcell"
                aria-label={`${formatDay(cell.date)}: ${cell.solved}문제`}
                aria-selected={selected?.key === cell.key}
                onMouseEnter={() => setSelectedKey(cell.key)}
                onFocus={() => setSelectedKey(cell.key)}
                onClick={() => setSelectedKey(cell.key)}
                className={`size-5 rounded-[4px] transition ${LEVEL_CLASSES[cell.level]} ${
                  selected?.key === cell.key
                    ? "ring-2 ring-ink/70 ring-offset-1 ring-offset-canvas"
                    : "hover:ring-1 hover:ring-ink/40"
                }`}
              />
            ),
          )}
        </div>

        <dl className="ml-auto grid gap-3 text-right">
          <div>
            <dt className="text-[11px] text-muted">최근 4주 학습일</dt>
            <dd className="text-xl font-bold tabular-nums">
              {activeDays}
              <span className="ml-0.5 text-xs font-medium text-muted">일</span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">최근 4주 풀이</dt>
            <dd className="text-xl font-bold tabular-nums">
              {solvedIn4Weeks}
              <span className="ml-0.5 text-xs font-medium text-muted">
                문제
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted">
        <p aria-live="polite" className="text-ink">
          {selected
            ? `${formatDay(selected.date)} · ${selected.solved}문제 풀이`
            : "칸을 누르면 그날 기록이 보여요"}
        </p>
        <div className="flex items-center gap-1" aria-hidden>
          적음
          {LEVEL_CLASSES.map((cls, i) => (
            <span key={i} className={`size-2.5 rounded-[3px] ${cls}`} />
          ))}
          목표
        </div>
      </div>

      {/* 레벨 */}
      <div className="mt-5 space-y-1.5 border-t border-line pt-4">
        <div className="flex items-baseline justify-between">
          <p className="font-bold">
            Lv.<span className="tabular-nums">{level}</span>
          </p>
          <p className="text-xs text-muted">
            누적 정답 {totalCorrect} · 다음 레벨까지{" "}
            {POINTS_PER_LEVEL - progress}
            문제
          </p>
        </div>
        <ProgressBar
          value={progress}
          max={POINTS_PER_LEVEL}
          tone="accent"
          label="다음 레벨까지 진행도"
        />
      </div>
    </GlassCard>
  );
}

export default DashboardStreak;
