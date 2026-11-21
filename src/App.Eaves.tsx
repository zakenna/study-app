/**
 * 헤더 아래 기와 처마선 장식 (SVG·CSS로 직접 그림).
 * 양 끝이 살짝 들린 처마 곡선 + 그 아래 막새 기와 줄. 헤더 높이를 바꾸지 않도록 헤더 아래에 겹쳐 그린다.
 */
function Eaves() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-full h-3 text-roof"
    >
      {/* 처마 곡선: 양 끝이 위로 들린 얇은 지붕선 */}
      <svg
        className="absolute inset-x-0 top-0 h-2 w-full"
        viewBox="0 0 1000 20"
        preserveAspectRatio="none"
      >
        <path
          d="M0 0 Q 40 14 140 12 L 860 12 Q 960 14 1000 0 L 1000 6 Q 960 18 860 18 L 140 18 Q 40 18 0 6 Z"
          fill="currentColor"
          opacity="0.85"
        />
      </svg>
      {/* 막새 기와 줄: 작은 반원이 반복 */}
      <div
        className="absolute inset-x-6 top-[7px] h-[5px] opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0, currentColor 0 3.5px, transparent 4px)",
          backgroundSize: "12px 5px",
          backgroundRepeat: "repeat-x",
        }}
      />
    </div>
  );
}

export default Eaves;
