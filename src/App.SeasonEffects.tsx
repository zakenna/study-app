import { useReducedMotion } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";
import type { Season } from "./types";

interface SeasonEffectsProps {
  season: Season;
  enabled: boolean;
}

/** 계절별 입자 수 (동시에 25개 이하) */
const COUNTS: Record<Season, number> = {
  spring: 18,
  summer: 14,
  autumn: 16,
  winter: 24,
};

interface Particle {
  left: number; // %
  top: number; // % (반딧불용)
  size: number; // px
  duration: number; // s
  delay: number; // s (음수: 처음부터 화면 곳곳에 퍼져 있게)
  sway: number; // s
}

/** 결정적인 의사 난수 (렌더링마다 바뀌지 않게) */
function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const r = (n: number) => (((Math.sin((i + 1) * n) * 10000) % 1) + 1) % 1;
    return {
      left: r(12.9898) * 100,
      top: r(78.233) * 100,
      size: 0.7 + r(39.42) * 0.8,
      duration: 9 + r(7.13) * 9,
      delay: -r(3.77) * 18,
      sway: 2.5 + r(5.31) * 3,
    };
  });
}

/**
 * 🏯 계절별 배경 효과: 봄 벚꽃잎 / 여름 반딧불 / 가을 단풍잎 / 겨울 눈송이.
 * - 클릭을 막지 않음(pointer-events: none), 내용 뒤에 깔림
 * - 브라우저 탭이 안 보이면 멈춤, 동작 줄이기 설정이면 그리지 않음, ⚙️에서 끌 수 있음
 * - 모양·색은 index.css의 .fx-* 클래스(테마 변수로만 색을 만든다)
 */
function SeasonEffects({ season, enabled }: SeasonEffectsProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [hidden, setHidden] = useState(() => document.hidden);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (!enabled || reduceMotion) return null;
  const particles = makeParticles(COUNTS[season]);

  return (
    <div
      aria-hidden
      data-effects={season}
      data-paused={hidden || undefined}
      className="fx-layer pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
    >
      {particles.map((p, i) =>
        season === "summer" ? (
          <span
            key={`${season}-${i}`}
            className="fx-firefly"
            style={
              {
                left: `${p.left}%`,
                top: `${15 + p.top * 0.8}%`,
                "--s": p.size,
                animationDuration: `${p.duration * 0.7}s, ${p.sway}s`,
                animationDelay: `${p.delay}s, ${p.delay / 3}s`,
              } as CSSProperties
            }
          />
        ) : (
          <span
            key={`${season}-${i}`}
            className="fx-fall"
            style={{
              left: `${p.left}%`,
              animationDuration: `${season === "winter" ? p.duration * 0.9 : p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            <span
              className={`fx-${season === "spring" ? "petal" : season === "autumn" ? "leaf" : "snow"}`}
              style={
                {
                  "--s": p.size,
                  animationDuration: `${p.sway}s`,
                  animationDelay: `${p.delay / 2}s`,
                } as CSSProperties
              }
            />
          </span>
        ),
      )}
    </div>
  );
}

export default SeasonEffects;
