// 타임라인 전용 도우미: 범위별 사건, 라운드 뽑기, 채점
import { timelineEvents } from "../data/timeline";
import { shuffle } from "../lib/quiz";
import type { Era, TimelineEvent } from "../types";

export type Scope = Era | "all";
export const ROUND_SIZES = [4, 5, 6] as const;
export type RoundSize = (typeof ROUND_SIZES)[number];

export function eventsInScope(scope: Scope): TimelineEvent[] {
  return scope === "all"
    ? timelineEvents
    : timelineEvents.filter((e) => e.era === scope);
}

export function sortByYear(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => a.year - b.year);
}

const isSorted = (events: TimelineEvent[]) =>
  events.every((e, i) => i === 0 || events[i - 1].year <= e.year);

/**
 * 한 라운드: 범위에서 size개를 뽑아 섞는다.
 * 같은 연도는 고르지 않고(데이터 규칙상 없음), 처음부터 정답 순서로 놓이지 않게 다시 섞는다.
 */
export function buildRound(scope: Scope, size: number): TimelineEvent[] {
  const picked: TimelineEvent[] = [];
  const years = new Set<number>();
  for (const event of shuffle(eventsInScope(scope))) {
    if (years.has(event.year)) continue;
    picked.push(event);
    years.add(event.year);
    if (picked.length === size) break;
  }
  let order = shuffle(picked);
  for (let i = 0; i < 10 && order.length > 1 && isSorted(order); i++) {
    order = shuffle(picked);
  }
  return order;
}

/** 각 카드가 올바른 자리에 있는지 (id → 맞음 여부) */
export function gradeOrder(order: TimelineEvent[]): Record<string, boolean> {
  const correct = sortByYear(order);
  return Object.fromEntries(
    order.map((e, i) => [e.id, correct[i].id === e.id]),
  );
}
