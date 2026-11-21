// 망각곡선 계산 (docs/GUIDELINE.md 3-3) — 🔒 팀장 소유. 수정이 필요하면 팀장에게 요청.
// localStorage를 직접 만지지 않는 순수 함수만 둔다. 저장은 storage.ts가 담당.
import type { QuestionStat } from "../types";
import { DAY_MS } from "./date";

export const INITIAL_STRENGTH = 1; // 일
export const STRENGTH_MULTIPLIER = 2.5;

/** 깨진 값(음수, NaN 등)이 들어와도 계산이 터지지 않도록 strength를 보정 */
function safeStrength(strength: number): number {
  return Number.isFinite(strength) && strength > 0
    ? strength
    : INITIAL_STRENGTH;
}

/**
 * 지금 이 문제를 기억할 확률 (0~1).
 * 기억 확률 = Math.exp(-경과일 / strength)
 */
export function retention(
  stat: Pick<QuestionStat, "strength" | "lastReviewedAt">,
  now: number = Date.now(),
): number {
  const lastReviewedAt = Number.isFinite(stat.lastReviewedAt)
    ? stat.lastReviewedAt
    : now;
  const elapsedDays = Math.max(0, (now - lastReviewedAt) / DAY_MS);
  return Math.exp(-elapsedDays / safeStrength(stat.strength));
}

/** 풀이 후 새 strength. 정답이면 ×2.5, 오답이면 1로 리셋 */
export function updateStrength(strength: number, isCorrect: boolean): number {
  return isCorrect
    ? safeStrength(strength) * STRENGTH_MULTIPLIER
    : INITIAL_STRENGTH;
}

/**
 * 기억 확률이 낮은 순으로 문제 기록을 돌려준다 (약한 문제 우선 출제용).
 * 한 번도 안 푼 문제는 기록이 없으므로 포함되지 않는다.
 */
export function getWeakQuestions(
  stats: QuestionStat[],
  limit: number = 10,
  now: number = Date.now(),
): QuestionStat[] {
  return stats
    .map((stat) => ({ stat, p: retention(stat, now) }))
    .sort((a, b) => a.p - b.p)
    .slice(0, Math.max(0, limit))
    .map(({ stat }) => stat);
}
