import { ListTodo } from "lucide-react";
import Badge from "../components/ui/Badge";
import GlassCard from "../components/ui/GlassCard";

// 담당: C — 뼈대 단계의 자리 표시용 화면. 아래 TODO를 구현하면서 자유롭게 바꾼다.
const TODOS = [
  "전체 꿀팁 목록 (data/tips, TipCard)",
  "👍 외워졌어요 (voteTip, getTipVotes)",
  "외워졌어요 수로 정렬",
  "시대별 필터",
];

function TipsPage() {
  return (
    <GlassCard>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">꿀팁 모음</h2>
        <Badge tone="primary">담당: C</Badge>
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

export default TipsPage;
