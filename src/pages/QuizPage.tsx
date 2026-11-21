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
function QuizPage({ onNavigate }: PageProps) {
  const [phase, setPhase] = useState<Phase>({ name: "select" });

  const startQuiz = (questions: Question[]) => {
    if (questions.length === 0) return;
    // 보기 섞기 + 시작 상태 고정. stats는 클릭 처리 안에서 한 번 읽는다 (GUIDELINE 3-5)
    const { quiz, snapshot } = prepareQuiz(questions, getStats());
    setPhase({
      name: "play",
      quiz,
      snapshot,
      runId: Date.now(),
    });
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
