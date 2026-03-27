"use client";

const STATUSES = [
  { label: "In Test", color: "bg-[#3A3C47] text-white" },
  { label: "Reviewed", color: "bg-[#474A56] text-white" },
  { label: "Complete", color: "bg-[#D3D5FD] text-[#0B0B0D]" },
];

export default function ProcessCard() {
  return (
    <div className="bg-[#474A56] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#3A3C47] rounded flex items-center justify-center">
            <span className="text-xs text-white">▦</span>
          </div>
          <h3 className="font-semibold text-sm text-white">Process</h3>
        </div>
        <button className="w-7 h-7 rounded-lg bg-[#3A3C47] flex items-center justify-center text-xs text-white hover:bg-[#D3D5FD] hover:text-[#0B0B0D] transition-colors">↗</button>
      </div>
      <div className="space-y-2">
        {STATUSES.map((s, i) => (
          <div key={i} className={`px-4 py-2.5 rounded-xl text-sm font-medium ${s.color}`}>{s.label}</div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-xs text-[#929AAB]">Done</span>
        <div className="w-2 h-2 rounded-full bg-blue-400 ml-3" />
        <span className="text-xs text-[#929AAB]">In Progress</span>
      </div>
    </div>
  );
}
