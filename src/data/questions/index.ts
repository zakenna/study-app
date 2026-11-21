// 전체 문제 목록. 시대별 파일을 추가하면 여기에 합친다. (시대 순서대로)
import type { Question } from "../../types";
import { colonialQuestions } from "./colonial";
import { contemporaryQuestions } from "./contemporary";
import { goryeoQuestions } from "./goryeo";
import { joseonEarlyQuestions } from "./joseon-early";
import { joseonLateQuestions } from "./joseon-late";
import { modernQuestions } from "./modern";
import { northSouthQuestions } from "./north-south";
import { prehistoricQuestions } from "./prehistoric";
import { threeKingdomsQuestions } from "./three-kingdoms";

export const questions: Question[] = [
  ...prehistoricQuestions,
  ...threeKingdomsQuestions,
  ...northSouthQuestions,
  ...goryeoQuestions,
  ...joseonEarlyQuestions,
  ...joseonLateQuestions,
  ...modernQuestions,
  ...colonialQuestions,
  ...contemporaryQuestions,
];
