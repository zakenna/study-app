import {
  ChevronLeft,
  ChevronRight,
  FileWarning,
  Loader2,
  MoveHorizontal,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
} from "react";
import { openExamPdf } from "../lib/pdf";

/** 문제지를 특정 쪽으로 옮겨 달라는 요청. 같은 쪽을 다시 눌러도 이동하도록 seq를 올린다 */
export interface PageTarget {
  page: number;
  seq: number;
}

interface PdfViewerProps {
  examId: string;
  target: PageTarget;
  /** 확대하지 않은 상태에서 한 손가락으로 좌우로 밀었을 때 (모바일 탭 전환) */
  onSwipe?: (dir: "left" | "right") => void;
  className?: string;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const PAGE_GAP = 8;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

type Status = "loading" | "ready" | "missing" | "error";
type ViewState = { current: number; from: number; to: number };

/** 스크롤 위치로 지금 보는 쪽과 그려야 할 쪽 범위를 계산 (숨겨져 있으면 null) */
function measureView(
  root: HTMLDivElement | null,
  pages: (HTMLDivElement | null)[],
): ViewState | null {
  if (!root || root.clientHeight === 0) return null;
  const top = root.scrollTop;
  const h = root.clientHeight;
  const line = top + h / 3;
  const view: ViewState = { current: 1, from: 0, to: 0 };
  pages.forEach((el, i) => {
    if (!el) return;
    const n = i + 1;
    if (el.offsetTop <= line) view.current = n;
    const near =
      el.offsetTop + el.offsetHeight >= top - h / 2 &&
      el.offsetTop <= top + h * 1.5;
    if (near) {
      if (!view.from) view.from = n;
      view.to = n;
    }
  });
  return view;
}

/** ⚖️ 기기 안에서만 여는 공식 문제지 뷰어: 보이는 쪽만 그린다 (devicePixelRatio 반영) */
function PdfViewer({
  examId,
  target,
  onSwipe,
  className = "",
}: PdfViewerProps) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [ratios, setRatios] = useState<number[]>([]); // 쪽별 높이/너비
  const [zoom, setZoom] = useState(1); // 1 = 너비 맞춤
  const [fitWidth, setFitWidth] = useState(0);
  // 화면 근처(위아래 반 화면씩 여유)의 쪽 범위와 지금 보는 쪽
  const [view, setView] = useState<ViewState>({ current: 1, from: 1, to: 1 });
  const current = view.current;
  const pendingPage = useRef<number | null>(null); // 숨겨진 동안 들어온 이동 요청
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touch = useRef<{
    x: number;
    y: number;
    pinchDist?: number;
    pinchZoom?: number;
  } | null>(null);

  // 1) 저장된 PDF 열기 + 쪽 크기 읽기
  useEffect(() => {
    let alive = true;
    openExamPdf(examId)
      .then(async (d) => {
        if (!alive) return;
        if (!d) {
          setStatus("missing");
          return;
        }
        const sizes = await Promise.all(
          Array.from({ length: d.numPages }, async (_, i) => {
            const vp = (await d.getPage(i + 1)).getViewport({ scale: 1 });
            return vp.height / vp.width;
          }),
        );
        if (!alive) return;
        setRatios(sizes);
        setDoc(d);
        setStatus("ready");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, [examId]);

  const updateView = () => {
    const next = measureView(scrollRef.current, pageRefs.current);
    if (next)
      setView((prev) =>
        prev.current === next.current &&
        prev.from === next.from &&
        prev.to === next.to
          ? prev
          : next,
      );
  };

  // 2) 너비 맞춤 기준 = 스크롤 영역 안쪽 너비. 숨겨졌다 다시 보일 때(모바일 탭)도 여기로 들어온다
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el.clientHeight === 0) return; // 숨겨진 상태
      setFitWidth(el.clientWidth - 16);
      if (pendingPage.current !== null) {
        const pageEl = pageRefs.current[pendingPage.current - 1];
        if (pageEl) el.scrollTop = pageEl.offsetTop - PAGE_GAP;
        pendingPage.current = null;
      }
      const next = measureView(el, pageRefs.current);
      if (next) setView(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [status]);

  const pageWidth = Math.round(fitWidth * zoom);

  // 3) 쪽 크기가 바뀌면(확대·축소, 처음 표시) 보이는 범위를 다시 계산
  useEffect(() => {
    const next = measureView(scrollRef.current, pageRefs.current);
    if (next) setView(next);
  }, [pageWidth, status]);

  const scrollToPage = (page: number) => {
    const el = pageRefs.current[page - 1];
    scrollRef.current?.scrollTo({
      top: (el?.offsetTop ?? 0) - PAGE_GAP,
      behavior: "smooth",
    });
  };

  // 4) 문항을 고르면 그 쪽으로 이동
  const layoutReady = status === "ready" && fitWidth > 0;
  useEffect(() => {
    if (!layoutReady) return;
    const el = pageRefs.current[target.page - 1];
    const root = scrollRef.current;
    if (!el || !root) return;
    if (root.clientHeight === 0) {
      // 모바일 답안 탭에서 번호를 누른 경우: 문제지가 다시 보일 때 이동
      pendingPage.current = target.page;
      return;
    }
    // 바로 이동: 부드럽게 지나가면 중간 쪽들까지 그리느라 목표 쪽이 늦게 나온다
    root.scrollTop = el.offsetTop - PAGE_GAP;
  }, [target.page, target.seq, layoutReady]);

  const onScroll = updateView;
  // 확대·축소할 때 화면 가운데에 있던 위치를 유지 (새 크기가 그려진 직후에 맞춘다)
  const zoomAnchor = useRef<{ x: number; y: number } | null>(null);
  const changeZoom = (next: number) => {
    const root = scrollRef.current;
    if (root && !zoomAnchor.current) {
      zoomAnchor.current = {
        x:
          (root.scrollLeft + root.clientWidth / 2) /
          Math.max(1, root.scrollWidth),
        y:
          (root.scrollTop + root.clientHeight / 2) /
          Math.max(1, root.scrollHeight),
      };
    }
    setZoom(clampZoom(Math.round(next * 100) / 100));
  };
  useLayoutEffect(() => {
    const root = scrollRef.current;
    const a = zoomAnchor.current;
    zoomAnchor.current = null;
    if (!root || !a) return;
    root.scrollTop = a.y * root.scrollHeight - root.clientHeight / 2;
    root.scrollLeft = a.x * root.scrollWidth - root.clientWidth / 2;
  }, [pageWidth]);

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      touch.current = {
        x: 0,
        y: 0,
        pinchDist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
        pinchZoom: zoom,
      };
    } else if (e.touches.length === 1) {
      touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const onTouchMove = (e: TouchEvent) => {
    const t = touch.current;
    if (e.touches.length === 2 && t?.pinchDist && t.pinchZoom) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      changeZoom(t.pinchZoom * (dist / t.pinchDist));
    }
  };
  const onTouchEnd = (e: TouchEvent) => {
    const t = touch.current;
    touch.current = null;
    const root = scrollRef.current;
    if (!t || t.pinchDist || !onSwipe || !root || e.changedTouches.length !== 1)
      return;
    const dx = e.changedTouches[0].clientX - t.x;
    const dy = e.changedTouches[0].clientY - t.y;
    const canPanX = root.scrollWidth > root.clientWidth + 2;
    if (!canPanX && Math.abs(dx) > 70 && Math.abs(dy) < 50) {
      onSwipe(dx < 0 ? "left" : "right");
    }
  };

  const total = ratios.length;

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface ${className}`}
    >
      {/* 도구 막대 */}
      <div
        role="toolbar"
        aria-label="문제지 보기 도구"
        className="flex shrink-0 items-center gap-1 border-b border-line px-2 py-1.5 text-sm"
      >
        <ToolButton
          label="축소"
          onClick={() => changeZoom(zoom - 0.25)}
          disabled={status !== "ready" || zoom <= MIN_ZOOM}
        >
          <ZoomOut size={16} aria-hidden />
        </ToolButton>
        <span
          className="w-11 text-center text-xs text-muted tabular-nums"
          aria-live="polite"
        >
          {Math.round(zoom * 100)}%
        </span>
        <ToolButton
          label="확대"
          onClick={() => changeZoom(zoom + 0.25)}
          disabled={status !== "ready" || zoom >= MAX_ZOOM}
        >
          <ZoomIn size={16} aria-hidden />
        </ToolButton>
        <ToolButton
          label="너비 맞춤"
          onClick={() => changeZoom(1)}
          disabled={status !== "ready" || zoom === 1}
        >
          <MoveHorizontal size={16} aria-hidden />
        </ToolButton>
        <div className="ml-auto flex items-center gap-1">
          <ToolButton
            label="이전 쪽"
            onClick={() => scrollToPage(Math.max(1, current - 1))}
            disabled={status !== "ready" || current <= 1}
          >
            <ChevronLeft size={16} aria-hidden />
          </ToolButton>
          <span className="min-w-12 text-center text-xs text-muted tabular-nums">
            {status === "ready" ? `${current} / ${total}쪽` : "–"}
          </span>
          <ToolButton
            label="다음 쪽"
            onClick={() => scrollToPage(Math.min(total, current + 1))}
            disabled={status !== "ready" || current >= total}
          >
            <ChevronRight size={16} aria-hidden />
          </ToolButton>
        </div>
      </div>

      {/* 쪽들 */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-label="문제지"
        className="relative min-h-0 flex-1 touch-pan-x touch-pan-y overflow-auto overscroll-contain bg-line/40 p-2"
      >
        {status === "loading" && (
          <p className="flex h-full items-center justify-center gap-2 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" aria-hidden />
            문제지를 여는 중…
          </p>
        )}
        {(status === "missing" || status === "error") && (
          <p className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted">
            <FileWarning size={22} className="text-danger" aria-hidden />
            {status === "missing"
              ? "이 기기에 저장된 문제지 PDF가 없어요. 회차 목록에서 다시 불러와 주세요."
              : "PDF를 열 수 없어요. 회차 목록에서 파일을 다시 불러와 주세요."}
          </p>
        )}
        {status === "ready" && doc && pageWidth > 0 && (
          <div
            className="mx-auto flex flex-col"
            style={{ width: pageWidth, gap: PAGE_GAP }}
          >
            {ratios.map((ratio, i) => (
              <div
                key={i}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
                data-page={i + 1}
                aria-label={`${i + 1}쪽`}
                className="relative overflow-hidden rounded-sm bg-white shadow-md shadow-black/15"
                style={{ height: Math.round(pageWidth * ratio) }}
              >
                {i + 1 >= view.from && i + 1 <= view.to && (
                  <PageCanvas doc={doc} pageNumber={i + 1} width={pageWidth} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-line/50 hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** 한 쪽 그리기. 너비가 바뀌면(확대·축소) 잠시 기다렸다가 선명하게 다시 그린다 */
function PageCanvas({
  doc,
  pageNumber,
  width,
}: {
  doc: PDFDocumentProxy;
  pageNumber: number;
  width: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let task: RenderTask | null = null;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      try {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        // 너무 큰 캔버스는 메모리를 많이 써서 한 쪽 최대 약 1,600만 화소로 제한
        const maxScale = Math.sqrt(16_000_000 / (base.width * base.height));
        const scale = Math.min((width * dpr) / base.width, maxScale);
        const viewport = page.getViewport({ scale });
        const off = document.createElement("canvas");
        off.width = Math.floor(viewport.width);
        off.height = Math.floor(viewport.height);
        task = page.render({ canvas: off, viewport });
        await task.promise;
        if (cancelled) return;
        // 다 그린 뒤 한 번에 바꿔서 확대 중에도 깜빡이지 않게
        canvas.width = off.width;
        canvas.height = off.height;
        canvas.getContext("2d")?.drawImage(off, 0, 0);
      } catch {
        // 취소된 렌더링은 무시
      }
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      task?.cancel();
    };
  }, [doc, pageNumber, width]);

  // 화면에서 벗어나면 캔버스 메모리를 비운다
  useEffect(() => {
    const canvas = canvasRef.current;
    return () => {
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block size-full"
      aria-hidden
    />
  );
}

export default PdfViewer;
