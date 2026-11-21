import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  buildQuizSet,
  shuffle,
  prepareQuiz,
  type QuestionSnapshot,
  type QuizMode,
} from "../lib/quiz";
import { getStats } from "../lib/storage";
import type { PageProps, Question } from "../types";
import QuizPlay, { type AnswerRecord } from "./QuizPage.Play";
import QuizResult from "./QuizPage.Result";
import QuizSelect from "./QuizPage.Select";

type Phase =
  | { name: "select" }
  | {
      name: "play";
      quiz: Question[];
      snapshot: Record<string, QuestionSnapshot>;
      runId: number;
    }
  | { name: "result"; answers: AnswerRecord[]; maxCombo: number };

/** 시대별 퀴즈: 선택 → 문제 → 결과 */
/** 문제 목록 → 플레이 단계 (보기 섞기 + 시작 상태 고정). stats는 여기서 한 번 읽는다 (GUIDELINE 3-5) */
function playPhase(questions: Question[]): Phase | null {
  if (questions.length === 0) return null;
  const { quiz, snapshot } = prepareQuiz(questions, getStats());
  return { name: "play", quiz, snapshot, runId: Date.now() };
}

function QuizPage({ onNavigate, intent }: PageProps) {
  // 다른 화면에서 "○○ 시대 퀴즈로" 이동해 오면(intent.quizEra) 처음부터 그 시대 퀴즈로 시작한다.
  // 탭에 들어올 때 한 번만 실행되는 초기값이라 렌더링마다 읽지 않는다
  const [phase, setPhase] = useState<Phase>(
    () =>
      (intent?.quizEra && playPhase(buildQuizSet(intent.quizEra))) || {
        name: "select",
      },
  );

  const startQuiz = (questions: Question[]) => {
    const next = playPhase(questions);
    if (!next) return;
    setPhase(next);
    window.scrollTo({ top: 0 });
  };

  const handleStart = (mode: QuizMode) => startQuiz(buildQuizSet(mode));

  const handleRetryWrong = (answers: AnswerRecord[]) =>
    startQuiz(
      shuffle(answers.filter((a) => !a.isCorrect).map((a) => a.question)),
    );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase.name === "play" ? `play-${phase.runId}` : phase.name}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        {phase.name === "select" && <QuizSelect onStart={handleStart} />}

        {phase.name === "play" && (
          <QuizPlay
            quiz={phase.quiz}
            snapshot={phase.snapshot}
            onQuit={() => setPhase({ name: "select" })}
            onFinish={(answers, maxCombo) => {
              setPhase({ name: "result", answers, maxCombo });
              window.scrollTo({ top: 0 });
            }}
          />
        )}

        {phase.name === "result" && (
          <QuizResult
            answers={phase.answers}
            maxCombo={phase.maxCombo}
            onRetryWrong={() => handleRetryWrong(phase.answers)}
            onPickAnother={() => setPhase({ name: "select" })}
            onGoDashboard={() => onNavigate("dashboard")}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default QuizPage;
