import { LayoutDashboard, RotateCcw, Shuffle } from "lucide-react";
import { animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import TipCard from "../components/ui/TipCard";
import { getTipById } from "../data/tips";
import { ERA_LABELS } from "../lib/labels";
import { voteTip } from "../lib/storage";
import { useStudyData } from "../lib/useStudyData";
import type { AnswerRecord } from "./QuizPage.Play";

interface QuizResultProps {
  answers: AnswerRecord[];
  maxCombo: number;
  onRetryWrong: () => void;
  onPickAnother: () => void;
  onGoDashboard: () => void;
}

const OPTION_MARKS = ["①", "②", "③", "④"];

/** 0에서 target까지 숫자가 올라가는 애니메이션 */
function useCountUp(target: number, delay = 0): number {
  const reduceMotion = useReducedMotion() ?? false;
  const [value, setValue] = useState(reduceMotion ? target : 0);

  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(0, target, {
      duration: 0.9,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, delay, reduceMotion]);

  return reduceMotion ? target : value;
}

function resultMessage(rate: number): string {
  if (rate === 100) return "완벽해요! 🎉";
  if (rate >= 70) return "잘했어요! 👏";
  if (rate >= 40) return "조금만 더! 💪";
  return "틀린 문제는 꿀팁으로 다시 외워 봐요 💡";
}

/** 3단계: 결과 */
function QuizResult({
  answers,
  maxCombo,
  onRetryWrong,
  onPickAnother,
  onGoDashboard,
}: QuizResultProps) {
  const { tipVotes } = useStudyData();
  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
  const wrong = answers.filter((a) => !a.isCorrect);

  const shownCorrect = useCountUp(correct);
  const shownRate = useCountUp(rate, 0.15);
  const shownCombo = useCountUp(maxCombo, 0.3);

  return (
    <div className="space-y-5">
      <GlassCard className="text-center">
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
          className="text-lg font-bold"
        >
          {resultMessage(rate)}
        </motion.p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="점수" value={`${shownCorrect}`} suffix={`/ ${total}`} />
          <Stat
            label="정답률"
            value={`${shownRate}`}
            suffix="%"
            tone="text-success"
          />
          <Stat
            label="최대 콤보"
            value={`🔥${shownCombo}`}
            tone="text-accent"
          />
        </div>
      </GlassCard>

      <div className="grid gap-2 sm:grid-cols-3">
        <Button onClick={onRetryWrong} disabled={wrong.length === 0}>
          <RotateCcw size={16} aria-hidden />
          틀린 문제만 다시
        </Button>
        <Button variant="ghost" onClick={onPickAnother}>
          <Shuffle size={16} aria-hidden />
          다른 시대 풀기
        </Button>
        <Button variant="ghost" onClick={onGoDashboard}>
          <LayoutDashboard size={16} aria-hidden />
          대시보드로
        </Button>
      </div>

      <section aria-labelledby="wrong-heading" className="space-y-3">
        <h3 id="wrong-heading" className="text-sm font-semibold text-muted">
          {wrong.length > 0
            ? `틀린 문제 ${wrong.length}개`
            : "틀린 문제가 없어요!"}
        </h3>
        {wrong.map(({ question, choice }, i) => {
          const tip = question.tipId ? getTipById(question.tipId) : undefined;
          return (
            <GlassCard
              key={question.id}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            >
              <Badge className="mb-2">{ERA_LABELS[question.era]}</Badge>
              <p className="leading-relaxed font-medium">{question.question}</p>
              <p className="mt-2 text-sm text-success">
                정답 {OPTION_MARKS[question.answer]}{" "}
                {question.options[question.answer]}
              </p>
              <p className="text-sm text-danger/80">
                내 답 {OPTION_MARKS[choice]} {question.options[choice]}
              </p>
              {tip && (
                <TipCard
                  className="mt-3"
                  tip={tip}
                  votes={tipVotes.find((v) => v.tipId === tip.id)?.count ?? 0}
                  onVote={voteTip}
                />
              )}
            </GlassCard>
          );
        })}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  tone = "text-ink",
}: {
  label: string;
  value: string;
  suffix?: string;
  tone?: string;
}) {
  return (
    <div>
      <p className={`text-3xl font-bold tabular-nums sm:text-4xl ${tone}`}>
        {value}
        {suffix && (
          <span className="ml-0.5 text-base font-medium text-muted">
            {suffix}
          </span>
        )}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

export default QuizResult;
