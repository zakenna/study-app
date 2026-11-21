// 화면 표시용 이름 — 🔒 팀장 소유. 시대 선택, 배지 등에서 공통으로 쓴다.
import type { Era, Tip } from "../types";

/** 시대 순서 (선택 목록·정렬용) */
export const ERAS: Era[] = [
  "prehistoric",
  "three-kingdoms",
  "north-south",
  "goryeo",
  "joseon-early",
  "joseon-late",
  "modern",
  "colonial",
  "contemporary",
];

export const ERA_LABELS: Record<Era, string> = {
  prehistoric: "선사·고조선",
  "three-kingdoms": "삼국",
  "north-south": "남북국",
  goryeo: "고려",
  "joseon-early": "조선 전기",
  "joseon-late": "조선 후기",
  modern: "개항기(근대)",
  colonial: "일제강점기",
  contemporary: "현대",
};

/** 연도 표시: 음수는 기원전 (-108 → "기원전 108년", 1592 → "1592년") */
export function formatYear(year: number): string {
  return year < 0 ? `기원전 ${Math.abs(year)}년` : `${year}년`;
}

export const TIP_KIND_LABELS: Record<Tip["kind"], string> = {
  number: "숫자 말장난",
  acronym: "두문자",
  story: "이야기",
};
