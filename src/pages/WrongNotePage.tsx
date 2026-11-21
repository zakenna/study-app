import { ListTodo } from "lucide-react";
import Badge from "../components/ui/Badge";
import GlassCard from "../components/ui/GlassCard";

// 뼈대 단계의 자리 표시용 화면. 아래 TODO를 구현하면서 자유롭게 바꾼다.
const TODOS = [
  "오답노트 목록 (getWrongNoteIds: 틀린 적 있고 연속 정답 2회 미만)",
  "다시 풀기 (2번 연속 맞히면 목록에서 빠짐)",
  "기억 확률 표시 (lib/memory의 retention)",
  "약한 문제 우선 복습 (getWeakQuestions)",
];

function WrongNotePage() {
  return (
    <GlassCard>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">오답노트</h2>
        <Badge tone="primary">준비 중</Badge>
      </div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted">
        <ListTodo size={16} aria-hidden />
        TODO
      </p>
      <ul className="space-y-2 text-sm text-muted">
        {TODOS.map((todo) => (
          <li key={todo} className="flex gap-2">
            <span aria-hidden>☐</span>
            <span>{todo}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

export default WrongNotePage;
