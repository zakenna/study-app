import { motion, type HTMLMotionProps } from "motion/react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  className?: string;
}

/** 반투명 유리 카드. 화면에 들어올 때 살짝 떠오르는 애니메이션 */
function GlassCard({ className = "", children, ...rest }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`hanji rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/10 backdrop-blur-xl ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default GlassCard;
