"use client";

interface Project {
  id: string;
  title: string;
  description: string;
  taskCount: number;
  completedCount: number;
  color: string;
}

export default function ProjectCard({ project }: { project: Project }) {
  const pct = Math.round((project.completedCount / project.taskCount) * 100);
  const isLight = project.color === "#D3D5FD";

  return (
    <div className="rounded-2xl p-5 min-h-[200px] flex flex-col" style={{ backgroundColor: project.color }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">📁</div>
        <button className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs hover:bg-white/30 transition-colors" style={{ color: isLight ? "#0B0B0D" : "white" }}>↗</button>
      </div>
      <h3 className="font-bold text-sm mb-1" style={{ color: isLight ? "#0B0B0D" : "white" }}>{project.title}</h3>
      <p className="text-xs opacity-60 mb-4 flex-1" style={{ color: isLight ? "#0B0B0D" : "white" }}>{project.description}</p>
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: isLight ? "#0B0B0D" : "rgba(255,255,255,0.7)" }}>
          <span>{project.completedCount}/{project.taskCount} tasks</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/20">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: isLight ? "#0B0B0D" : "white" }} />
        </div>
      </div>
    </div>
  );
}
