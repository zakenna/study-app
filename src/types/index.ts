// 공용 타입 (docs/GUIDELINE.md 3장) — 🔒 팀장 소유. 추가·변경은 팀장에게 요청.

export type Era =
  | "prehistoric" // 선사·고조선
  | "three-kingdoms" // 삼국
  | "north-south" // 남북국
  | "goryeo" // 고려
  | "joseon-early" // 조선 전기
  | "joseon-late" // 조선 후기
  | "modern" // 개항기(근대)
  | "colonial" // 일제강점기
  | "contemporary"; // 현대

export interface Tip {
  id: string; // "tip-joseon-late-001" (tip-<era>-번호 3자리)
  era: Era;
  year?: number; // 관련 연도 (숫자 말장난이면 필수로 적는다)
  text: string; // "일(1)본군이 오(5)자, 구(9)국의 영웅 이(2)순신!"
  kind: "number" | "acronym" | "story"; // 숫자 말장난 / 두문자 / 이야기
}

export interface Question {
  id: string; // "goryeo-003"
  era: Era;
  question: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string; // 해설 (필수)
  tipId?: string; // 암기 꿀팁 (src/data/tips.ts의 Tip.id)
  year?: number; // 관련 연도 (타임라인에 사용)
  tags?: string[]; // 인물, 사건 키워드
}

export interface TimelineEvent {
  id: string;
  title: string;
  year: number;
  era: Era;
  tipId?: string;
}

export interface PersonMatch {
  id: string;
  person: string;
  deed: string;
  era: Era;
}

export interface QuestionStat {
  questionId: string;
  correct: number;
  wrong: number;
  correctStreak: number; // 연속 정답 수 (오답이면 0으로)
  strength: number; // 망각곡선용, 단위: 일
  lastReviewedAt: number; // ms 타임스탬프 (Date.now())
}

export interface Profile {
  name: string;
  examDate?: string; // "YYYY-MM-DD"
  level: "advanced" | "basic";
  dailyGoal: number;
}

export interface StudyLog {
  date: string; // "YYYY-MM-DD"
  solved: number;
  correct: number;
}

export interface TipVote {
  tipId: string;
  count: number; // "외워졌어요" 토글: 외우면 1로 저장, 취소하면 항목을 지운다
}

/** 화면(탭) 이름 */
export type TabId =
  "dashboard" | "quiz" | "exam" | "wrong-note" | "tips" | "timeline" | "match";

/** 탭 이동과 함께 넘기는 의도 (예: 기출 결과에서 "고려 퀴즈로" → quizEra: "goryeo") */
export interface NavIntent {
  quizEra?: Era;
}

/** 모든 페이지가 받는 props. 다른 탭으로 이동할 때 onNavigate("dashboard")처럼 쓴다 */
export interface PageProps {
  onNavigate: (tab: TabId, intent?: NavIntent) => void;
  /** 이 탭으로 올 때 함께 넘어온 의도 (한 번 쓰고 나면 다음 이동 때 사라짐) */
  intent?: NavIntent;
  /** 프로필 수정 창 열기 (예: 시험일이 지났을 때 "다음 시험 날짜 설정하기") */
  onEditProfile?: () => void;
}

/** 🏯 한옥 테마 계절 (기본: 봄) */
export type Season = "spring" | "summer" | "autumn" | "winter";
