import { ListTodo } from "lucide-react";
import Badge from "../components/ui/Badge";
import GlassCard from "../components/ui/GlassCard";

// 담당: A — 뼈대 단계의 자리 표시용 화면. 아래 TODO를 구현하면서 자유롭게 바꾼다.
const TODOS = [
  "시대 선택 (lib/labels의 ERAS, ERA_LABELS)",
  "문제 뽑기·채점 로직 (lib/quiz.ts)",
  "4지선다 풀이, 정답·오답 표시 (정답은 가벼운 축하, 오답은 흔들림)",
  "해설 표시",
  "오답이거나 해설을 열면 TipCard 표시 (data/tips의 getTipById)",
  "문제를 풀 때마다 recordAnswer 호출",
];

function QuizPage() {
  return (
    <GlassCard>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">시대별 퀴즈</h2>
        <Badge tone="primary">담당: A</Badge>
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

export default QuizPage;
