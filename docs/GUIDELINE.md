# 📜 개발 가이드라인 — 한국사 자격증 학습 앱

> **"틀리는 순간, 외우는 법까지 알려주는 한국사 앱"**
> 한국사능력검정시험을 준비하는 대학생을 위한 개인 맞춤 학습 웹앱

이 문서는 팀원과 모든 Claude Code가 **작업 전에 반드시 읽는** 기준 문서다.
README.md(Git 규칙)와 함께 따른다. 내용이 충돌하면 이 문서를 우선한다.

---

## 1. 기능 범위

### ✅ 필수 (MVP): 이것부터 완성한다
| 기능 | 설명 |
|---|---|
| 시대별 퀴즈 | 시대를 고르고 4지선다로 풀기. 정답·오답 표시, **해설** 제공 |
| 💡 암기 꿀팁 | 문제를 틀리거나 해설을 열면 **숫자 말장난·두문자 꿀팁** 카드 표시 |
| 오답노트 | 틀린 문제만 모아서 다시 풀기 |
| 대시보드 | 시험 D-day, 오늘 푼 문제 수, 시대별 정답률, 🔥 연속 학습일 |
| 온보딩 | 첫 방문 시 이름, 시험 날짜, 목표 급수(심화/기본), 하루 목표 문제 수 입력 |

### ✨ 와우 기능: 필수가 끝난 사람부터
| 기능 | 설명 |
|---|---|
| 타임라인 순서 맞추기 | 사건 카드 4~5장을 연도 순으로 드래그해서 정렬 |
| 인물 ↔ 사건 짝 맞추기 | 카드 뒤집기 방식의 매칭 게임 |
| 망각곡선 복습 | "지금 이 문제를 기억할 확률 62%" 표시, 약한 문제 우선 출제 |
| 꿀팁 모음 | 전체 꿀팁 보기, 👍 "외워졌어요" 수로 정렬 |

### ⛔ 이번에 하지 않음
로그인/서버(Supabase), 사진 OCR, 유료 API, 기출문제 원문 수록

---

## 2. 기술 스택 (변경 시 팀장 승인)

- React + TypeScript + Vite
- 스타일: Tailwind CSS v4 (색상은 **테마 변수로만** 사용, 아래 6장 참고)
- 애니메이션 `motion`, 아이콘 `lucide-react`, 차트 `recharts`
- 저장: **localStorage만** (모든 접근은 `src/lib/storage.ts`를 통해서)
- 화면 전환: 라우터 없이 `App.tsx`의 탭 상태로
- 배포: Vercel 무료 플랜
- **비용 0원.** 결제나 API 키가 필요한 것은 쓰지 않는다

---

## 3. 데이터 구조 (`src/types/index.ts`, 팀장 소유)

```ts
export type Era =
  | "prehistoric"    // 선사·고조선
  | "three-kingdoms" // 삼국
  | "north-south"    // 남북국
  | "goryeo"         // 고려
  | "joseon-early"   // 조선 전기
  | "joseon-late"    // 조선 후기
  | "modern"         // 개항기(근대)
  | "colonial"       // 일제강점기
  | "contemporary";  // 현대

export interface Tip {
  id: string;
  text: string;        // "이러구 있으면(1592) 안 된다, 나라가 위기다!"
  kind: "number" | "acronym" | "story"; // 숫자 말장난 / 두문자 / 이야기
}

export interface Question {
  id: string;          // "goryeo-003"
  era: Era;
  question: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string; // 해설 (필수)
  tip?: Tip;           // 암기 꿀팁
  year?: number;       // 관련 연도 (타임라인에 사용)
  tags?: string[];     // 인물, 사건 키워드
}

export interface TimelineEvent { id: string; title: string; year: number; era: Era; tipId?: string }
export interface PersonMatch   { id: string; person: string; deed: string; era: Era }

export interface QuestionStat {
  questionId: string; correct: number; wrong: number;
  strength: number;     // 망각곡선용 (일 단위)
  lastReviewedAt: number;
}
export interface Profile {
  name: string; examDate?: string; level: "advanced" | "basic"; dailyGoal: number;
}
export interface StudyLog { date: string; solved: number; correct: number } // "YYYY-MM-DD"
```

타입이 더 필요하면 **직접 추가하지 말고 팀장에게 요청**한다.

---

## 4. 콘텐츠 작성 규칙 ⭐ 가장 중요

1. **사실 정확성이 최우선.** 연도, 인물, 사건은 교과서와 국사편찬위원회 자료 기준. 확실하지 않으면 넣지 않는다.
2. **기출문제 원문 복사 금지.** 문제와 보기는 직접 창작한다. 기출 *유형*은 참고 가능.
3. **모든 문제에 해설 필수.** 왜 정답인지, 오답 보기는 무엇인지 한두 줄로.
4. **꿀팁은 사실과 정확히 연결.** 연도 말장난이면 숫자가 실제 연도와 일치해야 한다.
5. **표현 주의.** 특정 국가·민족·인물을 비하하거나 혐오하는 표현 금지. 역사적 비극을 가볍게 희화화하지 않는다.
6. 데이터 위치: `src/data/questions/<era>.ts`, `src/data/timeline.ts`, `src/data/persons.ts`
7. 목표 분량: 시대당 문제 **5개 이상**(총 45개+), 꿀팁은 문제의 **절반 이상**
8. Claude Code가 콘텐츠를 만들면 보고서에 **"검증이 필요한 항목"**을 반드시 따로 적는다.

### 꿀팁 예시
| 종류 | 예시 |
|---|---|
| 숫자 말장난 | 1592 임진왜란: "이러구 있으면(1592) 안 된다, 나라가 위기다!" |
| 숫자 말장난 | 1919 3·1 운동: "일어나 구하자! 일어나 구하자!(1919)" |
| 두문자 | 조선 왕 순서: "태정태세문단세 예성연중인명선…" |

---

## 5. 폴더 구조와 담당

```
src/
├── types/              🔒 팀장
├── lib/
│   ├── storage.ts      🔒 팀장   localStorage 읽기/쓰기 전부
│   ├── memory.ts       🔒 팀장   망각곡선 계산
│   └── quiz.ts            A      문제 뽑기·채점 로직
├── components/ui/      🔒 팀장   GlassCard, Button, Badge, ProgressBar 등 공용 부품
├── data/                  D      문제·타임라인·인물 데이터
├── pages/
│   ├── DashboardPage.tsx  D
│   ├── QuizPage.tsx       A      (+ 꿀팁 팝업 컴포넌트)
│   ├── WrongNotePage.tsx  C
│   ├── TipsPage.tsx       C
│   ├── TimelinePage.tsx   B
│   └── MatchPage.tsx      B
└── App.tsx             🔒 팀장   레이아웃, 탭, 온보딩
```

| 담당 | 브랜치 예시 | 맡는 것 |
|---|---|---|
| 팀장 | `feature/skeleton` | 뼈대, 디자인 시스템, 공용 타입·저장, 배포, PR 병합 |
| A | `feature/quiz` | 시대별 퀴즈, 채점, 해설, 💡 꿀팁 팝업 |
| B | `feature/timeline`, `feature/match` | 타임라인 순서 맞추기, 인물↔사건 매칭 |
| C | `feature/wrong-note`, `feature/tips` | 오답노트, 망각곡선 복습, 꿀팁 모음 |
| D | `feature/data`, `feature/dashboard` | 콘텐츠 데이터, 대시보드 |

- 자기 담당 파일만 수정한다. 🔒 파일이 필요하면 단톡방에서 팀장에게 요청.
- 공용 부품은 새로 만들지 말고 `components/ui`를 가져다 쓴다.
- 페이지 내부에서만 쓰는 컴포넌트는 같은 폴더에 `QuizPage.TipPopup.tsx`처럼 이름 앞에 페이지명을 붙인다.

---

## 6. 디자인 규칙

- 🎨 **색상 팔레트는 팀장이 확정 후 공지 예정.** 그 전까지는 아래 원칙만 지킨다.
- 색상 값(`#1e293b` 같은 hex)을 컴포넌트에 **직접 쓰지 않는다.** 반드시 테마 변수(Tailwind 테마 토큰 / CSS 변수)를 사용한다. 팔레트가 바뀌면 한 곳만 고치면 되도록.
- 카드, 버튼, 배지는 `components/ui` 부품을 사용해서 통일감을 유지한다.
- 폰트: Pretendard
- **모바일 우선.** 375px 폭에서 깨지지 않아야 한다.
- 애니메이션은 짧고 부드럽게(0.2~0.4초). 정답 시 가벼운 축하 효과, 오답 시 흔들림 정도.

---

## 7. 완료 기준 (PR 올리기 전 체크)

- [ ] `npm run lint`, `npm run build` 통과
- [ ] 브라우저 콘솔에 에러 없음
- [ ] 모바일 폭(375px)에서 확인
- [ ] localStorage를 비운 상태(첫 방문)에서도 동작
- [ ] 내 담당 파일만 수정
- [ ] 새 콘텐츠가 있다면 "검증 필요 항목"을 PR 설명에 적음

---

## 8. 협업 흐름 (요약)

```
main 최신화 → 내 브랜치 → 작업 → lint/build → commit → push
→ GitHub에서 PR → 팀장 승인·병합 → 모두 git pull
```

- PR은 **작게, 자주.** 기능 하나 = PR 하나
- Claude Code는 PR을 만들지 않는다. push 후 작업 보고까지만
- 병합되면 단톡방에 공지, 모두 `git pull origin main`
