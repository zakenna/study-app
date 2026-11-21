import type { Quiz } from '../types/quiz'

export const quizzes: Quiz[] = [
  {
    id: 1,
    question: 'Git에서 새 브랜치를 만들고 바로 이동하는 명령어는?',
    options: ['git branch', 'git switch -c', 'git merge', 'git init'],
    answer: 1,
  },
  {
    id: 2,
    question: 'React에서 상태(state)를 만들 때 사용하는 Hook은?',
    options: ['useEffect', 'useRef', 'useState', 'useMemo'],
    answer: 2,
  },
  {
    id: 3,
    question: 'TypeScript에서 객체의 모양을 정의할 때 주로 쓰는 키워드는?',
    options: ['interface', 'function', 'import', 'return'],
    answer: 0,
  },
]
