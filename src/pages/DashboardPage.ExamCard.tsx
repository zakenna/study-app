import { ClipboardCheck } from "lucide-react";
import Badge from "../components/ui/Badge";
import { gradeFor } from "../lib/exam";
import type { ExamResult } from "../lib/storage";

interface DashboardExamCardProps {
  examResults: ExamResult[];
  onGoExam: () => void;
}

/** 최근 기출 점수 (작은 카드). 기록이 없으면 기출 채점으로 안내 */
function DashboardExamCard({ examResults, onGoExam }: DashboardExamCardProps) {
  const latest = [...examResults].sort((a, b) => b.takenAt - a.takenAt)[0];
  const date = latest ? new Date(latest.takenAt) : null;

  return (
    <button
      type="button"
      onClick={onGoExam}
      className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-left shadow-lg shadow-black/20 backdrop-blur-xl transition hover:border-primary/50 sm:p-5"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
        <ClipboardCheck size={20} aria-hidden />
      </span>
      {latest && date ? (
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted">
            최근 기출 점수 ·{" "}
            {latest.isSample ? "샘플 회차" : `제${latest.round}회 심화`} ·{" "}
            {date.getMonth() + 1}월 {date.getDate()}일
          </span>
          <span className="mt-0.5 flex items-center gap-2">
            <span className="text-2xl font-bold tabular-nums">
              {latest.score}점
            </span>
            <Badge tone={latest.score >= 60 ? "success" : "danger"}>
              {gradeFor(latest.score)}
            </Badge>
            {latest.isSample && <Badge tone="danger">샘플</Badge>}
          </span>
        </span>
      ) : (
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">기출 OMR로 실력 점검</span>
          <span className="block text-xs text-muted">
            공식 기출 문제를 풀고 바로 채점·시대별 분석을 받아 보세요
          </span>
        </span>
      )}
      <span aria-hidden className="text-muted">
        →
      </span>
    </button>
  );
}

export default DashboardExamCard;
