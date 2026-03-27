"use client";

const AVATARS = [
  { name: "Anna", color: "#D3D5FD", textColor: "#0B0B0D" },
  { name: "Ben", color: "#474A56", textColor: "white" },
  { name: "Clara", color: "#929AAB", textColor: "#0B0B0D" },
  { name: "David", color: "#3A3C47", textColor: "white" },
];

export default function CoreTeamCard() {
  return (
    <div className="bg-[#D3D5FD] rounded-2xl p-5 h-full">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
            <span className="text-xs">👥</span>
          </div>
          <div>
            <p className="font-bold text-[#0B0B0D] text-sm">Core Team</p>
            <p className="text-xs text-[#0B0B0D]/60">Product Members</p>
          </div>
        </div>
      </div>
      <p className="text-2xl font-black text-[#0B0B0D] my-3">32 Members</p>
      <div className="flex items-center">
        {AVATARS.map((a, i) => (
          <div key={i} className="w-8 h-8 rounded-full border-2 border-[#D3D5FD] flex items-center justify-center text-xs font-bold -ml-2 first:ml-0" style={{ backgroundColor: a.color, color: a.textColor }}>
            {a.name[0]}
          </div>
        ))}
        <div className="w-8 h-8 rounded-full bg-white/50 border-2 border-[#D3D5FD] flex items-center justify-center text-xs font-bold text-[#0B0B0D] -ml-2">+29</div>
      </div>
    </div>
  );
}
