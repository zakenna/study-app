import { motion } from "motion/react";

type ProgressTone = "primary" | "accent" | "success" | "danger";

interface ProgressBarProps {
  /** 현재 값 */
  value: number;
  /** 최댓값 (기본 1 → value를 0~1 비율로 넘겨도 됨) */
  max?: number;
  tone?: ProgressTone;
  /** 스크린리더용 이름 */
  label?: string;
  className?: string;
}

const TONE_CLASSES: Record<ProgressTone, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  danger: "bg-danger",
};

/** 진행률 막대. 값이 바뀌면 부드럽게 늘어난다 */
function ProgressBar({
  value,
  max = 1,
  tone = "primary",
  label,
  className = "",
}: ProgressBarProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={`h-2 w-full overflow-hidden rounded-full bg-line ${className}`}
    >
      <motion.div
        className={`h-full rounded-full ${TONE_CLASSES[tone]}`}
        initial={{ width: 0 }}
        animate={{ width: `${ratio * 100}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

export default ProgressBar;
