// 문제 뽑기·채점 로직 (퀴즈 화면 전용).
// 렌더링 중이 아니라 "시작" 같은 클릭 처리에서 호출한다. (stats를 넘기지 않으면 storage에서 한 번 읽음)
import { questions as allQuestions } from "../data/questions";
import type { Era, Question, QuestionStat } from "../types";
import { retention } from "./memory";
import { getStats, isInWrongNote } from "./storage";

/** 특정 시대 / 전체 랜덤 / 약점 집중 */
export type QuizMode = Era | "all" | "weak";

export const DEFAULT_QUIZ_SIZE = 10;

type StatMap = Record<string, QuestionStat>;

/** Fisher–Yates 섞기 (원본은 그대로 둔다) */
export function shuffle<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 출제 우선순위 점수 (낮을수록 먼저 나옴).
 * 안 푼 문제 0 → 기억 확률이 낮은 문제 순. 오답노트에 있는 문제는 점수를 절반으로 낮춰 더 자주 나오게 한다.
 */
function priority(stat: QuestionStat | undefined, now: number): number {
  if (!stat) return 0;
  const p = retention(stat, now);
  return isInWrongNote(stat) ? p / 2 : p;
}

const questionById = new Map(allQuestions.map((q) => [q.id, q]));

/**
 * 약점 순위 (퀴즈 "약점 집중"과 대시보드 "약점 TOP 5"가 같은 기준을 쓴다).
 * 푼 문제 중 오답노트 문제 먼저 → 기억 확률이 낮은 순. 데이터에 없는 문제 기록은 뺀다.
 */
export function rankWeakStats(
  stats: StatMap,
  now: number = Date.now(),
): QuestionStat[] {
  return Object.values(stats)
    .filter((stat) => questionById.has(stat.questionId))
    .map((stat) => ({
      stat,
      note: isInWrongNote(stat) ? 0 : 1,
      p: retention(stat, now),
    }))
    .sort((a, b) => a.note - b.note || a.p - b.p)
    .map(({ stat }) => stat);
}

/** 실제로 존재하는 문제의 풀이 기록이 하나라도 있는지 (약점 집중 버튼 활성화용) */
export function hasStudyRecord(stats: StatMap): boolean {
  return allQuestions.some((q) => stats[q.id] !== undefined);
}

/**
 * 퀴즈 문제 세트를 만든다. 문제가 count보다 적으면 있는 만큼만.
 * - 시대 / "all": 안 푼 문제와 기억 확률이 낮은 문제를 우선으로 뽑고, 순서는 섞는다.
 * - "weak": 푼 문제 중 오답노트 문제 → 기억 확률이 낮은 문제 순으로 뽑는다.
 */
export function buildQuizSet(
  mode: QuizMode,
  count: number = DEFAULT_QUIZ_SIZE,
  stats: StatMap = getStats(),
  now: number = Date.now(),
): Question[] {
  if (mode === "weak") {
    const ranked = rankWeakStats(stats, now)
      .slice(0, count)
      .flatMap((stat) => {
        const q = questionById.get(stat.questionId);
        return q ? [q] : [];
      });
    return shuffle(ranked);
  }

  const pool =
    mode === "all" ? allQuestions : allQuestions.filter((q) => q.era === mode);
  // 먼저 섞은 뒤 안정 정렬 → 우선순위가 같은 문제끼리는 무작위 순서가 된다
  const picked = shuffle(pool)
    .sort((a, b) => priority(stats[a.id], now) - priority(stats[b.id], now))
    .slice(0, count);
  return shuffle(picked);
}

/** 채점 */
export function isCorrectChoice(question: Question, choice: number): boolean {
  return question.answer === choice;
}

export interface EraProgress {
  total: number; // 이 시대 문제 수
  solved: number; // 한 번이라도 푼 문제 수
  correct: number; // 누적 정답 횟수
  attempts: number; // 누적 풀이 횟수
  rate: number | null; // 정답률 0~1 (푼 적 없으면 null)
}

/** 시대별 문제 수와 내 정답률 */
export function getEraProgress(era: Era, stats: StatMap): EraProgress {
  const eraQuestions = allQuestions.filter((q) => q.era === era);
  let solved = 0;
  let correct = 0;
  let attempts = 0;
  for (const q of eraQuestions) {
    const stat = stats[q.id];
    if (!stat) continue;
    solved += 1;
    correct += stat.correct;
    attempts += stat.correct + stat.wrong;
  }
  return {
    total: eraQuestions.length,
    solved,
    correct,
    attempts,
    rate: attempts > 0 ? correct / attempts : null,
  };
}

export interface QuestionSnapshot {
  retention: number | null; // null = 새 문제
  needsReview: boolean; // 오답노트에 있는 문제
}

/** 퀴즈 시작 시점의 문제 상태. 풀고 나면 값이 바뀌므로 시작할 때 고정해 둔다 */
export function snapshotQuizState(
  quiz: Question[],
  stats: StatMap,
  now: number = Date.now(),
): Record<string, QuestionSnapshot> {
  return Object.fromEntries(
    quiz.map((q) => {
      const stat = stats[q.id];
      return [
        q.id,
        {
          retention: stat ? retention(stat, now) : null,
          needsReview: stat ? isInWrongNote(stat) : false,
        },
      ];
    }),
  );
}

/**
 * 보기 순서를 섞은 새 문제 객체를 돌려준다 (id·해설은 그대로).
 * answer는 원래 정답 보기가 옮겨 간 위치로 다시 매핑되므로 채점은 그대로 question.answer와 비교하면 된다.
 */
export function shuffleOptions(
  question: Question,
  random: () => number = Math.random,
): Question {
  const order = shuffle([0, 1, 2, 3], random);
  const options = order.map((i) => question.options[i]) as Question["options"];
  const answer = order.indexOf(question.answer) as Question["answer"];
  return { ...question, options, answer };
}

/** 퀴즈 시작 준비: 보기를 섞고, 시작 시점 상태를 고정한다 (퀴즈·오답노트 공통) */
export function prepareQuiz(
  questions: Question[],
  stats: StatMap,
  now: number = Date.now(),
): { quiz: Question[]; snapshot: Record<string, QuestionSnapshot> } {
  const quiz = questions.map((q) => shuffleOptions(q));
  return { quiz, snapshot: snapshotQuizState(quiz, stats, now) };
}
