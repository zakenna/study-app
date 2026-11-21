import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Exam } from "../data/exams";
import { scoreExam, type ExamAnswers, type ExamScore } from "../lib/exam";
import { clearExamDraft, getExamResults, saveExamResult } from "../lib/storage";
import type { PageProps } from "../types";
import ExamResultView from "./ExamPage.Result";
import ExamSelect from "./ExamPage.Select";
import ExamSheet from "./ExamPage.Sheet";

type Phase =
  | { name: "select" }
  | {
      name: "sheet";
      exam: Exam;
      runId: number;
      resume?: { answers: ExamAnswers; remaining: number };
    }
  | {
      name: "result";
      exam: Exam;
      answers: ExamAnswers;
      durationSec: number;
      result: ExamScore;
      isBest: boolean;
    };

/** 🎯 기출 OMR 채점: 회차 선택 → OMR 응시(80분) → 결과·시대별 분석 */
function ExamPage({ onNavigate }: PageProps) {
  const [phase, setPhase] = useState<Phase>({ name: "select" });

  const start = (
    exam: Exam,
    resume?: { answers: ExamAnswers; remaining: number },
  ) => {
    if (!resume) clearExamDraft(); // 새로 시작이면 지난 임시 저장을 지운다
    setPhase({ name: "sheet", exam, runId: Date.now(), resume });
    window.scrollTo({ top: 0 });
  };

  const submit = (exam: Exam, answers: ExamAnswers, durationSec: number) => {
    clearExamDraft();
    const result = scoreExam(exam, answers);
    // 클릭 처리 안에서 이전 기록을 한 번 읽어 최고 점수 경신 여부를 판단
    const previousBest = Math.max(
      -1,
      ...getExamResults()
        .filter((r) => r.examId === exam.id)
        .map((r) => r.score),
    );
    saveExamResult({
      examId: exam.id,
      round: exam.round,
      isSample: exam.isSample,
      takenAt: Date.now(),
      score: result.score,
      maxScore: result.maxScore,
      grade: result.grade,
      correctCount: result.correctCount,
      answers,
      durationSec,
    });
    setPhase({
      name: "result",
      exam,
      answers,
      durationSec,
      result,
      isBest: result.score > previousBest,
    });
    window.scrollTo({ top: 0 });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase.name === "sheet" ? `sheet-${phase.runId}` : phase.name}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {phase.name === "select" && <ExamSelect onStart={start} />}
        {phase.name === "sheet" && (
          <ExamSheet
            exam={phase.exam}
            resume={phase.resume}
            onSubmit={(answers, durationSec) =>
              submit(phase.exam, answers, durationSec)
            }
            onQuit={() => {
              clearExamDraft();
              setPhase({ name: "select" });
            }}
          />
        )}
        {phase.name === "result" && (
          <ExamResultView
            exam={phase.exam}
            answers={phase.answers}
            durationSec={phase.durationSec}
            result={phase.result}
            isBest={phase.isBest}
            onRetry={() => start(phase.exam)}
            onBack={() => setPhase({ name: "select" })}
            onGoQuiz={(era) => onNavigate("quiz", { quizEra: era })}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default ExamPage;
