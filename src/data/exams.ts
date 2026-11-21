// 한국사능력검정시험 기출 회차 데이터 (OMR 채점용).
// ⚖️ 저작권 원칙: 기출문제 원문(지문·사료·보기·그림)은 절대 저장·표시하지 않는다.
//    저장하는 것은 사실 정보만 — 회차, 시행일, 문항 번호, 정답 번호(1~5), 배점, 우리가 분류한 시대.
//    문제는 국사편찬위원회 공식 시험 자료실 링크로만 안내한다.
import type { Era } from "../types";

/** 시대에 넣기 어려운 통합·지역사 문항은 "integrated" (Era 타입은 그대로 두고 여기서만 쓴다) */
export type ExamEra = Era | "integrated";

export interface ExamQuestion {
  no: number; // 1~50
  answer: 1 | 2 | 3 | 4 | 5; // 정답 번호
  points: number; // 배점
  era: ExamEra; // 우리가 분류한 시대
}

export interface Exam {
  id: string; // "advanced-80"
  round: number; // 회차
  date: string; // 시행일 "YYYY-MM-DD"
  level: "advanced"; // 심화
  questions: ExamQuestion[]; // 50문항, 배점 합계 100
  isSample?: boolean; // 개발 확인용 가짜 회차 (실제 데이터를 넣으면 삭제)
}

export const EXAM_SOURCE_LABEL = "정답 출처: 국사편찬위원회 한국사능력검정시험";
/** 공식 시험 자료실 (기출 문제지·정답표) */
export const EXAM_BOARD_URL =
  "https://www.historyexam.go.kr/pst/list.do?bbs=dat";
export const EXAM_MINUTES = 80;
export const EXAM_QUESTION_COUNT = 50;

/* ---------- ⚠️ 개발 확인용 샘플 회차 (가짜 정답) — 공식 정답을 넣으면 삭제 ---------- */
const SAMPLE_ERAS: ExamEra[] = [
  "prehistoric",
  "prehistoric",
  "three-kingdoms",
  "three-kingdoms",
  "three-kingdoms",
  "three-kingdoms",
  "north-south",
  "north-south",
  "north-south",
  "north-south",
  "goryeo",
  "goryeo",
  "goryeo",
  "goryeo",
  "goryeo",
  "joseon-early",
  "joseon-early",
  "joseon-early",
  "joseon-early",
  "joseon-early",
  "joseon-late",
  "joseon-late",
  "joseon-late",
  "joseon-late",
  "joseon-late",
  "modern",
  "modern",
  "modern",
  "modern",
  "modern",
  "modern",
  "colonial",
  "colonial",
  "colonial",
  "colonial",
  "colonial",
  "colonial",
  "colonial",
  "contemporary",
  "contemporary",
  "contemporary",
  "contemporary",
  "contemporary",
  "contemporary",
  "integrated",
  "integrated",
  "integrated",
  "joseon-late",
  "goryeo",
  "colonial",
];
const SAMPLE_ANSWER_PATTERN = [3, 1, 4, 2, 5, 2, 4, 1, 5, 3] as const;

const sampleExam: Exam = {
  id: "sample",
  round: 0,
  date: "2026-01-01",
  level: "advanced",
  isSample: true,
  questions: SAMPLE_ERAS.map((era, i) => ({
    no: i + 1,
    answer: SAMPLE_ANSWER_PATTERN[(i * 3) % SAMPLE_ANSWER_PATTERN.length],
    points: 2, // 50문항 × 2점 = 100점
    era,
  })),
};

/** 공식 회차는 여기에 추가한다 (최신 회차가 앞) */
export const exams: Exam[] = [sampleExam];

export function getExamById(id: string): Exam | undefined {
  return exams.find((exam) => exam.id === id);
}
