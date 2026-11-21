# 📚 studyApp — 틀리는 순간, 외우는 법까지 알려주는 한국사 자격증 앱

> ⚠️ **개발 전 [docs/GUIDELINE.md](docs/GUIDELINE.md) 필독.** 기능 범위, 데이터 구조, 콘텐츠·디자인 규칙, 담당 배정이 정리되어 있으며 README와 충돌하면 GUIDELINE을 우선한다.

## 팀 소개

5명이 함께 만드는 Study Pack 프로젝트입니다.

**프로젝트 목표**
- 강의자료 요약
- 학습 퀴즈 제작
- 오답 노트 관리
- 7일 복습 계획

**팀 협업:** GitHub와 Git을 이용한 버전 관리 프로젝트

5인 팀 프로젝트 · React + TypeScript (Vite) · VS Code

---

## 1. 실행 방법

```bash
git clone https://github.com/zakenna/study-app.git
cd study-app
npm install      # 처음 한 번 + package.json이 바뀌었을 때
npm run dev      # http://localhost:5173
```

| 명령어 | 용도 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run dev -- --host` | 같은 와이파이의 폰에서 접속 |
| `npm run lint` | 코드 규칙 검사 |
| `npm run build` | 배포용 빌드 (에러 확인용) |

---

## 2. 폴더 구조와 담당

폴더 구조, 🔒 파일, 담당 배정은 **[docs/GUIDELINE.md 5장](docs/GUIDELINE.md#5-폴더-구조와-담당)**을 참고한다. (`src/main.tsx`는 수정 금지)

> **원칙: 내 담당 파일만 수정한다.** 다른 사람 파일이나 🔒 파일을 고쳐야 하면 단톡방에서 먼저 말한다.

---

## 3. 작업 흐름 (반드시 이 순서)

```bash
# ① 최신 main 받기
git switch main
git pull origin main
npm install

# ② 내 브랜치 만들기
git switch -c feature/기능이름

# ③ 코드 작성 후 검사
npm run lint
npm run build

# ④ 커밋 & 푸시
git add .
git commit -m "feat: 메인 화면 레이아웃 추가"
git push origin feature/기능이름

# ⑤ GitHub에서 Pull Request 생성 → 팀장 승인 → 팀장이 병합
```

- PR이 병합되면 **브랜치를 삭제**하고, 다음 작업은 ①부터 다시 시작한다.
- 수정 요청을 받으면 **같은 브랜치**에서 고쳐서 다시 push한다. 새 PR은 만들지 않는다.

---

## 4. 규칙

### 🚫 절대 금지
- `main` 브랜치에 직접 커밋/푸시
- `git push --force`
- 다른 사람의 PR을 승인하거나 병합 (팀장만 가능)
- `node_modules/`, `.env` 커밋

### 🌿 브랜치 이름
| 접두어 | 용도 | 예시 |
|---|---|---|
| `feature/` | 새 기능 | `feature/main-page` |
| `fix/` | 버그 수정 | `fix/button-style` |
| `docs/` | 문서 | `docs/readme` |

### 💬 커밋 메시지
형식은 `타입: 한글 설명`입니다.

| 타입 | 의미 |
|---|---|
| `feat` | 기능 추가 |
| `fix` | 버그 수정 |
| `style` | 디자인/CSS |
| `refactor` | 동작은 같고 코드만 정리 |
| `docs` | 문서 |
| `chore` | 설정, 패키지 |

예: `feat: 메인 화면 레이아웃 추가`

### 📦 PR 규칙
- **작게, 자주.** 기능 하나 = PR 하나
- PR 올리기 전 `npm run lint`와 `npm run build` 통과 필수
- PR 설명은 템플릿을 채워서 작성

### ✍️ 코드 스타일
- 컴포넌트는 **함수형**, 파일 이름은 **PascalCase** (`MainPage.tsx`)
- 변수와 함수 이름은 **camelCase** (`userName`)
- `any` 타입 사용 금지
- 공용 타입은 `src/types/`에서 import해서 사용 (각자 새로 만들지 않기)
- 저장 시 Prettier 자동 정렬 사용

### 📥 패키지 추가
`npm install 새패키지`는 **팀장에게 먼저 물어본 뒤** 진행한다. 여러 명이 동시에 바꾸면 `package.json`이 충돌한다.

---

## 5. 충돌이 났을 때

```bash
git switch main
git pull origin main
git switch feature/내브랜치
git merge main
# <<<<<<< ======= >>>>>>> 표시 부분을 정리
git add .
git commit -m "fix: main 병합 충돌 해결"
git push origin feature/내브랜치
```

혼자 해결이 어려우면 단톡방에 **터미널 메시지를 통째로** 올린다.
