import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";

interface IntroProps {
  /** 프로필이 있으면 재방문: 짧게(1초) 자동으로 열리고 "건너뛰기" 제공 */
  returning: boolean;
  onDone: () => void;
}

/* 봄 테마 색만으로 섞어 쓰는 연한 벚꽃·빛 색 (테마 변수만 사용) */
const BLOSSOM =
  "color-mix(in oklab, var(--color-accent) 38%, var(--color-paper))";
const BLOSSOM_DEEP =
  "color-mix(in oklab, var(--color-accent) 70%, var(--color-paper))";

/**
 * 🏯 한옥 문 소개 화면 — "한옥 문을 열고 역사 속으로".
 * 봄 테마 고정(data-season="spring"). 사진 없이 SVG·CSS로 기와 지붕, 벚꽃 가지, 띠살문 양문을 그린다.
 * "시작하기"(낙관)를 누르면 양문이 3D로 바깥쪽으로 열리고 안쪽에서 빛이 퍼진 뒤 앱이 나타난다.
 */
function Intro({ returning, onDone }: IntroProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [opening, setOpening] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const doorSec = returning ? 0.5 : 1.1;
  // 문이 다 열린 뒤 소개 화면이 사라지기까지 기다리는 시간
  const exitAfterMs = reduceMotion ? 0 : doorSec * 1000 + (returning ? 0 : 350);

  const open = () => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(() => setLeaving(true), exitAfterMs);
  };

  // 재방문: 잠깐 보여 준 뒤 자동으로 연다 (전체 약 1초)
  useEffect(() => {
    if (!returning) return;
    const startMs = reduceMotion ? 100 : 150;
    const t1 = window.setTimeout(() => setOpening(true), startMs);
    const t2 = window.setTimeout(() => setLeaving(true), startMs + exitAfterMs);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [returning, reduceMotion, exitAfterMs]);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!leaving && (
        <motion.section
          key="intro"
          data-season="spring"
          aria-label="한옥 문 소개 화면"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion || returning ? 0.3 : 0.5 }}
          className="hanji fixed inset-0 z-[70] flex flex-col items-center overflow-hidden bg-canvas text-ink"
        >
          <Roof />
          <BlossomBranch className="absolute top-14 -left-6 w-44 sm:w-60" />
          <BlossomBranch className="absolute top-14 -right-6 w-44 -scale-x-100 sm:w-60" />
          {!reduceMotion && <Petals />}

          {returning && (
            <button
              type="button"
              onClick={() => setLeaving(true)}
              className="absolute top-32 right-4 z-10 rounded-full border border-line bg-paper/80 px-3 py-1.5 text-xs text-muted hover:text-ink"
            >
              건너뛰기
            </button>
          )}

          <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-6 pt-24 pb-10">
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center text-4xl font-bold tracking-tight sm:text-5xl"
            >
              한국사 <span className="text-accent">꿀팁</span>
            </motion.h1>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-2 mb-7 max-w-xs text-center text-sm leading-relaxed text-muted sm:max-w-sm sm:text-base"
            >
              틀리는 순간, 외우는 법까지 알려주는 한국사 자격증 앱
            </motion.p>

            <Doors
              opening={opening}
              doorSec={doorSec}
              reduceMotion={reduceMotion}
              onStart={open}
              autoFocus={!returning}
            />
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/* ---------------- 한옥 양문 (띠살문) ---------------- */

function Doors({
  opening,
  doorSec,
  reduceMotion,
  onStart,
  autoFocus,
}: {
  opening: boolean;
  doorSec: number;
  reduceMotion: boolean;
  onStart: () => void;
  autoFocus: boolean;
}) {
  const swing = (side: "left" | "right") =>
    reduceMotion
      ? { opacity: opening ? 0 : 1 }
      : { rotateY: opening ? (side === "left" ? -108 : 108) : 0 };

  return (
    <div className="relative w-[min(78vw,340px)]">
      {/* 문틀 위 인방(가로 나무) */}
      <div className="mx-[-10px] h-4 rounded-t-md bg-wood shadow-md shadow-black/20" />
      <div
        className="relative aspect-[5/6] border-x-[10px] border-b-[10px] border-wood bg-paper"
        style={{ perspective: 1200 }}
      >
        {/* 문 안쪽: 열리면 빛이 퍼진다 */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 55%, var(--color-paper) 0%, color-mix(in oklab, var(--color-accent) 18%, var(--color-paper)) 35%, transparent 75%)",
          }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={
            opening
              ? { opacity: 1, scale: reduceMotion ? 1 : 2.4 }
              : { opacity: 0, scale: 0.4 }
          }
          transition={{
            duration: reduceMotion ? 0.2 : doorSec * 1.2,
            ease: "easeOut",
          }}
        />

        <div className="absolute inset-0 flex">
          {(["left", "right"] as const).map((side) => (
            <motion.div
              key={side}
              aria-hidden
              className={`relative h-full w-1/2 ${side === "left" ? "origin-left" : "origin-right"}`}
              style={
                {
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                } as CSSProperties
              }
              animate={swing(side)}
              transition={{
                duration: reduceMotion ? 0.3 : doorSec,
                ease: [0.55, 0, 0.3, 1],
              }}
            >
              <DoorLeaf side={side} />
            </motion.div>
          ))}
        </div>

        {/* 낙관(도장) 모양 "시작하기" 버튼: 두 문짝이 만나는 가운데 */}
        <AnimatePresence>
          {!opening && (
            <motion.button
              type="button"
              onClick={onStart}
              autoFocus={autoFocus}
              initial={
                reduceMotion ? false : { scale: 0.6, opacity: 0, rotate: -12 }
              }
              animate={{ scale: 1, opacity: 1, rotate: -5 }}
              exit={{ scale: 1.15, opacity: 0 }}
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
                delay: reduceMotion ? 0 : 0.4,
              }}
              className="absolute top-1/2 left-1/2 z-10 -mt-12 -ml-12 grid size-24 place-items-center rounded-lg bg-danger font-title text-xl leading-tight font-bold text-canvas shadow-lg shadow-black/25 outline-none focus-visible:ring-4 focus-visible:ring-primary/50"
            >
              <span className="grid size-[84px] place-items-center rounded-md border-2 border-canvas/70">
                시작
                <br />
                하기
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** 문짝 하나: 테두리 + 띠살(세로 살) + 위·가운데·아래 가로 띠 + 문고리 */
function DoorLeaf({ side }: { side: "left" | "right" }) {
  const verticalBars =
    "repeating-linear-gradient(90deg, var(--color-wood) 0 2px, transparent 2px 15px)";
  const band =
    "repeating-linear-gradient(0deg, var(--color-wood) 0 2px, transparent 2px 7px)";
  return (
    <div className="absolute inset-0 border-[5px] border-wood bg-paper shadow-inner">
      <div
        className="absolute inset-1 opacity-80"
        style={{ backgroundImage: verticalBars }}
      />
      {["top-[6%]", "top-[46%]", "bottom-[6%]"].map((pos) => (
        <div
          key={pos}
          className={`absolute inset-x-1 h-[9%] ${pos}`}
          style={{ backgroundImage: band }}
        />
      ))}
      {/* 문고리: 동그란 고리 + 받침 */}
      <div
        className={`absolute top-1/2 ${side === "left" ? "right-2" : "left-2"} -mt-5 flex flex-col items-center`}
      >
        <span className="size-2.5 rounded-full bg-roof" />
        <span className="-mt-0.5 size-6 rounded-full border-[3px] border-roof" />
      </div>
    </div>
  );
}

/* ---------------- 기와 지붕 ---------------- */

function Roof() {
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 h-28 text-roof">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="roof-ridges"
            width="22"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <rect width="22" height="120" fill="currentColor" />
            <rect
              x="0"
              width="3"
              height="120"
              fill="var(--color-canvas)"
              opacity="0.12"
            />
          </pattern>
        </defs>
        {/* 지붕면: 가운데가 낮고 양 끝이 들린 처마 곡선 */}
        <path
          d="M0 0 H1000 V58 Q 930 96 780 92 L 220 92 Q 70 96 0 58 Z"
          fill="url(#roof-ridges)"
        />
        {/* 서까래 끝 (나무색 작은 네모) */}
        <path
          d="M40 92 H960"
          stroke="var(--color-wood)"
          strokeWidth="9"
          strokeDasharray="7 15"
          opacity="0.9"
        />
      </svg>
      {/* 막새 기와 줄 */}
      <div
        className="absolute inset-x-[8%] top-[76%] h-3"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 30%, currentColor 0 5px, transparent 5.5px)",
          backgroundSize: "16px 12px",
          backgroundRepeat: "repeat-x",
        }}
      />
    </div>
  );
}

/* ---------------- 벚꽃 가지 ---------------- */

function Blossom({
  x,
  y,
  r,
  deep = false,
}: {
  x: number;
  y: number;
  r: number;
  deep?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy={-r * 0.55}
          rx={r * 0.42}
          ry={r * 0.6}
          transform={`rotate(${deg})`}
          fill={deep ? BLOSSOM_DEEP : BLOSSOM}
        />
      ))}
      <circle r={r * 0.22} fill="var(--color-accent)" />
    </g>
  );
}

function BlossomBranch({ className }: { className: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 220 170">
      <path
        d="M0 20 C 50 30, 80 40, 120 70 S 180 120, 215 150"
        fill="none"
        stroke="var(--color-wood)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M70 38 C 85 20, 100 14, 118 10"
        fill="none"
        stroke="var(--color-wood)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M130 80 C 150 70, 160 58, 168 44"
        fill="none"
        stroke="var(--color-wood)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Blossom x={40} y={27} r={13} />
      <Blossom x={95} y={22} r={11} deep />
      <Blossom x={120} y={10} r={10} />
      <Blossom x={118} y={68} r={14} />
      <Blossom x={168} y={44} r={12} deep />
      <Blossom x={178} y={118} r={13} />
      <Blossom x={210} y={150} r={9} deep />
    </svg>
  );
}

/* ---------------- 흩날리는 꽃잎 ---------------- */

const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i * 0.53) % 6,
  duration: 7 + (i % 5) * 1.3,
  size: 8 + (i % 4) * 3,
  drift: (i % 2 ? 1 : -1) * (30 + (i % 3) * 25),
}));

function Petals() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {PETALS.map((p, i) => (
        <motion.span
          key={i}
          className="absolute -top-6 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.75,
            background: i % 3 ? BLOSSOM : BLOSSOM_DEEP,
            borderRadius: "70% 0 70% 0",
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, p.drift, 0],
            rotate: [0, 200, 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export default Intro;
