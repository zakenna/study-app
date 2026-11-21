import type { Question } from "../../types";

// 조선 전기 (1392 조선 건국 ~ 임진왜란 전)
export const joseonEarlyQuestions: Question[] = [
  {
    id: "joseon-early-001",
    era: "joseon-early",
    question: "세종 때 창제되어 1446년에 반포된, 백성을 위한 우리 문자는?",
    options: ["이두", "향찰", "구결", "훈민정음"],
    answer: 3,
    explanation:
      "세종은 1443년 훈민정음을 창제하고 1446년에 반포했다. 이두·향찰·구결은 한자의 소리와 뜻을 빌려 우리말을 적던 표기법이다.",
    tipId: "tip-joseon-early-004",
    year: 1446,
    tags: ["세종", "훈민정음"],
  },
  {
    id: "joseon-early-002",
    era: "joseon-early",
    question:
      "사병을 혁파하고 호패법을 처음 실시하였으며 신문고를 설치한 왕은?",
    options: ["태조", "세조", "태종", "성종"],
    answer: 2,
    explanation:
      "태종은 사병을 없애 군사권을 장악하고, 호패법으로 인구를 파악했으며, 신문고를 설치하였다. 태조는 한양 천도, 세조는 직전법 실시와 『경국대전』 편찬 시작, 성종은 『경국대전』 완성·반포로 알려져 있다.",
    tipId: "tip-joseon-early-001",
    tags: ["조선", "태종", "호패법"],
  },
  {
    id: "joseon-early-003",
    era: "joseon-early",
    question: "세종 때 편찬된 것으로, 우리 풍토에 맞는 농사법을 정리한 농서는?",
    options: ["금양잡록", "농사직설", "농가집성", "산림경제"],
    answer: 1,
    explanation:
      "『농사직설』은 세종 때 각 지역 농부들의 경험을 모아 우리 실정에 맞게 펴낸 농서이다. 『금양잡록』은 성종 때 강희맹, 『농가집성』은 효종 때 신속, 『산림경제』는 숙종 때 홍만선이 지었다.",
    tags: ["세종", "농사직설", "경제"],
  },
  {
    id: "joseon-early-004",
    era: "joseon-early",
    question: "현직 관리에게만 수조권을 지급하는 직전법을 실시한 왕은?",
    options: ["세조", "세종", "성종", "명종"],
    answer: 0,
    explanation:
      "세조는 지급할 토지가 부족해지자 과전법을 고쳐 현직 관리에게만 수조권을 주는 직전법(1466)을 실시하였다. 세종은 공법(전분 6등법·연분 9등법), 성종은 관수관급제를 시행했으며, 명종 때 직전법이 폐지되었다.",
    tipId: "tip-joseon-early-003",
    year: 1466,
    tags: ["조선", "세조", "직전법", "경제"],
  },
  {
    id: "joseon-early-005",
    era: "joseon-early",
    question:
      "현량과 실시, 소격서 폐지 등 개혁을 추진하다가 기묘사화로 화를 입은 인물은?",
    options: ["조광조", "김종직", "정도전", "이황"],
    answer: 0,
    explanation:
      "중종 때 조광조는 현량과로 사림을 등용하고 소격서를 폐지했으며 위훈 삭제를 추진하다 기묘사화(1519)로 제거되었다. 김종직의 「조의제문」은 무오사화(1498)의 원인이 되었고, 정도전은 조선 건국의 설계자, 이황은 『성학십도』를 지은 성리학자이다.",
    tipId: "tip-joseon-early-002",
    year: 1519,
    tags: ["조선", "조광조", "기묘사화", "사림"],
  },
];
