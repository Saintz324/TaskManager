"use client";

const TASKS_SCHEDULE = [
  { name: "UX Research", hours: "8 hours", progress: 60, color: "#D3D5FD", person: "A", day: 5 },
  { name: "UI Kit", hours: "4 hours", progress: 45, color: "#929AAB", person: "B", day: 8 },
  { name: "Moodboard", hours: "4 hours", progress: 75, color: "#474A56", person: "C", day: 10 },
];

const WEEKS = ["T3", "T4", "W5", "T6", "F7", "S8", "S9", "M10", "T11", "W12", "T13", "F15"];

export default function ScheduleCard() {
  return (
    <div className="bg-[#474A56] rounded-2xl p-5 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
              <span className="text-xs">▦</span>
            </div>
            <h3 className="font-semibold text-sm">Schedule</h3>
            <span className="text-[#929AAB] text-xs">◄ April 2023 ►</span>
          </div>
          <p className="text-xs text-[#929AAB]">15 Upcoming Tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {["A","B","C"].map((l,i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-[#D3D5FD] border border-[#474A56] flex items-center justify-center text-xs font-bold text-[#0B0B0D]">{l}</div>
            ))}
            <div className="w-6 h-6 rounded-full bg-white/10 border border-[#474A56] flex items-center justify-center text-xs">+9</div>
          </div>
          <button className="px-3 py-1 rounded-lg bg-white/10 text-xs hover:bg-white/20 transition-colors">Add +</button>
        </div>
      </div>

      {/* Timeline header */}
      <div className="grid grid-cols-12 gap-1 mb-3 ml-28">
        {WEEKS.map(w => (
          <div key={w} className={`text-center text-xs ${w === "W5" ? "text-[#D3D5FD] font-bold" : "text-[#929AAB]"}`}>{w}</div>
        ))}
      </div>

      {/* Process row */}
      <div className="mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-24">
            <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center text-xs">▦</div>
            <span className="text-xs font-medium">Process</span>
          </div>
          <div className="flex-1 relative h-8">
            <div className="absolute left-[20%] right-[30%] h-full rounded-lg bg-white/5 border border-white/10 flex items-center px-3">
              <div className="w-6 h-6 rounded-full bg-[#D3D5FD] border-2 border-white mr-2 flex items-center justify-center text-[#0B0B0D] text-xs">P</div>
              <span className="text-xs text-[#D3D5FD]">Prototype</span>
              <div className="ml-2 w-5 h-5 rounded-full bg-[#D3D5FD] flex items-center justify-center">
                <span className="text-xs text-[#0B0B0D]">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task rows */}
      {TASKS_SCHEDULE.map((task, i) => (
        <div key={i} className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 w-24">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: task.color, color: task.color === "#D3D5FD" || task.color === "#929AAB" ? "#0B0B0D" : "white" }}>{task.person}</div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="text-xs text-[#929AAB] w-24">{task.name}</div>
            <div className="flex-1 bg-white/5 rounded-lg h-7 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-lg opacity-30" style={{ width: `${task.progress}%`, backgroundColor: task.color }} />
              <div className="absolute inset-0 flex items-center px-3 justify-between">
                <span className="text-xs text-gray-300">{task.hours}</span>
                <span className="text-xs text-[#929AAB]">{task.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
