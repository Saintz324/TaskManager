"use client";

export default function TasksCard() {
  return (
    <div className="bg-[#474A56] rounded-2xl p-5 h-full">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-white">Tasks</h3>
        <button className="w-7 h-7 rounded-lg bg-[#3A3C47] flex items-center justify-center hover:bg-[#D3D5FD] hover:text-[#0B0B0D] transition-colors text-xs text-white">↗</button>
      </div>
      <div className="text-3xl font-black text-white mb-1">34,5 h</div>
      <div className="flex gap-3 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#D3D5FD]" />
          <span className="text-xs text-[#929AAB]">In Work</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#929AAB]" />
          <span className="text-xs text-[#929AAB]">Completed</span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-2 bg-[#3A3C47] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#D3D5FD] to-[#929AAB] rounded-full" style={{ width: "68%" }} />
      </div>
      <p className="text-xs text-[#929AAB] mt-2">68% tasks completed this week</p>
    </div>
  );
}
