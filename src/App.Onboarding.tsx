import { X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useId, useState, type FormEvent } from "react";
import Button from "./components/ui/Button";
import { parseDateKey } from "./lib/date";
import type { Profile } from "./types";

interface OnboardingProps {
  /** 수정 모드일 때 기존 프로필 */
  initialProfile: Profile | null;
  onSave: (profile: Profile) => void;
  /** 넘기면 닫기 버튼과 Esc 닫기가 생긴다 (첫 방문에는 닫을 수 없음) */
  onClose?: () => void;
}

const LEVELS: { value: Profile["level"]; label: string }[] = [
  { value: "advanced", label: "심화" },
  { value: "basic", label: "기본" },
];

const INPUT_CLASS =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-ink placeholder:text-muted focus:border-primary focus:outline-none";

/** 첫 방문 온보딩 / 프로필 수정 모달 */
function Onboarding({ initialProfile, onSave, onClose }: OnboardingProps) {
  const titleId = useId();
  const [name, setName] = useState(initialProfile?.name ?? "");
  const [examDate, setExamDate] = useState(initialProfile?.examDate ?? "");
  const [level, setLevel] = useState<Profile["level"]>(
    initialProfile?.level ?? "advanced",
  );
  const [dailyGoal, setDailyGoal] = useState(
    String(initialProfile?.dailyGoal ?? 20),
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!onClose) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const goal = Number(dailyGoal);

    if (!trimmedName) return setError("이름을 입력해 주세요.");
    if (examDate && !parseDateKey(examDate))
      return setError("시험 날짜 형식이 올바르지 않아요.");
    if (!Number.isInteger(goal) || goal < 1 || goal > 200)
      return setError("하루 목표는 1~200 사이 숫자로 입력해 주세요.");

    onSave({
      name: trimmedName,
      examDate: examDate || undefined,
      level,
      dailyGoal: goal,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-base/70 p-4 backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-md space-y-4 rounded-2xl border border-line bg-base/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-4 right-4 rounded-lg p-1 text-muted hover:text-ink"
          >
            <X size={20} aria-hidden />
          </button>
        )}

        <div>
          <h2 id={titleId} className="text-xl font-bold">
            {initialProfile ? "프로필 수정" : "반가워요! 👋"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {initialProfile
              ? "시험 정보가 바뀌었다면 수정해 주세요."
              : "몇 가지만 알려주시면 맞춤 학습을 준비할게요."}
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">이름</span>
          <input
            className={INPUT_CLASS}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 홍길동"
            maxLength={20}
            autoFocus
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">
            시험 날짜 <span className="text-muted">(선택)</span>
          </span>
          <input
            type="date"
            className={INPUT_CLASS}
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
        </label>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium">목표 급수</legend>
          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={level === option.value}
                onClick={() => setLevel(option.value)}
                className={`min-h-11 rounded-xl border text-sm transition ${
                  level === option.value
                    ? "border-primary bg-primary/15 font-semibold text-primary"
                    : "border-line bg-surface text-muted hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">하루 목표 문제 수</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={200}
            className={INPUT_CLASS}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(e.target.value)}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full">
          {initialProfile ? "저장" : "시작하기"}
        </Button>
      </motion.form>
    </motion.div>
  );
}

export default Onboarding;
