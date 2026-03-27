"use client";

const BAR_DATA = [
  { month: "Jan", h1: 60, h2: 40 },
  { month: "Feb", h1: 80, h2: 55 },
  { month: "Mar", h1: 50, h2: 70 },
  { month: "Apr", h1: 90, h2: 60 },
  { month: "May", h1: 70, h2: 45 },
  { month: "Jun", h1: 85, h2: 80 },
  { month: "Jul", h1: 65, h2: 50 },
];

export default function TeamInsightsCard() {
  return (
    <div className="bg-[#474A56] rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#D3D5FD] rounded flex items-center justify-center">
            <span className="text-xs">⚡</span>
          </div>
          <h3 className="font-semibold text-sm text-white">Team Insights</h3>
        </div>
        <button className="text-xs text-[#D3D5FD] hover:underline">View all ›</button>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 flex-1 mb-4">
        {BAR_DATA.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex gap-0.5 items-end" style={{ height: "100px" }}>
              <div className="flex-1 rounded-t-sm bg-[#474A56] border border-white/10" style={{ height: `${d.h1}%` }} />
              <div className="flex-1 rounded-t-sm bg-[#3A3C47]" style={{ height: `${d.h2}%` }} />
            </div>
            <span className="text-xs text-[#929AAB]">{d.month}</span>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-[#3A3C47] rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-white">↓</span>
            <div>
              <p className="text-xs font-medium text-white">Productivity this week</p>
            </div>
          </div>
          <span className="text-sm font-bold text-red-400">-7%</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-[#3A3C47] rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-white">↑</span>
            <div>
              <p className="text-xs font-medium text-white">Productivity this month</p>
            </div>
          </div>
          <span className="text-sm font-bold text-green-400">+13%</span>
        </div>
      </div>

      {/* Team members */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
        {["A","B"].map((l, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-[#D3D5FD] flex items-center justify-center text-[#0B0B0D] text-xs font-bold">{l}</div>
        ))}
        <button className="w-8 h-8 rounded-full bg-[#3A3C47] flex items-center justify-center text-white text-lg leading-none">▶</button>
      </div>
    </div>
  );
}
