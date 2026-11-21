import { motion, type HTMLMotionProps } from "motion/react";

type ButtonVariant = "primary" | "ghost" | "danger";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-canvas font-semibold hover:brightness-110",
  ghost: "border border-line bg-surface text-ink hover:border-primary/60",
  danger: "bg-danger text-canvas font-semibold hover:brightness-110",
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
