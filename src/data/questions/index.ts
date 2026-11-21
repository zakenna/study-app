// 전체 문제 목록. 시대별 파일을 추가하면 여기에 합친다.
import type { Question } from "../../types";
import { colonialQuestions } from "./colonial";
import { joseonEarlyQuestions } from "./joseon-early";
import { joseonLateQuestions } from "./joseon-late";

export const questions: Question[] = [
  ...joseonEarlyQuestions,
  ...joseonLateQuestions,
  ...colonialQuestions,
];
