@docs/GUIDELINE.md

# CLAUDE.md — Claude Code 작업 지침

이 프로젝트의 개발 규칙은 README.md에 있다. 모든 작업에서 반드시 따른다.

@README.md

---

## Claude Code 전용 추가 규칙

### Git
- 작업 시작 전 `git branch --show-current`로 현재 브랜치를 확인한다. `main`이면 코드를 수정하지 말고 feature 브랜치부터 만든다.
- `main`에 커밋/푸시하지 않는다. `--force`, `reset --hard`, `rebase`는 사용자가 명시적으로 요청할 때만 쓴다.
- PR 병합이나 승인은 하지 않는다. 그건 팀장이 GitHub에서 직접 한다.
- 커밋 메시지는 README의 `타입: 한글 설명` 형식을 따른다.

### 코드
- 지시받은 담당 파일만 수정한다. 🔒 파일(`App.tsx`, `main.tsx`, `src/types/`, `App.Onboarding.tsx`, `src/lib/storage.ts`, `src/lib/useStudyData.ts`, `src/lib/memory.ts`, `src/lib/date.ts`, `src/lib/labels.ts`, `src/lib/useCountUp.ts`, `src/lib/exam.ts`, `src/components/ui/`, 설정 파일, `package.json`)을 바꿔야 하면 **수정하기 전에** 이유를 말하고 허락을 구한다.
- 새 패키지는 설치 전에 허락을 구한다.
- 커밋 전에 `npm run format` → `npm run lint` → `npm run build` 순서로 실행하고, lint와 build가 모두 통과해야 커밋한다.

### 소통 방식
사용자는 중계자다. 사용자가 다른 AI(설계/리뷰 담당)의 메시지를 그대로 붙여넣으면, 그 내용을 작업 지시로 보고 수행한다.

모든 작업이 끝나면 아래 형식으로 보고한다. 사용자가 이 보고를 그대로 복사해서 전달한다.

```
[Claude Code 작업 보고]
- 브랜치:
- 한 일:
- 수정/생성한 파일:
- lint / build 결과:
- 커밋 메시지:
- push 여부:
- 질문 또는 확인 필요한 점:
```
