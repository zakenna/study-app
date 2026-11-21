import type { Question } from "../../types";

// 조선 전기 (1392 조선 건국 ~ 임진왜란 전) — 동작 확인용 샘플
export const joseonEarlyQuestions: Question[] = [
  {
    id: "joseon-early-001",
    era: "joseon-early",
    question: "세종 때 창제되어 1446년에 반포된, 백성을 위한 우리 문자는?",
    options: ["이두", "향찰", "훈민정음", "구결"],
    answer: 2,
    explanation:
      "세종은 1443년 훈민정음을 창제하고 1446년에 반포했다. 이두·향찰·구결은 한자의 소리와 뜻을 빌려 우리말을 적던 표기법이다.",
    year: 1446,
    tags: ["세종", "훈민정음"],
  },
];
