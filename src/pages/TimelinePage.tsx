import { ListTodo } from "lucide-react";
import Badge from "../components/ui/Badge";
import GlassCard from "../components/ui/GlassCard";

// 뼈대 단계의 자리 표시용 화면. 아래 TODO를 구현하면서 자유롭게 바꾼다.
const TODOS = [
  "사건 카드 4~5장 무작위로 뽑기 (data/timeline.ts)",
  "드래그로 연도 순 정렬 (motion의 Reorder)",
  "채점 후 정답 순서와 연도 공개",
];

function TimelinePage() {
  return (
    <GlassCard>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">타임라인 순서 맞추기</h2>
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

export default TimelinePage;
