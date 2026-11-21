// 인물 매칭 전용 도우미: 범위별 인물, 카드 덱, 이니셜, 시간 표시
import { persons } from "../data/persons";
import { shuffle } from "../lib/quiz";
import type { Era, PersonMatch } from "../types";

export type MatchScope = Era | "all";
export const PAIR_SIZES = [4, 6, 8] as const;
export type PairSize = (typeof PAIR_SIZES)[number];

export interface MatchCard {
  key: string; // "<personId>:person" | "<personId>:deed"
  personId: string;
  kind: "person" | "deed";
}

export function personsInScope(scope: MatchScope): PersonMatch[] {
  return scope === "all" ? persons : persons.filter((p) => p.era === scope);
}

export const personById = new Map(persons.map((p) => [p.id, p]));

/** 범위에서 pairs명을 뽑아 인물 카드 + 업적 카드를 섞은 덱 */
export function buildDeck(scope: MatchScope, pairs: number): MatchCard[] {
  const picked = shuffle(personsInScope(scope)).slice(0, pairs);
  return shuffle(
    picked.flatMap((p): MatchCard[] => [
      { key: `${p.id}:person`, personId: p.id, kind: "person" },
      { key: `${p.id}:deed`, personId: p.id, kind: "deed" },
    ]),
  );
}

const ROYAL_SUFFIX = /(대왕|여왕|왕|대원군|군|조|종)$/;

/**
 * 이니셜 아바타 글자.
 * 왕·호칭(장수왕, 세종, 흥선 대원군)은 첫 글자, 세 글자 이름(이순신)은 가운데 글자, 그 밖에는 첫 글자.
 */
export function avatarChar(name: string): string {
  const compact = name.replace(/\s+/g, "");
  if (ROYAL_SUFFIX.test(compact) && compact.length <= 4) return compact[0];
  if (compact.length === 3) return compact[1];
  return compact[0];
}

/** 초 → "0:42" */
export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}
