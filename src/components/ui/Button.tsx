import { motion, type HTMLMotionProps } from "motion/react";

type ButtonVariant = "primary" | "ghost" | "danger";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  className?: string;
}

// 밝은 배경 버튼의 글자색은 배경색(--color-base)을 쓴다.
// text + base 조합 클래스는 Tailwind 글자 크기 클래스와 이름이 겹쳐서 `text-(color:--color-base)`로 쓴다.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-(color:--color-base) font-semibold hover:brightness-110",
  ghost: "border border-line bg-surface text-ink hover:border-primary/60",
  danger:
    "bg-danger text-(color:--color-base) font-semibold hover:brightness-110",
};

/** 공용 버튼. 누를 때 살짝 작아지는 효과 */
function Button({
  variant = "primary",
  type = "button",
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}

export default Button;
