import { Dices, Target } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import ProgressBar from "../components/ui/ProgressBar";
import { ERAS, ERA_LABELS } from "../lib/labels";
import {
  DEFAULT_QUIZ_SIZE,
  getEraProgress,
  hasStudyRecord,
  type QuizMode,
} from "../lib/quiz";
import { useStudyData } from "../lib/useStudyData";

interface QuizSelectProps {
  onStart: (mode: QuizMode) => void;
}

/** 1단계: 시대 / 전체 랜덤 / 약점 집중 선택 */
function QuizSelect({ onStart }: QuizSelectProps) {
  const { stats } = useStudyData();
  const canWeak = hasStudyRecord(stats);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">시대별 퀴즈</h2>
        <p className="mt-1 text-sm text-muted">
          틀리는 순간, 외우는 법까지 알려 드릴게요.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <BigModeButton
          icon={<Dices size={26} aria-hidden />}
          title={`🎲 전체 랜덤 ${DEFAULT_QUIZ_SIZE}문제`}
          description="안 푼 문제와 헷갈리는 문제 위주로"
          tone="primary"
          onClick={() => onStart("all")}
        />
        <BigModeButton
          icon={<Target size={26} aria-hidden />}
          title="🎯 약점 집중"
          description={
            canWeak
              ? "틀렸던 문제, 잊어 가는 문제부터"
              : "문제를 풀고 나면 열려요"
          }
          tone="accent"
          disabled={!canWeak}
          onClick={() => onStart("weak")}
        />
      </div>

      <section aria-labelledby="era-heading">
        <h3 id="era-heading" className="mb-3 text-sm font-semibold text-muted">
          시대를 골라 풀기
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ERAS.map((era, i) => {
            const progress = getEraProgress(era, stats);
            return (
              <motion.button
                key={era}
                type="button"
                onClick={() => onStart(era)}
                disabled={progress.total === 0}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex min-h-28 flex-col justify-between rounded-2xl border border-line bg-surface p-4 text-left backdrop-blur-xl transition hover:border-primary/50 disabled:opacity-40"
              >
                <div>
                  <p className="font-semibold">{ERA_LABELS[era]}</p>
                  <p className="text-xs text-muted">문제 {progress.total}개</p>
                </div>
                <div className="space-y-1.5">
                  <ProgressBar
                    value={progress.rate ?? 0}
                    tone="success"
                    label={`${ERA_LABELS[era]} 정답률`}
                  />
                  <p className="text-xs text-muted">
                    {progress.rate === null
                      ? "아직 안 풀었어요"
                      : `정답률 ${Math.round(progress.rate * 100)}%`}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

interface BigModeButtonProps {
  icon: ReactNode;
  title: string;
  description: string;
  tone: "primary" | "accent";
  disabled?: boolean;
  onClick: () => void;
}

function BigModeButton({
  icon,
  title,
  description,
  tone,
  disabled,
  onClick,
}: BigModeButtonProps) {
  const toneClass =
    tone === "primary"
      ? "border-primary/40 bg-primary/10 text-primary hover:border-primary/70"
      : "border-accent/40 bg-accent/10 text-accent hover:border-accent/70";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left backdrop-blur-xl transition disabled:cursor-not-allowed disabled:border-line disabled:bg-surface disabled:text-muted ${toneClass}`}
    >
      <span className="shrink-0">{icon}</span>
      <span>
        <span className="block text-lg font-bold text-ink">{title}</span>
        <span className="block text-sm text-muted">{description}</span>
      </span>
    </motion.button>
  );
}

export default QuizSelect;
