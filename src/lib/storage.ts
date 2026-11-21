// localStorage 읽기/쓰기 (docs/GUIDELINE.md 2장, 3-2, 3-4) — 🔒 팀장 소유.
// localStorage는 반드시 이 파일을 통해서만 접근한다.
// 시크릿 모드·저장 공간 부족·깨진 JSON에서도 앱이 멈추지 않도록 모든 접근을 try/catch로 감싼다.
import type { Profile, QuestionStat, StudyLog, TipVote } from "../types";
import { calcStudyStreak, toDateKey } from "./date";
import { INITIAL_STRENGTH, updateStrength } from "./memory";

export const STORAGE_KEYS = {
  profile: "studyapp:profile",
  stats: "studyapp:stats",
  studyLogs: "studyapp:studyLogs",
  tipVotes: "studyapp:tipVotes",
  timelineBest: "studyapp:timelineBest",
} as const;

/**
 * 저장 데이터가 바뀌면 window에 발생하는 이벤트 이름.
 * 화면에서 직접 구독하지 말고 lib/useStudyData.ts 훅을 쓴다.
 */
export const STUDY_CHANGE_EVENT = "studyapp:change";

/** 모든 공개 쓰기 함수의 마지막에 한 번 호출한다 */
function notifyChange(): void {
  try {
    window.dispatchEvent(new Event(STUDY_CHANGE_EVENT));
  } catch {
    // window가 없는 환경(테스트 등)에서는 무시
  }
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ---------- 프로필 (온보딩) ---------- */

export function getProfile(): Profile | null {
  const profile = read<Profile | null>(STORAGE_KEYS.profile, null);
  return profile && typeof profile.name === "string" ? profile : null;
}

export function saveProfile(profile: Profile): boolean {
  const ok = write(STORAGE_KEYS.profile, profile);
  notifyChange();
  return ok;
}

/* ---------- 문제별 기록 ---------- */

type StatMap = Record<string, QuestionStat>;

export function getStats(): StatMap {
  const stats = read<StatMap>(STORAGE_KEYS.stats, {});
  return stats && typeof stats === "object" ? stats : {};
}

export function getStat(questionId: string): QuestionStat | undefined {
  return getStats()[questionId];
}

export function createStat(
  questionId: string,
  now: number = Date.now(),
): QuestionStat {
  return {
    questionId,
    correct: 0,
    wrong: 0,
    correctStreak: 0,
    strength: INITIAL_STRENGTH,
    lastReviewedAt: now,
  };
}

/**
 * 문제를 하나 풀 때마다 호출한다.
 * 문제 기록(정답/오답 수, 연속 정답, strength)과 오늘의 학습 기록을 함께 갱신한다.
 */
export function recordAnswer(
  questionId: string,
  isCorrect: boolean,
  now: number = Date.now(),
): QuestionStat {
  const stats = getStats();
  const prev = stats[questionId] ?? createStat(questionId, now);
  const next: QuestionStat = {
    ...prev,
    correct: prev.correct + (isCorrect ? 1 : 0),
    wrong: prev.wrong + (isCorrect ? 0 : 1),
    correctStreak: isCorrect ? prev.correctStreak + 1 : 0,
    strength: updateStrength(prev.strength, isCorrect),
    lastReviewedAt: now,
  };
  write(STORAGE_KEYS.stats, { ...stats, [questionId]: next });
  addStudyLog(isCorrect, new Date(now));
  notifyChange(); // 기록 두 개를 모두 쓴 뒤 한 번만 알린다
  return next;
}

/* ---------- 오답노트 (3-2) ---------- */

/** 한 번이라도 틀렸고, 아직 2번 연속 맞히지 못한 문제 */
export function isInWrongNote(stat: QuestionStat): boolean {
  return stat.wrong > 0 && stat.correctStreak < 2;
}

/** 🎓 졸업: 한 번 이상 틀렸고, 이후 2번 연속 맞혀 오답노트에서 빠진 문제 */
export function isGraduated(stat: QuestionStat | undefined): boolean {
  return stat !== undefined && stat.wrong > 0 && stat.correctStreak >= 2;
}

export function getWrongNoteIds(): string[] {
  return Object.values(getStats())
    .filter(isInWrongNote)
    .map((stat) => stat.questionId);
}

/* ---------- 학습 기록 (대시보드) ---------- */

export function getStudyLogs(): StudyLog[] {
  const logs = read<StudyLog[]>(STORAGE_KEYS.studyLogs, []);
  return Array.isArray(logs) ? logs : [];
}

function addStudyLog(isCorrect: boolean, date: Date): void {
  const key = toDateKey(date);
  const logs = getStudyLogs();
  const today = logs.find((log) => log.date === key);
  const updated: StudyLog = {
    date: key,
    solved: (today?.solved ?? 0) + 1,
    correct: (today?.correct ?? 0) + (isCorrect ? 1 : 0),
  };
  write(STORAGE_KEYS.studyLogs, [
    ...logs.filter((log) => log.date !== key),
    updated,
  ]);
}

export function getTodayLog(): StudyLog {
  const key = toDateKey();
  return (
    getStudyLogs().find((log) => log.date === key) ?? {
      date: key,
      solved: 0,
      correct: 0,
    }
  );
}

export function getStudyStreak(): number {
  return calcStudyStreak(getStudyLogs());
}

/* ---------- 꿀팁 "외워졌어요" 토글 (3-4) ---------- */

export function getTipVotes(): TipVote[] {
  const votes = read<TipVote[]>(STORAGE_KEYS.tipVotes, []);
  return Array.isArray(votes) ? votes : [];
}

/** 외워졌어요 여부 (렌더링 중에는 useStudyData의 tipVotes를 넘겨서 쓴다) */
export function isTipMemorized(votes: TipVote[], tipId: string): boolean {
  return votes.some((vote) => vote.tipId === tipId && vote.count > 0);
}

/** 외워졌어요 토글 (꿀팁당 1회, 다시 누르면 취소). 바뀐 뒤의 외워짐 여부를 돌려준다 */
export function toggleTipMemorized(tipId: string): boolean {
  const votes = getTipVotes();
  const wasMemorized = isTipMemorized(votes, tipId);
  const others = votes.filter((vote) => vote.tipId !== tipId);
  write(
    STORAGE_KEYS.tipVotes,
    wasMemorized ? others : [...others, { tipId, count: 1 }],
  );
  notifyChange();
  return !wasMemorized;
}

/* ---------- 타임라인 순서 맞추기 최고 기록 (3-4) ---------- */

/** 연속 성공 라운드 최고 기록 (없으면 0) */
export function getTimelineBest(): number {
  const best = read<number>(STORAGE_KEYS.timelineBest, 0);
  return Number.isFinite(best) && best > 0 ? Math.floor(best) : 0;
}

/** 지금 연속 기록이 최고 기록보다 높으면 저장하고 true를 돌려준다 */
export function saveTimelineBest(streak: number): boolean {
  if (streak <= getTimelineBest()) return false;
  write(STORAGE_KEYS.timelineBest, streak);
  notifyChange();
  return true;
}
