import type { Question } from "../../types";

// 일제강점기 (1910 ~ 1945.8.15) — 동작 확인용 샘플
export const colonialQuestions: Question[] = [
  {
    id: "colonial-001",
    era: "colonial",
    question:
      "1919년 전국적으로 일어나 대한민국 임시 정부 수립의 계기가 된 만세 운동은?",
    options: [
      "6·10 만세 운동",
      "3·1 운동",
      "광주 학생 항일 운동",
      "물산 장려 운동",
    ],
    answer: 1,
    explanation:
      "3·1 운동(1919)은 독립 선언을 계기로 전국과 해외로 퍼졌고, 같은 해 대한민국 임시 정부 수립으로 이어졌다. 6·10 만세 운동은 1926년, 광주 학생 항일 운동은 1929년, 물산 장려 운동은 1920년대의 경제 자립 운동이다.",
    tipId: "tip-colonial-001",
    year: 1919,
    tags: ["3·1 운동", "대한민국 임시 정부"],
  },
];
