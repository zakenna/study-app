export interface Quiz {
  id: number
  question: string
  options: string[]
  /** 정답 보기의 index (options 배열 기준, 0부터 시작) */
  answer: number
}
