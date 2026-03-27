"use client";
import { useState } from "react";

const DAYS_HEADER = ["M","T","W","T","F","S","S"];
const CALENDAR_DAYS = [
  [null, null, null, null, 1, 2],
  [3, 4, 5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14, 15, 16],
  [17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, 29, 30],
];
const HIGHLIGHTED = [5, 6, 12, 13, 14, 18, 19, 20, 21, 22, 26, 27];
const MEMBERS = ["Yours", "Lukas", "Janny", "Andrey", "Tiffany"];

export default function HistoryCalendar() {
  const [selected, setSelected] = useState("Yours");

  return (
    <div className="bg-[#D3D5FD] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-black/10 rounded flex items-center justify-center">
            <span className="text-xs">⚡</span>
          </div>
          <div>
            <p className="font-bold text-[#0B0B0D] text-sm">History</p>
            <p className="text-xs text-[#0B0B0D]/60">Working Days</p>
          </div>
        </div>
        <button className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center text-xs hover:bg-black/20 transition-colors">↗</button>
      </div>

      {/* Member tabs */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {MEMBERS.map(m => (
          <button key={m} onClick={() => setSelected(m)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${selected === m ? "bg-[#0B0B0D] text-white" : "bg-black/10 text-[#0B0B0D] hover:bg-black/20"}`}>
            {m}
          </button>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS_HEADER.map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-[#0B0B0D]/50 py-1">{d}</div>
        ))}
      </div>
      {CALENDAR_DAYS.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-0.5 mb-0.5">
          {(week.length < 7 ? [...week, ...Array(7 - week.length).fill(null)] : week).map((day, di) => (
            <div key={di} className={`aspect-square rounded-full flex items-center justify-center text-xs font-medium transition-all ${!day ? "" : HIGHLIGHTED.includes(day as number) ? "bg-[#0B0B0D] text-[#D3D5FD] font-bold" : "text-[#0B0B0D] hover:bg-black/10 cursor-pointer"}`}>
              {day}
            </div>
          ))}
        </div>
      ))}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-2">
        <button className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-xs hover:bg-black/20 transition-colors">‹</button>
        <span className="text-xs font-semibold text-[#0B0B0D]">April 2023</span>
        <button className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-xs hover:bg-black/20 transition-colors">›</button>
      </div>
    </div>
  );
}
