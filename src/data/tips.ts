// 암기 꿀팁 (담당: D) — 지금은 동작 확인용 샘플 2개.
// id 형식: tip-<era>-번호 3자리. 숫자 말장난은 숫자가 실제 연도와 정확히 일치해야 한다.
import type { Tip } from "../types";

export const tips: Tip[] = [
  {
    id: "tip-joseon-late-001",
    era: "joseon-late",
    year: 1592,
    kind: "number",
    text: "일(1)본군이 오(5)자, 구(9)국의 영웅 이(2)순신!",
  },
  {
    id: "tip-colonial-001",
    era: "colonial",
    year: 1919,
    kind: "number",
    text: "일어나 구하자! 일어나 구하자!(1919)",
  },
];

export function getTipById(tipId: string): Tip | undefined {
  return tips.find((tip) => tip.id === tipId);
}
