import {
  Hourglass,
  LayoutDashboard,
  Lightbulb,
  NotebookPen,
  Puzzle,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ComponentType } from "react";
import Onboarding from "./App.Onboarding";
import { calcStudyStreak, daysUntil } from "./lib/date";
import { saveProfile } from "./lib/storage";
import { useStudyData } from "./lib/useStudyData";
import DashboardPage from "./pages/DashboardPage";
import MatchPage from "./pages/MatchPage";
import QuizPage from "./pages/QuizPage";
import TimelinePage from "./pages/TimelinePage";
import TipsPage from "./pages/TipsPage";
import WrongNotePage from "./pages/WrongNotePage";
import type { Profile } from "./types";

export type TabId =
  "dashboard" | "quiz" | "wrong-note" | "tips" | "timeline" | "match";

/** 모든 페이지가 받는 props. 다른 탭으로 이동할 때 onNavigate("dashboard")처럼 쓴다 */
export interface PageProps {
  onNavigate: (tab: TabId) => void;
}

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
  page: ComponentType<PageProps>;
}

const TABS: Tab[] = [
  {
    id: "dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
    page: DashboardPage,
  },
  { id: "quiz", label: "퀴즈", icon: ScrollText, page: QuizPage },
  {
    id: "wrong-note",
    label: "오답노트",
    icon: NotebookPen,
    page: WrongNotePage,
  },
  { id: "tips", label: "꿀팁", icon: Lightbulb, page: TipsPage },
  { id: "timeline", label: "타임라인", icon: Hourglass, page: TimelinePage },
  { id: "match", label: "매칭", icon: Puzzle, page: MatchPage },
];

/** "○○님, 시험까지 D-n 🔥 n일" */
function Greeting({ profile, streak }: { profile: Profile; streak: number }) {
  const dDay = profile.examDate ? daysUntil(profile.examDate) : null;

  let examText = "시험 날짜를 정해 보세요";
  if (dDay !== null) {
    if (dDay > 0) examText = `시험까지 D-${dDay}`;
    else if (dDay === 0) examText = "오늘이 시험날! D-Day";
    else examText = "시험이 끝났어요";
  }

  return (
    <p className="truncate text-sm sm:text-[1rem]">
      <span className="font-semibold">{profile.name}님</span>, {examText}{" "}
      <span title="연속 학습일" className="whitespace-nowrap text-accent">
        🔥 {streak}일
      </span>
    </p>
  );
}

/** 배경의 은은한 블러 광원 */
function BackgroundGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-40 -left-32 size-[28rem] rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute top-1/3 -right-40 size-[26rem] rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute -bottom-48 left-1/4 size-[24rem] rounded-full bg-primary/10 blur-3xl" />
    </div>
  );
}

function App() {
  const { profile: storedProfile, logs } = useStudyData();
  // 저장이 막힌 환경(시크릿 모드 등)에서도 이번 방문 동안은 입력한 프로필로 동작하도록 보관
  const [unsavedProfile, setUnsavedProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const profile = unsavedProfile ?? storedProfile;
  const streak = calcStudyStreak(logs);
  const ActivePage = (TABS.find((tab) => tab.id === activeTab) ?? TABS[0]).page;
  const showOnboarding = profile === null || isEditingProfile;

  const handleNavigate = (tab: TabId) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  };

  const handleSaveProfile = (next: Profile) => {
    // 저장에 성공하면 "studyapp:change" 이벤트로 useStudyData가 새 프로필을 읽는다
    setUnsavedProfile(saveProfile(next) ? null : next);
    setIsEditingProfile(false);
  };

  return (
    <div className="relative isolate min-h-svh">
      <BackgroundGlow />

      {/* 데스크톱 사이드바 */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-1 border-r border-line bg-canvas/60 p-4 backdrop-blur-xl md:flex">
        <p className="mb-6 px-3 pt-2 text-lg font-bold">
          📜 <span className="text-primary">한국사</span> 꿀팁
        </p>
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleNavigate(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition ${
                isActive
                  ? "font-semibold text-ink"
                  : "text-muted hover:text-ink"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 -z-10 rounded-xl border border-primary/30 bg-primary/10"
                  transition={{ duration: 0.25 }}
                />
              )}
              <tab.icon
                size={18}
                aria-hidden
                className={isActive ? "text-primary" : undefined}
              />
              {tab.label}
            </button>
          );
        })}
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-canvas/70 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="min-w-0 flex-1">
            {profile ? (
              <Greeting profile={profile} streak={streak} />
            ) : (
              <p className="text-sm text-muted">환영해요!</p>
            )}
          </div>
          {profile && (
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              aria-label="프로필 수정"
              className="rounded-lg p-2 text-muted transition hover:text-ink"
            >
              <Settings size={18} aria-hidden />
            </button>
          )}
        </header>

        <main className="mx-auto max-w-3xl px-4 pt-6 pb-28 md:px-8 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <ActivePage onNavigate={handleNavigate} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 모바일 하단 탭 */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-line bg-canvas/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleNavigate(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] transition ${
                isActive ? "font-semibold text-primary" : "text-muted"
              }`}
            >
              <tab.icon size={20} aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {showOnboarding && (
          <Onboarding
            key="onboarding"
            initialProfile={profile}
            onSave={handleSaveProfile}
            onClose={profile ? () => setIsEditingProfile(false) : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
