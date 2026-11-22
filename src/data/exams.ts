// 한국사능력검정시험 기출 회차 데이터 (OMR 채점용).
// ⚖️ 저작권 원칙: 기출문제 원문(지문·사료·보기·그림)은 절대 저장·표시하지 않는다.
//    저장하는 것은 사실 정보만 — 회차, 자료 게시일, 문항 번호, 정답 번호(1~5), 배점, 우리가 분류한 시대.
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
  postedAt: string; // 공식 시험 자료실 게시일 "YYYY-MM-DD" (시행일은 자료에 인쇄되어 있지 않음)
  level: "advanced"; // 심화
  questions: ExamQuestion[]; // 50문항, 배점 합계 100
  isSample?: boolean; // 개발 확인용 가짜 회차 표시 (지금은 쓰지 않음)
  /**
   * CBT 응시용: 문항 번호 → 공식 문제지 PDF의 페이지 번호 (index 0 = 1번 문항).
   * 사실 정보(쪽수)만 적는다. 문제지 원문·이미지는 저장하지 않는다.
   */
  questionPages?: number[];
}

export const EXAM_SOURCE_LABEL = "정답 출처: 국사편찬위원회 한국사능력검정시험";
/** 공식 시험 자료실 (기출 문제지·정답표) */
export const EXAM_BOARD_URL =
  "https://www.historyexam.go.kr/pst/list.do?bbs=dat";
export const EXAM_MINUTES = 80;

/**
 * 다가오는 시험 (온보딩·프로필의 시험 날짜 빠른 선택 버튼).
 * 국사편찬위원회 한국사능력검정시험 공식 사이트 배너에서 확인한 시행일만 적는다. 날짜가 지나면 버튼이 숨겨진다.
 */
export const UPCOMING_EXAMS: { round: number; date: string }[] = [
  { round: 81, date: "2026-11-28" },
];
export const EXAM_QUESTION_COUNT = 50;

/** 쪽마다 첫 문항 번호 목록 → 문항별 쪽 번호 배열 (index 0 = 1번) */
function pagesFromStarts(starts: number[]): number[] {
  return Array.from(
    { length: EXAM_QUESTION_COUNT },
    (_, i) => starts.filter((first) => first <= i + 1).length,
  );
}

/**
 * 공식 회차 (최신 회차가 앞).
 * - 정답·배점: 국사편찬위원회 시험 자료실의 각 회차 "심화 정답표"에서 옮김
 *   (정답표의 답지번호별·문항배점별 빈도표와 대조 검증, 배점 합계 100)
 * - 시대(era): 우리가 문제지를 보고 분류한 값 (문제 원문은 저장하지 않음)
 * - postedAt: 공식 시험 자료실 게시일 (문제지·정답표에 시행일이 인쇄되어 있지 않아 시행일 대신 사실 그대로 게시일을 둔다)
 */
export const exams: Exam[] = [
  {
    id: "advanced-80",
    round: 80,
    postedAt: "2026-10-17",
    level: "advanced",
    // 문제지 12쪽: 1~4 / 5~9 / 10~13 / 14~17 / 18~21 / 22~26 / 27~30 / 31~34 / 35~38 / 39~42 / 43~46 / 47~50
    questionPages: pagesFromStarts([
      1, 5, 10, 14, 18, 22, 27, 31, 35, 39, 43, 47,
    ]),
    questions: [
      { no: 1, answer: 1, points: 1, era: "prehistoric" },
      { no: 2, answer: 2, points: 2, era: "three-kingdoms" },
      { no: 3, answer: 4, points: 2, era: "three-kingdoms" },
      { no: 4, answer: 1, points: 2, era: "three-kingdoms" },
      { no: 5, answer: 2, points: 3, era: "three-kingdoms" },
      { no: 6, answer: 2, points: 3, era: "north-south" },
      { no: 7, answer: 1, points: 2, era: "north-south" },
      { no: 8, answer: 1, points: 1, era: "north-south" },
      { no: 9, answer: 5, points: 2, era: "north-south" },
      { no: 10, answer: 2, points: 2, era: "north-south" },
      { no: 11, answer: 1, points: 3, era: "goryeo" },
      { no: 12, answer: 2, points: 2, era: "goryeo" },
      { no: 13, answer: 4, points: 1, era: "goryeo" },
      { no: 14, answer: 2, points: 2, era: "goryeo" },
      { no: 15, answer: 3, points: 2, era: "goryeo" },
      { no: 16, answer: 5, points: 3, era: "goryeo" },
      { no: 17, answer: 2, points: 1, era: "goryeo" },
      { no: 18, answer: 1, points: 2, era: "goryeo" },
      { no: 19, answer: 5, points: 2, era: "goryeo" },
      { no: 20, answer: 4, points: 2, era: "joseon-early" },
      { no: 21, answer: 3, points: 2, era: "joseon-early" },
      { no: 22, answer: 4, points: 2, era: "joseon-late" },
      { no: 23, answer: 1, points: 2, era: "joseon-late" },
      { no: 24, answer: 5, points: 3, era: "joseon-late" },
      { no: 25, answer: 2, points: 1, era: "joseon-late" },
      { no: 26, answer: 5, points: 2, era: "joseon-late" },
      { no: 27, answer: 4, points: 2, era: "joseon-late" },
      { no: 28, answer: 5, points: 1, era: "modern" },
      { no: 29, answer: 5, points: 2, era: "modern" },
      { no: 30, answer: 4, points: 3, era: "modern" },
      { no: 31, answer: 1, points: 2, era: "modern" },
      { no: 32, answer: 3, points: 2, era: "modern" },
      { no: 33, answer: 5, points: 3, era: "modern" },
      { no: 34, answer: 3, points: 2, era: "modern" },
      { no: 35, answer: 2, points: 1, era: "colonial" },
      { no: 36, answer: 3, points: 2, era: "colonial" },
      { no: 37, answer: 3, points: 3, era: "colonial" },
      { no: 38, answer: 1, points: 1, era: "colonial" },
      { no: 39, answer: 5, points: 2, era: "colonial" },
      { no: 40, answer: 5, points: 2, era: "colonial" },
      { no: 41, answer: 4, points: 1, era: "colonial" },
      { no: 42, answer: 4, points: 2, era: "colonial" },
      { no: 43, answer: 1, points: 2, era: "colonial" },
      { no: 44, answer: 1, points: 1, era: "contemporary" },
      { no: 45, answer: 2, points: 2, era: "contemporary" },
      { no: 46, answer: 3, points: 2, era: "contemporary" },
      { no: 47, answer: 3, points: 2, era: "contemporary" },
      { no: 48, answer: 3, points: 2, era: "contemporary" },
      { no: 49, answer: 4, points: 3, era: "contemporary" },
      { no: 50, answer: 5, points: 3, era: "integrated" },
    ],
  },
  {
    id: "advanced-79",
    round: 79,
    postedAt: "2026-08-09",
    level: "advanced",
    // 문제지 12쪽: 1~4 / 5~9 / 10~13 / 14~17 / 18~21 / 22~25 / 26~29 / 30~34 / 35~38 / 39~42 / 43~46 / 47~50
    questionPages: pagesFromStarts([
      1, 5, 10, 14, 18, 22, 26, 30, 35, 39, 43, 47,
    ]),
    questions: [
      { no: 1, answer: 2, points: 1, era: "prehistoric" },
      { no: 2, answer: 4, points: 1, era: "three-kingdoms" },
      { no: 3, answer: 2, points: 2, era: "three-kingdoms" },
      { no: 4, answer: 1, points: 1, era: "three-kingdoms" },
      { no: 5, answer: 2, points: 3, era: "three-kingdoms" },
      { no: 6, answer: 1, points: 3, era: "three-kingdoms" },
      { no: 7, answer: 3, points: 1, era: "north-south" },
      { no: 8, answer: 2, points: 2, era: "north-south" },
      { no: 9, answer: 5, points: 2, era: "north-south" },
      { no: 10, answer: 3, points: 2, era: "north-south" },
      { no: 11, answer: 5, points: 2, era: "goryeo" },
      { no: 12, answer: 5, points: 2, era: "goryeo" },
      { no: 13, answer: 1, points: 3, era: "goryeo" },
      { no: 14, answer: 3, points: 2, era: "goryeo" },
      { no: 15, answer: 3, points: 2, era: "goryeo" },
      { no: 16, answer: 3, points: 1, era: "goryeo" },
      { no: 17, answer: 4, points: 2, era: "goryeo" },
      { no: 18, answer: 5, points: 3, era: "goryeo" },
      { no: 19, answer: 5, points: 2, era: "joseon-early" },
      { no: 20, answer: 4, points: 2, era: "joseon-early" },
      { no: 21, answer: 2, points: 1, era: "joseon-late" },
      { no: 22, answer: 4, points: 3, era: "joseon-late" },
      { no: 23, answer: 4, points: 2, era: "joseon-late" },
      { no: 24, answer: 3, points: 2, era: "joseon-early" },
      { no: 25, answer: 1, points: 3, era: "joseon-late" },
      { no: 26, answer: 3, points: 2, era: "joseon-late" },
      { no: 27, answer: 1, points: 1, era: "joseon-late" },
      { no: 28, answer: 5, points: 1, era: "modern" },
      { no: 29, answer: 1, points: 2, era: "modern" },
      { no: 30, answer: 2, points: 2, era: "modern" },
      { no: 31, answer: 2, points: 3, era: "modern" },
      { no: 32, answer: 1, points: 2, era: "modern" },
      { no: 33, answer: 4, points: 2, era: "modern" },
      { no: 34, answer: 2, points: 2, era: "modern" },
      { no: 35, answer: 2, points: 1, era: "modern" },
      { no: 36, answer: 1, points: 3, era: "colonial" },
      { no: 37, answer: 3, points: 3, era: "colonial" },
      { no: 38, answer: 5, points: 2, era: "colonial" },
      { no: 39, answer: 5, points: 2, era: "colonial" },
      { no: 40, answer: 4, points: 2, era: "colonial" },
      { no: 41, answer: 1, points: 1, era: "colonial" },
      { no: 42, answer: 4, points: 2, era: "colonial" },
      { no: 43, answer: 3, points: 2, era: "colonial" },
      { no: 44, answer: 4, points: 2, era: "colonial" },
      { no: 45, answer: 5, points: 2, era: "contemporary" },
      { no: 46, answer: 1, points: 2, era: "colonial" },
      { no: 47, answer: 2, points: 2, era: "contemporary" },
      { no: 48, answer: 5, points: 2, era: "contemporary" },
      { no: 49, answer: 2, points: 2, era: "contemporary" },
      { no: 50, answer: 3, points: 3, era: "integrated" },
    ],
  },
  {
    id: "advanced-78",
    round: 78,
    postedAt: "2026-05-23",
    level: "advanced",
    // 문제지 12쪽: 1~4 / 5~8 / 9~12 / 13~16 / 17~20 / 21~25 / 26~29 / 30~34 / 35~38 / 39~42 / 43~46 / 47~50
    questionPages: pagesFromStarts([
      1, 5, 9, 13, 17, 21, 26, 30, 35, 39, 43, 47,
    ]),
    questions: [
      { no: 1, answer: 5, points: 1, era: "prehistoric" },
      { no: 2, answer: 2, points: 3, era: "prehistoric" },
      { no: 3, answer: 1, points: 2, era: "three-kingdoms" },
      { no: 4, answer: 5, points: 3, era: "three-kingdoms" },
      { no: 5, answer: 2, points: 2, era: "three-kingdoms" },
      { no: 6, answer: 4, points: 2, era: "three-kingdoms" },
      { no: 7, answer: 4, points: 1, era: "three-kingdoms" },
      { no: 8, answer: 3, points: 2, era: "north-south" },
      { no: 9, answer: 3, points: 2, era: "north-south" },
      { no: 10, answer: 4, points: 2, era: "north-south" },
      { no: 11, answer: 4, points: 2, era: "goryeo" },
      { no: 12, answer: 3, points: 1, era: "goryeo" },
      { no: 13, answer: 5, points: 1, era: "goryeo" },
      { no: 14, answer: 3, points: 2, era: "goryeo" },
      { no: 15, answer: 4, points: 2, era: "goryeo" },
      { no: 16, answer: 3, points: 2, era: "goryeo" },
      { no: 17, answer: 5, points: 2, era: "goryeo" },
      { no: 18, answer: 4, points: 2, era: "goryeo" },
      { no: 19, answer: 1, points: 3, era: "joseon-early" },
      { no: 20, answer: 5, points: 3, era: "joseon-early" },
      { no: 21, answer: 1, points: 3, era: "joseon-early" },
      { no: 22, answer: 4, points: 2, era: "joseon-late" },
      { no: 23, answer: 1, points: 3, era: "joseon-late" },
      { no: 24, answer: 5, points: 1, era: "joseon-late" },
      { no: 25, answer: 1, points: 2, era: "joseon-late" },
      { no: 26, answer: 5, points: 1, era: "joseon-late" },
      { no: 27, answer: 2, points: 2, era: "joseon-late" },
      { no: 28, answer: 2, points: 2, era: "modern" },
      { no: 29, answer: 1, points: 2, era: "modern" },
      { no: 30, answer: 2, points: 3, era: "modern" },
      { no: 31, answer: 4, points: 2, era: "modern" },
      { no: 32, answer: 3, points: 2, era: "modern" },
      { no: 33, answer: 2, points: 2, era: "modern" },
      { no: 34, answer: 4, points: 1, era: "modern" },
      { no: 35, answer: 3, points: 3, era: "colonial" },
      { no: 36, answer: 1, points: 1, era: "colonial" },
      { no: 37, answer: 3, points: 3, era: "colonial" },
      { no: 38, answer: 4, points: 2, era: "colonial" },
      { no: 39, answer: 2, points: 2, era: "colonial" },
      { no: 40, answer: 4, points: 2, era: "colonial" },
      { no: 41, answer: 2, points: 2, era: "colonial" },
      { no: 42, answer: 1, points: 2, era: "colonial" },
      { no: 43, answer: 1, points: 2, era: "colonial" },
      { no: 44, answer: 5, points: 2, era: "contemporary" },
      { no: 45, answer: 5, points: 1, era: "contemporary" },
      { no: 46, answer: 2, points: 2, era: "contemporary" },
      { no: 47, answer: 2, points: 1, era: "contemporary" },
      { no: 48, answer: 5, points: 3, era: "contemporary" },
      { no: 49, answer: 2, points: 2, era: "contemporary" },
      { no: 50, answer: 5, points: 2, era: "integrated" },
    ],
  },
];

export function getExamById(id: string): Exam | undefined {
  return exams.find((exam) => exam.id === id);
}
