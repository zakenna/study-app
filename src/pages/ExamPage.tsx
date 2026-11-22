import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Exam } from "../data/exams";
import { scoreExam, type ExamAnswers, type ExamScore } from "../lib/exam";
import { clearExamDraft, getExamResults, saveExamResult } from "../lib/storage";
import type { PageProps } from "../types";
import ExamResultView from "./ExamPage.Result";
import ExamSelect from "./ExamPage.Select";
import ExamSheet, { type ExamMode, type ExamResume } from "./ExamPage.Sheet";

type Phase =
  | { name: "select" }
  | {
      name: "sheet";
      exam: Exam;
      mode: ExamMode;
      runId: number;
      resume?: ExamResume;
    }
  | {
      name: "result";
      exam: Exam;
      answers: ExamAnswers;
      durationSec: number;
      result: ExamScore;
      isBest: boolean;
    };

/** 🎯 기출 채점: 회차 선택(PDF 불러오기) → CBT 또는 OMR 응시(80분) → 결과·시대별 분석·문제지 복습 */
function ExamPage({ onNavigate }: PageProps) {
  const [phase, setPhase] = useState<Phase>({ name: "select" });

  const start = (exam: Exam, mode: ExamMode, resume?: ExamResume) => {
    if (!resume) clearExamDraft(); // 새로 시작이면 지난 임시 저장을 지운다
    setPhase({ name: "sheet", exam, mode, runId: Date.now(), resume });
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
            mode={phase.mode}
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
            onRetry={(mode) => start(phase.exam, mode)}
            onBack={() => setPhase({ name: "select" })}
            onGoQuiz={(era) => onNavigate("quiz", { quizEra: era })}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default ExamPage;
