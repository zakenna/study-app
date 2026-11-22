// 기출 문제지 PDF 열기 (pdf.js). ⚖️ 파일은 이 기기 안에서만 읽고 렌더링한다 — 어디에도 보내지 않는다.
// pdf.js는 용량이 커서 CBT 화면에 들어갈 때만 불러온다(동적 import).
import type { PDFDocumentProxy } from "pdfjs-dist";
import { getExamPdf } from "./storage";

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

function loadPdfjs() {
  pdfjsPromise ??= Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]).then(([pdfjs, worker]) => {
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    return pdfjs;
  });
  return pdfjsPromise;
}

/** 파일 앞부분이 "%PDF-"인지 확인 (확장자만 바꾼 파일 거르기) */
export async function isPdfFile(file: File): Promise<boolean> {
  if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
    return false;
  }
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...head) === "%PDF-";
}

type LoadingTask = ReturnType<typeof import("pdfjs-dist").getDocument>;

async function openPdf(data: Blob): Promise<LoadingTask> {
  const pdfjs = await loadPdfjs();
  const bytes = new Uint8Array(await data.arrayBuffer());
  return pdfjs.getDocument({ data: bytes, verbosity: 0 });
}

/** 쪽수만 확인 (불러오기 검증용). 열 수 없으면 0 */
export async function countPdfPages(file: Blob): Promise<number> {
  try {
    const task = await openPdf(file);
    try {
      return (await task.promise).numPages;
    } finally {
      void task.destroy();
    }
  } catch {
    return 0;
  }
}

// 응시 화면 ↔ 결과 화면을 오갈 때 다시 파싱하지 않도록 회차별로 하나만 열어 둔다
const docCache = new Map<
  string,
  { savedAt: number; task: Promise<LoadingTask> }
>();

/** IndexedDB에 저장된 회차 PDF를 연다. 저장된 파일이 없으면 null */
export async function openExamPdf(
  examId: string,
): Promise<PDFDocumentProxy | null> {
  const stored = await getExamPdf(examId);
  if (!stored) {
    closeExamPdf(examId);
    return null;
  }
  const cached = docCache.get(examId);
  if (cached && cached.savedAt === stored.savedAt)
    return (await cached.task).promise;
  closeExamPdf(examId);
  const task = openPdf(stored.data);
  docCache.set(examId, { savedAt: stored.savedAt, task });
  try {
    return await (
      await task
    ).promise;
  } catch (err) {
    docCache.delete(examId);
    throw err;
  }
}

export function closeExamPdf(examId: string): void {
  const cached = docCache.get(examId);
  if (!cached) return;
  docCache.delete(examId);
  cached.task.then((t) => t.destroy()).catch(() => {});
}
