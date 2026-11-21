import { eraColor } from "../lib/labels";
import type { Era } from "../types";
import { avatarChar } from "./MatchPage.helpers";

/** 이니셜 아바타: 사진 없이 대표 글자 + 시대 색 원 (테마 변수만 사용) */
function PersonAvatar({
  name,
  era,
  size = "md",
}: {
  name: string;
  era: Era;
  size?: "sm" | "md";
}) {
  const dimension =
    size === "sm" ? "size-8 text-sm" : "size-11 text-lg sm:size-14 sm:text-2xl";
  return (
    <span
      aria-hidden
      style={{ backgroundColor: eraColor(era) }}
      className={`grid shrink-0 place-items-center rounded-full font-black text-canvas shadow-inner ${dimension}`}
    >
      {avatarChar(name)}
    </span>
  );
}

export default PersonAvatar;
