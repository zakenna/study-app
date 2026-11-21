// 기출 OMR 채점 엔진 — 🔒 팀장 소유. 화면(ExamPage)과 대시보드가 함께 쓴다.
import type { Exam, ExamEra } from "../data/exams";
import type { Era } from "../types";

/** 응시 답안: 문항 순서대로 0(빈칸) 또는 1~5 */
export type ExamAnswers = number[];

export type ExamGrade = "1급" | "2급" | "3급" | "불합격";

/** 심화 급수 판정: 80↑ 1급 / 70↑ 2급 / 60↑ 3급 / 미만 불합격 */
export function gradeFor(score: number): ExamGrade {
  if (score >= 80) return "1급";
  if (score >= 70) return "2급";
  if (score >= 60) return "3급";
  return "불합격";
}

export interface EraScore {
  era: ExamEra;
  correct: number;
  total: number;
  rate: number; // 0~1
}

export interface ExamScore {
  score: number; // 배점 반영 점수
  maxScore: number;
  correctCount: number;
  blankCount: number;
  perQuestion: boolean[]; // 문항별 정답 여부
  eraScores: EraScore[]; // 문항이 있는 시대만
  grade: ExamGrade;
}

export function scoreExam(exam: Exam, answers: ExamAnswers): ExamScore {
  const perQuestion = exam.questions.map((q, i) => answers[i] === q.answer);
  const score = exam.questions.reduce(
    (sum, q, i) => sum + (perQuestion[i] ? q.points : 0),
    0,
  );
  const maxScore = exam.questions.reduce((sum, q) => sum + q.points, 0);

  const byEra = new Map<ExamEra, { correct: number; total: number }>();
  exam.questions.forEach((q, i) => {
    const cur = byEra.get(q.era) ?? { correct: 0, total: 0 };
    cur.total += 1;
    if (perQuestion[i]) cur.correct += 1;
    byEra.set(q.era, cur);
  });
  const eraScores = [...byEra.entries()].map(([era, v]) => ({
    era,
    ...v,
    rate: v.total > 0 ? v.correct / v.total : 0,
  }));

  return {
    score,
    maxScore,
    correctCount: perQuestion.filter(Boolean).length,
    blankCount: exam.questions.filter((_, i) => !answers[i]).length,
    perQuestion,
    eraScores,
    grade: gradeFor(score),
  };
}

/** 가장 약한 시대 (통합 문항 제외). 정답률이 같으면 문항이 많은 시대 */
export function weakestEra(eraScores: EraScore[]): Era | null {
  const candidates = eraScores.filter(
    (s): s is EraScore & { era: Era } => s.era !== "integrated",
  );
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort(
    (a, b) => a.rate - b.rate || b.total - a.total,
  );
  return sorted[0].rate < 1 ? sorted[0].era : null;
}
