import { Rocket } from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import { questions as allQuestions } from "../data/questions";
import { useStudyData } from "../lib/useStudyData";
import type { PageProps } from "../types";
import DashboardEraChart from "./DashboardPage.EraChart";
import DashboardExamCard from "./DashboardPage.ExamCard";
import DashboardHero from "./DashboardPage.Hero";
import DashboardMemory from "./DashboardPage.Memory";
import DashboardStreak from "./DashboardPage.Streak";
import DashboardTipOfDay from "./DashboardPage.TipOfDay";

/** 대시보드 (앱 첫 화면): 히어로 → 학습 기록 → 시대별 정답률 → 기억 상태 → 오늘의 꿀팁 */
function DashboardPage({ onNavigate, onEditProfile }: PageProps) {
  const { profile, stats, logs, tipVotes, examResults } = useStudyData();
  // 화면을 연 시점 기준으로 계산 (렌더링마다 값이 흔들리지 않게)
  const [now] = useState(() => Date.now());

  const solvedStats = allQuestions.flatMap((q) =>
    stats[q.id] ? [stats[q.id]] : [],
  );
  const hasRecord = solvedStats.length > 0;

  return (
    <div className="space-y-4">
      <DashboardHero
        profile={profile}
        logs={logs}
        now={now}
        onEditProfile={onEditProfile}
      />

      {hasRecord ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <DashboardStreak
              logs={logs}
              solvedStats={solvedStats}
              dailyGoal={profile?.dailyGoal ?? 20}
              now={now}
            />
            <DashboardTipOfDay tipVotes={tipVotes} now={now} />
          </div>
          <DashboardExamCard
            examResults={examResults}
            onGoExam={() => onNavigate("exam")}
          />
          <DashboardEraChart stats={stats} />
          <DashboardMemory
            stats={stats}
            now={now}
            onGoWrongNote={() => onNavigate("wrong-note")}
            onGoQuiz={() => onNavigate("quiz")}
          />
        </>
      ) : (
        <>
          <GlassCard className="py-8 text-center">
            <p className="text-4xl" aria-hidden>
              📜
            </p>
            <p className="mt-3 text-lg font-bold">첫 퀴즈를 풀어 보세요</p>
            <p className="mt-1 text-sm text-muted">
              문제를 풀면 학습 기록, 시대별 정답률, 기억 상태가 여기에 쌓여요.
            </p>
            <Button
              className="mt-5 min-h-14 px-8 text-lg"
              onClick={() => onNavigate("quiz")}
            >
              <Rocket size={20} aria-hidden />첫 퀴즈 시작하기
            </Button>
          </GlassCard>
          {examResults.length > 0 && (
            <DashboardExamCard
              examResults={examResults}
              onGoExam={() => onNavigate("exam")}
            />
          )}
          <DashboardTipOfDay tipVotes={tipVotes} now={now} />
        </>
      )}
    </div>
  );
}

export default DashboardPage;
