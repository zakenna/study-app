import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import OptionButton from "../components/ui/OptionButton";
import { isCorrectChoice, shuffleOptions } from "../lib/quiz";
import { recordAnswer } from "../lib/storage";
import type { Question } from "../types";

/** 꿀팁 아래에서 바로 푸는 연결 문제 1개 (채점 + 해설 + recordAnswer) */
function TipsInlineQuiz({ question: original }: { question: Question }) {
  const reduceMotion = useReducedMotion() ?? false;
  // 열 때마다 보기 순서를 섞는다 (정답 인덱스는 shuffleOptions가 다시 매핑)
  const [question, setQuestion] = useState(() => shuffleOptions(original));
  const [choice, setChoice] = useState<number | null>(null);
  const answered = choice !== null;
  const isCorrect = answered && isCorrectChoice(question, choice);

  const choose = (i: number) => {
    if (answered) return;
    setChoice(i);
    recordAnswer(question.id, isCorrectChoice(question, i));
  };

  const retry = () => {
    setQuestion(shuffleOptions(original));
    setChoice(null);
  };

  return (
    <GlassCard className="space-y-3">
      <p className="leading-relaxed font-semibold">{question.question}</p>
      <div className="space-y-2" role="group" aria-label="보기">
        {question.options.map((option, i) => (
          <OptionButton
            key={`${question.id}-${option}`}
            index={i}
            text={option}
            state={
              !answered
                ? "idle"
                : i === question.answer
                  ? "correct"
                  : i === choice
                    ? "wrong"
                    : "dimmed"
            }
            celebrate={isCorrect && i === question.answer}
            reduceMotion={reduceMotion}
            disabled={answered}
            onClick={() => choose(i)}
          />
        ))}
      </div>

      {answered && (
        <div className="space-y-2">
          <p
            className={`font-bold ${isCorrect ? "text-success" : "text-danger"}`}
          >
            {isCorrect
              ? "정답이에요! 🎉"
              : `아쉬워요 — 정답은 ${question.options[question.answer]}`}
          </p>
          <p className="text-sm leading-relaxed text-ink/90">
            {question.explanation}
          </p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
          >
            <RotateCcw size={12} aria-hidden />
            다시 풀기
          </button>
        </div>
      )}
    </GlassCard>
  );
}

export default TipsInlineQuiz;
