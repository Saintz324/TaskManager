"use client";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  project: string;
  completed: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-900/40 text-red-300",
  medium: "bg-yellow-900/40 text-yellow-300",
  low: "bg-green-900/40 text-green-300",
};

export default function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  return (
    <div className="p-3 bg-[#3A3C47] rounded-xl hover:bg-[#474A56] transition-colors">
      <div className="flex items-start gap-3">
        <button onClick={() => onToggle(task.id)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${task.completed ? "bg-[#D3D5FD] border-[#D3D5FD]" : "border-[#929AAB]"}`}>
          {task.completed && <span className="text-xs text-[#0B0B0D]">✓</span>}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.completed ? "line-through text-[#929AAB]" : "text-white"}`}>{task.title}</p>
          <p className="text-xs text-[#929AAB] mt-0.5">{task.project}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
            <span className="text-xs text-[#929AAB]">{task.due_date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
