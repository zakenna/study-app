# 📜 개발 가이드라인 — 한국사 자격증 학습 앱

> **"틀리는 순간, 외우는 법까지 알려주는 한국사 앱"**
> 한국사능력검정시험을 준비하는 대학생을 위한 개인 맞춤 학습 웹앱

이 문서는 개발자(팀장)와 모든 Claude Code가 **작업 전에 반드시 읽는** 기준 문서다.
README.md(Git 규칙)와 함께 따른다. 내용이 충돌하면 이 문서를 우선한다.

---

## 1. 기능 범위

### ✅ 필수 (MVP): 이것부터 완성한다
| 기능 | 설명 |
|---|---|
| 시대별 퀴즈 | 시대를 고르고 4지선다로 풀기. 정답·오답 표시, **해설** 제공 |
| 💡 암기 꿀팁 | 문제를 틀리거나 해설을 열면 **숫자 말장난·두문자 꿀팁** 카드 표시 |
| 오답노트 | 틀린 문제만 모아서 다시 풀기 (규칙은 3장 참고) |
| 대시보드 | 시험 D-day, 오늘 푼 문제 수, 시대별 정답률, 🔥 연속 학습일 |
| 온보딩 | 첫 방문 시 이름, 시험 날짜, 목표 급수(심화/기본), 하루 목표 문제 수 입력 |

### ✨ 와우 기능: 필수가 끝난 뒤
| 기능 | 설명 |
|---|---|
| 타임라인 순서 맞추기 | 사건 카드 4~5장을 연도 순으로 드래그해서 정렬 |
| 인물 ↔ 사건 짝 맞추기 | 카드 뒤집기 방식의 매칭 게임 |
| 망각곡선 복습 | "지금 이 문제를 기억할 확률 62%" 표시, 약한 문제 우선 출제 |
| 꿀팁 모음 | 전체 꿀팁 보기, 👍 "외워졌어요" 토글(꿀팁당 1회), 외운/못 외운 꿀팁 필터 |

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
- 위 패키지 설치는 **팀장 뼈대(`feature/skeleton`)에서 한 번에** 한다. 다른 브랜치에서 설치하지 않는다.

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
  id: string;          // "tip-joseon-late-001" (tip-<era>-번호 3자리)
  era: Era;
  year?: number;       // 관련 연도 (숫자 말장난이면 필수로 적는다)
  text: string;        // "일(1)본군이 오(5)자, 구(9)국의 영웅 이(2)순신!"
  kind: "number" | "acronym" | "story"; // 숫자 말장난 / 두문자 / 이야기
}

export interface Question {
  id: string;          // "goryeo-003"
  era: Era;
  question: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string; // 해설 (필수)
  tipId?: string;      // 암기 꿀팁 (src/data/tips.ts의 Tip.id)
  year?: number;       // 관련 연도 (타임라인에 사용)
  tags?: string[];     // 인물, 사건 키워드
}

export interface TimelineEvent { id: string; title: string; year: number; era: Era; tipId?: string }
export interface PersonMatch   { id: string; person: string; deed: string; era: Era }

export interface QuestionStat {
  questionId: string; correct: number; wrong: number;
  correctStreak: number;  // 연속 정답 수 (오답이면 0으로)
  strength: number;       // 망각곡선용, 단위: 일
  lastReviewedAt: number; // ms 타임스탬프 (Date.now())
}
export interface Profile {
  name: string;
  examDate?: string;      // "YYYY-MM-DD"
  level: "advanced" | "basic";
  dailyGoal: number;
}
export interface StudyLog { date: string; solved: number; correct: number } // "YYYY-MM-DD"
export interface TipVote  { tipId: string; count: number } // "외워졌어요" 토글: 외우면 1, 취소하면 항목 삭제
```

타입이 더 필요하면 **직접 추가하지 말고 팀장에게 요청**한다.

- **연도(`year`)는 기원전이면 음수**로 적는다 (예: 고조선 멸망 `-108`).
  화면에 표시할 때는 `lib/labels.ts`의 `formatYear(year)`를 쓴다 → `-108` → "기원전 108년", `1592` → "1592년"

### 3-1. 시대 경계
문제·꿀팁·타임라인의 `era`는 아래 기준으로 분류한다.

| Era | 범위 |
|---|---|
| `joseon-early` | 1392 조선 건국 ~ 임진왜란 전 |
| `joseon-late` | 1592 임진왜란 ~ 1863 흥선대원군 집권 전 |
| `modern` | 1863 흥선대원군 집권 ~ 1910 (대한제국 포함) |
| `colonial` | 1910 ~ 1945.8.15 |
| `contemporary` | 1945 광복 이후 (광복 ~ 정부 수립 포함) |

### 3-2. 오답노트 규칙
- **한 번이라도 틀렸고(`wrong > 0`) `correctStreak < 2`인 문제**가 오답노트에 들어간다.
- 정답이면 `correctStreak + 1`, 오답이면 `correctStreak = 0`.
- **2번 연속 맞히면** 오답노트에서 빠진다. 다시 틀리면 다시 들어온다.
- 🎓 **졸업** = 한 번 이상 틀렸고 `correctStreak >= 2`인 문제 (`storage.ts`의 `isGraduated`).

### 3-3. 망각곡선 (`src/lib/memory.ts`)
- `strength` 초깃값은 **1**(일). 정답이면 **×2.5**, 오답이면 **1로 리셋**.
- 기억 확률 = `Math.exp(-경과일 / strength)`. 경과일 = `(Date.now() - lastReviewedAt) / 86_400_000`
- `memory.ts`: `retention`(기억 확률), `updateStrength`(풀이 후 strength 갱신), `projectRetention`(앞으로 n일 기억 확률, 그래프용).
- **약점 순위는 `lib/quiz.ts`의 `rankWeakStats`** 하나로 정한다: 오답노트 문제 먼저 → 기억 확률 낮은 순.
  퀴즈 "약점 집중"과 대시보드 "약점 TOP 5"가 같은 기준을 쓴다.
- 화면에서는 가져다 쓰고, 수정이 필요하면 팀장 승인 후 고친다.

### 3-4. localStorage 키
| 키 | 값 |
|---|---|
| `studyapp:profile` | `Profile` |
| `studyapp:stats` | `Record<questionId, QuestionStat>` |
| `studyapp:studyLogs` | `StudyLog[]` |
| `studyapp:tipVotes` | `TipVote[]` |

다른 키도 `studyapp:` 접두어를 쓰고, 팀장이 `storage.ts`에서 정의한다.

### 3-5. 데이터 읽기·쓰기 방법 ⭐
- **화면(컴포넌트)은 저장 데이터를 `useStudyData()` 훅으로 읽는다.** (`src/lib/useStudyData.ts`)
  `const { profile, stats, logs, tipVotes } = useStudyData();`
- **쓰기는 `storage.ts` 함수**(`recordAnswer`, `saveProfile`, `toggleTipMemorized`)를 호출한다.
  쓰기가 끝나면 `"studyapp:change"` 이벤트가 발생하고, 훅을 쓰는 모든 화면(헤더의 🔥 등)이 즉시 다시 그려진다.
- 컴포넌트에서 `getStats()` 같은 읽기 함수를 렌더링 중에 직접 부르지 않는다. 다른 화면의 변경이 반영되지 않는다.
  (클릭 처리 함수 안에서 한 번 읽는 것은 괜찮다)

---

## 4. 콘텐츠 작성 규칙 ⭐ 가장 중요

1. **사실 정확성이 최우선.** 연도, 인물, 사건은 교과서와 국사편찬위원회 자료 기준. 확실하지 않으면 넣지 않는다.
2. **기출문제 원문 복사 금지.** 문제와 보기는 직접 창작한다. 기출 *유형*은 참고 가능.
3. **모든 문제에 해설 필수.** 왜 정답인지, 오답 보기는 무엇인지 한두 줄로.
4. **꿀팁은 사실과 정확히 연결.** 연도 말장난이면 숫자가 실제 연도와 일치해야 한다.
5. **표현 주의.** 특정 국가·민족·인물을 비하하거나 혐오하는 표현 금지. 역사적 비극을 가볍게 희화화하지 않는다.
6. 데이터 위치: `src/data/questions/<era>.ts`, `src/data/tips.ts`, `src/data/timeline.ts`, `src/data/persons.ts`
7. 목표 분량: 시대당 문제 **5개 이상**(총 45개+), 꿀팁은 문제의 **절반 이상**
8. Claude Code가 콘텐츠를 만들면 보고서에 **"검증이 필요한 항목"**을 반드시 따로 적는다.

### 꿀팁 예시
| 종류 | 예시 |
|---|---|
| 숫자 말장난 | 1592 임진왜란: "일(1)본군이 오(5)자, 구(9)국의 영웅 이(2)순신!" |
| 숫자 말장난 | 1919 3·1 운동: "일(1)어나 구(9)하자! 일(1)어나 구(9)하자!" |
| 두문자 | 조선 왕 순서: "태정태세문단세 예성연중인명선…" |

---

## 5. 폴더 구조와 작업 단위

> 1인 개발 체제: 팀장 혼자 Claude Code와 함께 진행한다. 🔒 표시는 "수정 전 팀장 승인이 필요한 공용 파일"이라는 뜻이다.

```
src/
├── types/              🔒
├── lib/
│   ├── storage.ts      🔒       localStorage 읽기/쓰기 전부 (쓰면 "studyapp:change" 이벤트)
│   ├── useStudyData.ts 🔒       저장 데이터 구독 훅 — 화면은 이걸로 읽는다 (3-5)
│   ├── memory.ts       🔒       망각곡선 계산 (retention, updateStrength, projectRetention)
│   ├── date.ts         🔒       날짜 키(YYYY-MM-DD), D-day, 연속 학습일
│   ├── useCountUp.ts   🔒       숫자가 올라가는 애니메이션 훅 (결과·요약 카드)
│   ├── labels.ts       🔒       ERAS(시대 순서), ERA_LABELS, TIP_KIND_LABELS, formatYear
│   └── quiz.ts                   문제 뽑기·채점 로직
├── components/ui/      🔒       GlassCard, Button, Badge, ProgressBar, TipCard 등 공용 부품
├── data/                         문제·꿀팁(tips.ts)·타임라인·인물 데이터
│   └── questions/
│       ├── <era>.ts              시대별 문제
│       └── index.ts              시대별 문제를 하나로 합침 (새 시대 파일을 만들면 여기에 추가)
├── pages/
│   ├── DashboardPage.tsx
│   ├── QuizPage.tsx
│   ├── WrongNotePage.tsx
│   ├── TipsPage.tsx
│   ├── TimelinePage.tsx
│   └── MatchPage.tsx
├── App.tsx             🔒       레이아웃, 탭, 헤더
└── App.Onboarding.tsx  🔒       첫 방문 온보딩 / 프로필 수정 모달
```

| 작업 단위 | 브랜치 예시 | 내용 |
|---|---|---|
| 뼈대 | `feature/skeleton` | 디자인 시스템, 공용 타입·저장, 레이아웃 (완료) |
| 데이터 | `feature/data` | 문제·꿀팁·타임라인·인물 데이터 |
| 퀴즈 | `feature/quiz` | 시대별 퀴즈, 채점, 해설, 💡 꿀팁 카드 표시(`TipCard` 사용) |
| 오답노트·꿀팁 | `feature/wrong-note`, `feature/tips` | 오답노트, 망각곡선 복습, 꿀팁 모음 |
| 대시보드 | `feature/dashboard` | D-day, 오늘 학습량, 시대별 정답률, 연속 학습일 |
| 와우 기능 | `feature/timeline`, `feature/match` | 타임라인 순서 맞추기, 인물↔사건 매칭 |

PR 생성·병합과 배포는 팀장이 한다.

### 작업 순서
1. **팀장 뼈대(`feature/skeleton`)가 다른 작업보다 먼저 병합된다.**
   뼈대 범위: 패키지 설치, 테마 변수, 공용 타입, `lib/`(storage·useStudyData·memory·date·labels), `components/ui`(TipCard 포함), `App.tsx`(탭·헤더)·`App.Onboarding.tsx`
2. 뼈대 병합 후 위 작업 단위별로 브랜치를 만들어 하나씩 진행한다.

### 규칙
- 지시받은 작업 범위의 파일만 수정한다. 🔒 파일은 수정하기 전에 팀장 승인을 받는다.
- 공용 부품은 새로 만들지 말고 `components/ui`를 가져다 쓴다. 꿀팁 카드는 어느 화면이든 `components/ui/TipCard.tsx`를 쓴다.
- 페이지 내부에서만 쓰는 컴포넌트는 같은 폴더에 `QuizPage.ResultSummary.tsx`처럼 이름 앞에 페이지명을 붙인다.

---

## 6. 디자인 규칙

- 🎨 **색상 팔레트는 팀장이 확정 후 공지 예정.** 그 전까지는 아래 원칙만 지킨다.
- 색상 값(`#1e293b` 같은 hex)을 컴포넌트에 **직접 쓰지 않는다.** 반드시 테마 변수(Tailwind 테마 토큰 / CSS 변수)를 사용한다. 팔레트가 바뀌면 한 곳만 고치면 되도록.
- 테마 변수 이름 (값은 뼈대에서 임시 쿨톤으로 정하고, 팔레트 확정 시 값만 바꾼다):

  | 변수 | 용도 | Tailwind 예시 |
  |---|---|---|
  | `--color-canvas` | 화면 배경 (밝은 버튼의 글자색으로도 사용) | `bg-canvas`, `text-canvas` |
  | `--color-surface` | 카드·패널 배경 | `bg-surface` |
  | `--color-line` | 테두리 | `border-line` |
  | `--color-ink` | 기본 글자 | `text-ink` |
  | `--color-muted` | 보조 글자 | `text-muted` |
  | `--color-primary` | 주요 버튼·강조 | `bg-primary` |
  | `--color-accent` | 꿀팁 등 포인트 | `text-accent` |
  | `--color-success` | 정답 | `text-success` |
  | `--color-danger` | 오답 | `text-danger` |

- 카드, 버튼, 배지는 `components/ui` 부품을 사용해서 통일감을 유지한다.
- 폰트: Pretendard. `index.html`에서 jsDelivr CDN으로 불러온다 (뼈대에서 적용).
- **모바일 우선.** 375px 폭에서 깨지지 않아야 한다.
- 애니메이션은 짧고 부드럽게(0.2~0.4초). 정답 시 가벼운 축하 효과, 오답 시 흔들림 정도.

---

## 7. 완료 기준 (PR 올리기 전 체크)

- [ ] `npm run lint`, `npm run build` 통과
- [ ] 브라우저 콘솔에 에러 없음
- [ ] 모바일 폭(375px)에서 확인
- [ ] localStorage를 비운 상태(첫 방문)에서도 동작
- [ ] 작업 범위 밖의 파일을 수정하지 않음 (🔒 파일은 승인받음)
- [ ] 새 콘텐츠가 있다면 "검증 필요 항목"을 PR 설명에 적음

---

## 8. 협업 흐름 (요약)

```
main 최신화 → 내 브랜치 → 작업 → lint/build → commit → push
→ GitHub에서 PR → 팀장 승인·병합 → git pull
```

- PR은 **작게, 자주.** 기능 하나 = PR 하나
- Claude Code는 PR을 만들지 않는다. push 후 작업 보고까지만
- 병합되면 `git pull origin main`으로 로컬 main을 최신화한다
