import { CalendarClock } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import { daysUntil, toDateKey } from "../lib/date";
import type { Profile, StudyLog } from "../types";

interface DashboardHeroProps {
  profile: Profile | null;
  logs: StudyLog[];
  now: number;
  /** 프로필 수정 창 열기 (시험일이 지났을 때 버튼) */
  onEditProfile?: () => void;
}

const LEVEL_LABELS: Record<Profile["level"], string> = {
  advanced: "심화",
  basic: "기본",
};

/** 히어로: 인사 + 시험 D-day + 목표 급수 + 오늘 목표 링 */
function DashboardHero({
  profile,
  logs,
  now,
  onEditProfile,
}: DashboardHeroProps) {
  const todayKey = toDateKey(new Date(now));
  const solvedToday = logs.find((log) => log.date === todayKey)?.solved ?? 0;
  const goal = profile?.dailyGoal ?? 20;
  const dDay = profile?.examDate
    ? daysUntil(profile.examDate, new Date(now))
    : null;

  let dDayText = "D-?";
  let dDayCaption = "⚙️에서 시험 날짜를 정해 보세요";
  if (dDay !== null) {
    if (dDay > 0) {
      dDayText = `D-${dDay}`;
      dDayCaption = `시험까지 ${dDay}일`;
    } else if (dDay === 0) {
      dDayText = "D-Day";
      dDayCaption = "🔥 오늘이 시험날!";
    } else {
      // 지난 날짜를 "완료"로 보여 주면 공부를 마친 것처럼 오해할 수 있어서 다음 시험 날짜를 정하게 안내한다
      dDayText = "시험일이 지났어요";
      dDayCaption = `저장된 시험일: ${profile?.examDate}`;
    }
  }
  const examPassed = dDay !== null && dDay < 0;

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-bold sm:text-2xl">
          {profile?.name ?? "학습자"}님, 오늘도 한 걸음 📜
        </h2>
        {profile && (
          <Badge tone="accent">목표 {LEVEL_LABELS[profile.level]}</Badge>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-muted">한국사능력검정시험</p>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={`font-black tracking-tight text-primary tabular-nums ${
              examPassed ? "text-2xl sm:text-3xl" : "text-5xl sm:text-6xl"
            }`}
          >
            {dDayText}
          </motion.p>
          <p className="mt-1 text-sm text-muted">{dDayCaption}</p>
          {examPassed && onEditProfile && (
            <Button className="mt-3" onClick={onEditProfile}>
              <CalendarClock size={16} aria-hidden />
              다음 시험 날짜 설정하기
            </Button>
          )}
        </div>
        <GoalRing solved={solvedToday} goal={goal} />
      </div>
    </GlassCard>
  );
}

const RING_SIZE = 124;
const STROKE = 10;
const RADIUS = (RING_SIZE - STROKE) / 2;

/** 오늘 목표 링: 오늘 푼 문제 / 하루 목표. 달성하면 색이 바뀌고 축하 효과 */
function GoalRing({ solved, goal }: { solved: number; goal: number }) {
  const reduceMotion = useReducedMotion() ?? false;
  const ratio = goal > 0 ? Math.min(1, solved / goal) : 0;
  const achieved = goal > 0 && solved >= goal;

  return (
    <div
      className="relative shrink-0"
      style={{ width: RING_SIZE, height: RING_SIZE }}
      role="img"
      aria-label={`오늘 목표 ${goal}문제 중 ${solved}문제 풀이${achieved ? ", 목표 달성" : ""}`}
    >
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={achieved ? "var(--color-success)" : "var(--color-primary)"}
          strokeWidth={STROKE}
          strokeLinecap="round"
          // 0일 때 둥근 선 끝 때문에 점이 찍히지 않도록 투명하게
          initial={{
            pathLength: reduceMotion ? ratio : 0,
            opacity: ratio > 0 ? 1 : 0,
          }}
          animate={{ pathLength: ratio, opacity: ratio > 0 ? 1 : 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-bold tabular-nums">
          {solved}
          <span className="text-sm font-medium text-muted">/{goal}</span>
        </p>
        <p
          className={`text-[11px] ${achieved ? "font-semibold text-success" : "text-muted"}`}
        >
          {achieved ? "목표 달성! 🎉" : "오늘 목표"}
        </p>
      </div>

      {achieved && !reduceMotion && <RingBurst />}
    </div>
  );
}

const BURST_COLORS = ["bg-success", "bg-primary", "bg-accent"];

/** 목표 달성 축하: 링 바깥으로 점들이 퍼진다 */
function RingBurst() {
  return (
    <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2">
      {Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const distance = RING_SIZE / 2 + 6 + (i % 3) * 10;
        return (
          <motion.span
            key={i}
            className={`absolute size-1.5 rounded-full ${BURST_COLORS[i % 3]}`}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: [0, 1, 0],
              scale: [0.6, 1, 0.4],
            }}
            transition={{
              duration: 1,
              delay: 1 + (i % 3) * 0.05,
              ease: "easeOut",
            }}
          />
        );
      })}
    </span>
  );
}

export default DashboardHero;
