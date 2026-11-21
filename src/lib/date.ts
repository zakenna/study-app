// 날짜 유틸 — 🔒 팀장 소유. 날짜 키는 모두 로컬 시간 기준 "YYYY-MM-DD".
import type { StudyLog } from "../types";

export const DAY_MS = 86_400_000;

/** Date → "YYYY-MM-DD" (로컬 시간 기준. toISOString은 UTC라 쓰지 않는다) */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" → 그날 로컬 자정의 Date. 형식이 틀리면 null */
export function parseDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return toDateKey(date) === key ? date : null;
}

/** 오늘부터 dateKey까지 남은 일수 (오늘이면 0, 지났으면 음수). 형식이 틀리면 null */
export function daysUntil(
  dateKey: string,
  today: Date = new Date(),
): number | null {
  const target = parseDateKey(dateKey);
  if (!target) return null;
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return Math.round((target.getTime() - start.getTime()) / DAY_MS);
}

/**
 * 연속 학습일. 오늘 문제를 풀었으면 오늘부터, 아직이면 어제부터 거꾸로 센다.
 * (오늘 아직 안 풀었다고 연속 기록이 바로 0이 되지 않도록)
 */
export function calcStudyStreak(
  logs: StudyLog[],
  today: Date = new Date(),
): number {
  const studied = new Set(
    logs.filter((log) => log.solved > 0).map((log) => log.date),
  );
  const cursor = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  if (!studied.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (studied.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
