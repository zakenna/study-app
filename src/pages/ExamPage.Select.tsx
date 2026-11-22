import {
  CheckCircle2,
  ExternalLink,
  FileQuestion,
  FileUp,
  Loader2,
  MonitorPlay,
  PencilLine,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import {
  EXAM_BOARD_URL,
  EXAM_MINUTES,
  EXAM_QUESTION_COUNT,
  EXAM_SOURCE_LABEL,
  exams,
  type Exam,
} from "../data/exams";
import { gradeFor } from "../lib/exam";
import { closeExamPdf, countPdfPages, isPdfFile } from "../lib/pdf";
import {
  deleteExamPdf,
  getExamDraft,
  listExamPdfs,
  saveExamPdf,
  type ExamDraft,
  type ExamPdfInfo,
} from "../lib/storage";
import { useStudyData } from "../lib/useStudyData";
import {
  ConfirmDialog,
  type ExamMode,
  type ExamResume,
} from "./ExamPage.Sheet";

const formatDate = (key: string) => {
  const [y, m, d] = key.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
};

const formatClock = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

interface ExamSelectProps {
  onStart: (exam: Exam, mode: ExamMode, resume?: ExamResume) => void;
}

/** 1단계: 회차 선택 + 공식 문제지 PDF 불러오기 (기기 안에만 보관) */
function ExamSelect({ onStart }: ExamSelectProps) {
  const { examResults } = useStudyData();
  // 화면에 들어올 때 한 번 읽는다 (sessionStorage 임시 저장)
  const [draft] = useState<ExamDraft | null>(() => getExamDraft());
  const [choiceFor, setChoiceFor] = useState<{
    exam: Exam;
    mode: ExamMode;
  } | null>(null);
  const [pdfs, setPdfs] = useState<Record<string, ExamPdfInfo>>({});
  const [busy, setBusy] = useState<string | null>(null); // 불러오는 중인 examId
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteFor, setDeleteFor] = useState<Exam | null>(null);

  const refreshPdfs = async () => {
    const list = await listExamPdfs();
    setPdfs(Object.fromEntries(list.map((p) => [p.examId, p])));
  };

  useEffect(() => {
    let alive = true;
    listExamPdfs().then((list) => {
      if (alive) setPdfs(Object.fromEntries(list.map((p) => [p.examId, p])));
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleStart = (exam: Exam, mode: ExamMode) => {
    if (draft && draft.examId === exam.id) setChoiceFor({ exam, mode });
    else onStart(exam, mode);
  };

  const setError = (examId: string, message: string) =>
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[examId] = message;
      else delete next[examId];
      return next;
    });

  const handleFile = async (exam: Exam, file: File | undefined) => {
    if (!file) return;
    setError(exam.id, "");
    setBusy(exam.id);
    try {
      if (!(await isPdfFile(file))) {
        setError(exam.id, "PDF 파일만 불러올 수 있어요.");
        return;
      }
      const pages = await countPdfPages(file);
      const needPages = Math.max(0, ...(exam.questionPages ?? []));
      if (pages === 0) {
        setError(
          exam.id,
          "PDF를 열 수 없어요. 파일이 손상되지 않았는지 확인해 주세요.",
        );
        return;
      }
      if (pages < needPages) {
        setError(
          exam.id,
          `${pages}쪽짜리 파일이에요. 제${exam.round}회 심화 문제지(${needPages}쪽)가 맞는지 확인해 주세요.`,
        );
        return;
      }
      if (!(await saveExamPdf(exam.id, file))) {
        setError(
          exam.id,
          "이 기기에 저장하지 못했어요. 저장 공간을 확인해 주세요.",
        );
        return;
      }
      closeExamPdf(exam.id); // 예전에 열어 둔 파일이 있으면 닫는다
      await refreshPdfs();
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (exam: Exam) => {
    setDeleteFor(null);
    closeExamPdf(exam.id);
    await deleteExamPdf(exam.id);
    await refreshPdfs();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">기출 채점</h2>
        <p className="mt-1 text-sm text-muted">
          공식 문제지 PDF를 불러오면 한 화면에서 문제를 보며 답을 표시하는 CBT로
          응시할 수 있어요. PDF 없이 OMR만으로도 채점해요.
        </p>
      </div>

      <GlassCard className="space-y-3 text-sm">
        <p className="flex items-start gap-3">
          <FileQuestion
            size={20}
            className="mt-0.5 shrink-0 text-accent"
            aria-hidden
          />
          <span className="text-muted">
            문제지는 국사편찬위원회{" "}
            <span className="text-ink">시험 자료실</span>에서 내려받아 보세요.
            이 앱에는 문제 원문이 없고, 정답·배점만으로 채점해요.
          </span>
        </p>
        <p className="flex items-start gap-3">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-success"
            aria-hidden
          />
          <span className="text-muted">
            <span className="font-semibold text-ink">
              파일은 이 기기 안에서만 열리며 어디에도 업로드되지 않아요.
            </span>{" "}
            다음에 다시 불러오지 않도록 이 브라우저에만 보관하고, 언제든 삭제할
            수 있어요.
          </span>
        </p>
      </GlassCard>

      {exams.length === 0 ? (
        <GlassCard className="py-10 text-center">
          <p className="font-semibold">아직 등록된 회차가 없어요</p>
          <p className="mt-1 text-sm text-muted">
            공식 정답이 확인되는 대로 추가할게요.
          </p>
        </GlassCard>
      ) : (
        <ul className="space-y-3">
          {exams.map((exam) => {
            const mine = examResults.filter((r) => r.examId === exam.id);
            const best =
              mine.length > 0 ? Math.max(...mine.map((r) => r.score)) : null;
            const pdf = pdfs[exam.id];
            const resuming = draft?.examId === exam.id;
            return (
              <li key={exam.id}>
                <GlassCard className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold">
                        {exam.isSample ? "샘플 회차" : `제${exam.round}회`}{" "}
                        <span className="text-sm font-medium text-muted">
                          심화
                        </span>
                      </p>
                      <p className="text-xs text-muted">
                        {exam.isSample
                          ? "개발 확인용 · 가짜 정답"
                          : `자료 게시일 ${formatDate(exam.postedAt)}`}{" "}
                        · {EXAM_QUESTION_COUNT}문항 · {EXAM_MINUTES}분
                      </p>
                    </div>
                    {exam.isSample && <Badge tone="danger">샘플</Badge>}
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-canvas/40 px-3 py-2 text-sm">
                    <span className="text-muted">내 최고 점수</span>
                    {best === null ? (
                      <span className="text-muted">아직 응시 전</span>
                    ) : (
                      <span className="font-semibold tabular-nums">
                        {best}점 · {gradeFor(best)}{" "}
                        <span className="text-xs font-normal text-muted">
                          ({mine.length}회 응시)
                        </span>
                      </span>
                    )}
                  </div>

                  {/* 문제지 PDF */}
                  {exam.questionPages && (
                    <PdfRow
                      exam={exam}
                      pdf={pdf}
                      busy={busy === exam.id}
                      error={errors[exam.id]}
                      onFile={(file) => handleFile(exam, file)}
                      onDelete={() => setDeleteFor(exam)}
                    />
                  )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    {pdf && (
                      <Button
                        className="sm:col-span-2"
                        onClick={() => handleStart(exam, "cbt")}
                      >
                        <MonitorPlay size={16} aria-hidden />
                        {resuming ? "CBT 이어서 응시" : "CBT 응시하기"}
                      </Button>
                    )}
                    <a
                      href={EXAM_BOARD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink transition hover:border-primary/60"
                    >
                      공식 기출 PDF 받기
                      <ExternalLink size={14} aria-hidden />
                      <span className="sr-only">
                        (새 창, 국사편찬위원회 시험 자료실)
                      </span>
                    </a>
                    <Button
                      variant={pdf ? "ghost" : "primary"}
                      onClick={() => handleStart(exam, "omr")}
                    >
                      <PencilLine size={16} aria-hidden />
                      {resuming && !pdf ? "OMR 이어서 응시" : "OMR만으로 응시"}
                    </Button>
                  </div>
                </GlassCard>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-center text-[11px] text-muted">{EXAM_SOURCE_LABEL}</p>

      <AnimatePresence>
        {choiceFor && draft && (
          <ConfirmDialog onClose={() => setChoiceFor(null)}>
            <p className="text-lg font-bold">풀던 답안이 있어요</p>
            <p className="mt-1 text-sm text-muted">
              {draft.answers.filter((a) => a > 0).length}문항 표시
              {draft.flagged?.length
                ? ` · 🚩 다시 보기 ${draft.flagged.length}`
                : ""}{" "}
              · 남은 시간{" "}
              {formatClock(Math.max(0, Math.round(draft.remaining)))}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                onClick={() => onStart(choiceFor.exam, choiceFor.mode)}
              >
                <RotateCcw size={16} aria-hidden />
                새로 시작
              </Button>
              <Button
                onClick={() =>
                  onStart(choiceFor.exam, choiceFor.mode, {
                    answers: draft.answers,
                    remaining: draft.remaining,
                    flagged: draft.flagged,
                  })
                }
              >
                <PencilLine size={16} aria-hidden />
                이어서 풀기
              </Button>
            </div>
          </ConfirmDialog>
        )}
        {deleteFor && (
          <ConfirmDialog onClose={() => setDeleteFor(null)}>
            <p className="text-lg font-bold">
              제{deleteFor.round}회 문제지 PDF를 삭제할까요?
            </p>
            <p className="mt-1 text-sm text-muted">
              이 기기에 보관한 파일만 지워져요. 응시 기록은 그대로예요.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setDeleteFor(null)}>
                취소
              </Button>
              <Button variant="danger" onClick={() => handleDelete(deleteFor)}>
                <Trash2 size={16} aria-hidden />
                삭제
              </Button>
            </div>
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </div>
  );
}

function PdfRow({
  exam,
  pdf,
  busy,
  error,
  onFile,
  onDelete,
}: {
  exam: Exam;
  pdf?: ExamPdfInfo;
  busy: boolean;
  error?: string;
  onFile: (file: File | undefined) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFile(e.target.files?.[0]);
    e.target.value = ""; // 같은 파일을 다시 골라도 동작하게
  };

  return (
    <div className="space-y-1.5">
      <div
        className={`flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
          pdf ? "border-success/40 bg-success/10" : "border-dashed border-line"
        }`}
      >
        {pdf ? (
          <>
            <CheckCircle2
              size={16}
              className="shrink-0 text-success"
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span className="font-semibold text-success">PDF 준비됨</span>{" "}
              <span className="text-xs text-muted">
                {pdf.fileName} · {formatSize(pdf.size)}
              </span>
            </span>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs text-muted transition hover:text-danger"
            >
              <Trash2 size={14} aria-hidden />
              저장된 PDF 삭제
            </button>
          </>
        ) : (
          <>
            <span className="min-w-0 flex-1 text-xs text-muted">
              제{exam.round}회 심화 문제지 PDF를 불러오면 CBT로 응시할 수
              있어요.
            </span>
            <Button
              variant="ghost"
              className="min-h-9 py-1"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : (
                <FileUp size={16} aria-hidden />
              )}
              {busy ? "확인 중…" : "📄 PDF 불러오기"}
            </Button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          tabIndex={-1}
          aria-label={`제${exam.round}회 문제지 PDF 파일 선택`}
          onChange={onChange}
        />
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default ExamSelect;
