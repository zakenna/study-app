// 숫자가 0에서 target까지 올라가는 애니메이션 훅 — 🔒 팀장 소유 (퀴즈 결과, 오답노트 요약에서 공통 사용)
import { animate, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export function useCountUp(target: number, delay: number = 0): number {
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
