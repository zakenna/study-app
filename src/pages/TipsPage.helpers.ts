// 꿀팁 모음 전용 도우미 (연결 문제 찾기, 검색, 암기 카드 앞뒷면)
import { questions as allQuestions } from "../data/questions";
import { tipYearEvents, tips } from "../data/tips";
import { ERA_LABELS, formatYear } from "../lib/labels";
import type { Question, Tip } from "../types";

/** 꿀팁 id → 그 꿀팁을 쓰는 문제들 */
export const questionsByTip: Map<string, Question[]> = (() => {
  const map = new Map<string, Question[]>();
  for (const q of allQuestions) {
    if (!q.tipId) continue;
    map.set(q.tipId, [...(map.get(q.tipId) ?? []), q]);
  }
  return map;
})();

/** 검색 대상 문자열: 꿀팁 문장 + 연결 문제(질문·정답·키워드) + 시대 + 연도 사건 이름 */
const searchIndex = new Map(
  tips.map((tip) => {
    const linked = questionsByTip.get(tip.id) ?? [];
    const parts = [
      tip.text,
      ERA_LABELS[tip.era],
      tip.year !== undefined ? String(tip.year) : "",
      tipYearEvents[tip.id] ?? "",
      ...linked.flatMap((q) => [
        q.question,
        q.options[q.answer],
        ...(q.tags ?? []),
      ]),
    ];
    return [tip.id, normalize(parts.join(" "))];
  }),
);

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

export function matchesSearch(tip: Tip, query: string): boolean {
  const q = normalize(query);
  return q === "" || (searchIndex.get(tip.id) ?? "").includes(q);
}

/** 받침이 있으면 "은", 없으면 "는" (한글이 아니면 "은") */
function topicParticle(word: string): string {
  const code = word.charCodeAt(word.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return "은";
  return (code - 0xac00) % 28 === 0 ? "는" : "은";
}

export interface FlashCardContent {
  prompt: string; // 앞면 질문
  answer: string; // 뒷면 정답
}

/**
 * 암기 카드 앞뒷면.
 * - 숫자 꿀팁: "임진왜란은 몇 년?" → "1592년"
 * - 나머지: 연결된 문제의 질문 → 정답(사건·인물 이름)
 * 만들 수 없으면 null (카드에서 제외)
 */
export function flashCardFor(tip: Tip): FlashCardContent | null {
  const event = tipYearEvents[tip.id];
  if (tip.kind === "number" && event && tip.year !== undefined) {
    return {
      prompt: `${event}${topicParticle(event)} 몇 년?`,
      answer: formatYear(tip.year),
    };
  }
  const linked = questionsByTip.get(tip.id)?.[0];
  if (!linked) return null;
  return { prompt: linked.question, answer: linked.options[linked.answer] };
}
