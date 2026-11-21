import { ListTodo } from "lucide-react";
import Badge from "../components/ui/Badge";
import GlassCard from "../components/ui/GlassCard";

// 뼈대 단계의 자리 표시용 화면. 아래 TODO를 구현하면서 자유롭게 바꾼다.
const TODOS = [
  "인물·업적 카드 섞어서 배치 (data/persons.ts)",
  "카드 뒤집기, 짝이 맞으면 고정",
  "완료 시 시도 횟수와 걸린 시간 표시",
];

function MatchPage() {
  return (
    <GlassCard>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">인물 ↔ 사건 짝 맞추기</h2>
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

export default MatchPage;
