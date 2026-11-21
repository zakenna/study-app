import type { Question } from "../../types";

// 조선 후기 (1592 임진왜란 ~ 1863 흥선대원군 집권 전) — 동작 확인용 샘플
export const joseonLateQuestions: Question[] = [
  {
    id: "joseon-late-001",
    era: "joseon-late",
    question: "1592년 일본의 침략으로 시작된 전쟁은?",
    options: ["임진왜란", "정묘호란", "병자호란", "병인양요"],
    answer: 0,
    explanation:
      "임진왜란은 1592년(선조 25) 일본의 침략으로 시작되었다. 정묘호란(1627)은 후금, 병자호란(1636)은 청의 침입이고, 병인양요(1866)는 프랑스의 침입이다.",
    tipId: "tip-joseon-late-001",
    year: 1592,
    tags: ["임진왜란", "선조", "이순신"],
  },
];
