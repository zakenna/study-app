import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { prepareQuiz, shuffle, type QuestionSnapshot } from "../lib/quiz";
import { getStats, isGraduated } from "../lib/storage";
import type { PageProps, Question } from "../types";
import QuizPlay, { type AnswerRecord } from "./QuizPage.Play";
import QuizResult from "./QuizPage.Result";
import WrongNoteList from "./WrongNotePage.List";

type Phase =
  | { name: "list" }
  | {
      name: "play";
      quiz: Question[];
      snapshot: Record<string, QuestionSnapshot>;
      runId: number;
    }
  | {
      name: "result";
      answers: AnswerRecord[];
      maxCombo: number;
      graduated: number;
    };

/** 오답노트: 목록 → (다시 풀기) 퀴즈 Play/Result 재사용 */
function WrongNotePage({ onNavigate }: PageProps) {
  const [phase, setPhase] = useState<Phase>({ name: "list" });

  const startQuiz = (questions: Question[]) => {
    if (questions.length === 0) return;
    const { quiz, snapshot } = prepareQuiz(shuffle(questions), getStats());
    setPhase({ name: "play", quiz, snapshot, runId: Date.now() });
    window.scrollTo({ top: 0 });
  };

  const handleFinish = (answers: AnswerRecord[], maxCombo: number) => {
    // 이번에 푼 문제는 모두 시작할 때 오답노트에 있던 문제 → 지금 졸업 상태면 이번 풀이로 졸업한 것
    const stats = getStats();
    const graduated = answers.filter((a) =>
      isGraduated(stats[a.question.id]),
    ).length;
    setPhase({ name: "result", answers, maxCombo, graduated });
    window.scrollTo({ top: 0 });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase.name === "play" ? `play-${phase.runId}` : phase.name}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        {phase.name === "list" && (
          <WrongNoteList
            onStart={startQuiz}
            onGoQuiz={() => onNavigate("quiz")}
          />
        )}

        {phase.name === "play" && (
          <QuizPlay
            quiz={phase.quiz}
            snapshot={phase.snapshot}
            onQuit={() => setPhase({ name: "list" })}
            onFinish={handleFinish}
          />
        )}

        {phase.name === "result" && (
          <QuizResult
            answers={phase.answers}
            maxCombo={phase.maxCombo}
            graduated={phase.graduated}
            pickAnotherLabel="오답 목록으로"
            onRetryWrong={() =>
              startQuiz(
                phase.answers
                  .filter((a) => !a.isCorrect)
                  .map((a) => a.question),
              )
            }
            onPickAnother={() => setPhase({ name: "list" })}
            onGoDashboard={() => onNavigate("dashboard")}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default WrongNotePage;
