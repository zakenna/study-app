// 4지선다 보기 버튼 — 🔒 팀장 소유 (퀴즈, 오답노트 다시 풀기, 꿀팁 연결 문제에서 공통 사용).
// 정답: 초록 + 살짝 커짐 + 점이 퍼지는 축하 효과 / 오답: 빨강 흔들림 / 나머지: 흐리게
import { Check, X } from "lucide-react";
import { motion } from "motion/react";

export type OptionState = "idle" | "correct" | "wrong" | "dimmed";

interface OptionButtonProps {
  index: number;
  text: string;
  state: OptionState;
  celebrate: boolean;
  reduceMotion: boolean;
  disabled: boolean;
  onClick: () => void;
}

const OPTION_CLASSES: Record<OptionState, string> = {
  idle: "border-line bg-surface hover:border-primary/60 hover:bg-primary/5",
  correct: "border-success bg-success/15",
  wrong: "border-danger bg-danger/15",
  dimmed: "border-line bg-surface opacity-45",
};

function OptionButton({
  index,
  text,
  state,
  celebrate,
  reduceMotion,
  disabled,
  onClick,
}: OptionButtonProps) {
  const animate =
    reduceMotion || state === "idle" || state === "dimmed"
      ? { x: 0, scale: 1 }
      : state === "wrong"
        ? { x: [0, -10, 10, -6, 6, 0], scale: 1 }
        : { x: 0, scale: [1, 1.03, 1] };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      animate={animate}
      transition={{ duration: state === "wrong" ? 0.4 : 0.3 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      aria-label={`${index + 1}번 보기: ${text}`}
      className={`relative flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-default ${OPTION_CLASSES[state]}`}
    >
      <span
        aria-hidden
        className={`grid size-7 shrink-0 place-items-center rounded-lg border text-sm font-semibold ${
          state === "correct"
            ? "border-success text-success"
            : state === "wrong"
              ? "border-danger text-danger"
              : "border-line text-muted"
        }`}
      >
        {index + 1}
      </span>
      <span className="flex-1 leading-snug">{text}</span>
      {state === "correct" && (
        <Check size={20} className="shrink-0 text-success" aria-hidden />
      )}
      {state === "wrong" && (
        <X size={20} className="shrink-0 text-danger" aria-hidden />
      )}
      {celebrate && !reduceMotion && <Burst />}
    </motion.button>
  );
}

const BURST_COLORS = ["bg-success", "bg-primary", "bg-accent"];
const BURST_COUNT = 14;

/** 정답 시 가벼운 축하 효과: 작은 점들이 사방으로 퍼졌다 사라진다 */
function Burst() {
  return (
    <span aria-hidden className="pointer-events-none absolute top-1/2 right-10">
      {Array.from({ length: BURST_COUNT }, (_, i) => {
        const angle = (i / BURST_COUNT) * Math.PI * 2;
        const distance = 34 + (i % 3) * 14;
        return (
          <motion.span
            key={i}
            className={`absolute size-1.5 rounded-full ${BURST_COLORS[i % BURST_COLORS.length]}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: 0,
              scale: 0.5,
            }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
        );
      })}
    </span>
  );
}

export default OptionButton;
