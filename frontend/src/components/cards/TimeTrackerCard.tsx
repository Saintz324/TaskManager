"use client";
import { useState, useEffect, useRef } from "react";

export default function TimeTrackerCard() {
  const [seconds, setSeconds] = useState(27615); // 07:40:15
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <div className="bg-[#474A56] rounded-2xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏰</span>
          <h3 className="font-semibold text-sm">Time Tracker</h3>
        </div>
        <div className="w-6 h-6 rounded-full bg-[#D3D5FD] flex items-center justify-center text-[#0B0B0D] text-xs font-bold">2</div>
      </div>
      <div className="text-4xl font-black tracking-wider mb-6 text-center">{h}:{m}:{s}</div>
      <div className="flex justify-center gap-3">
        <button onClick={() => setRunning(!running)} className="w-10 h-10 rounded-full bg-[#D3D5FD] flex items-center justify-center hover:bg-[#b8baed] transition-colors">
          <span className="text-[#0B0B0D] font-bold text-sm">{running ? "⏸" : "▶"}</span>
        </button>
        <button onClick={() => { setRunning(false); setSeconds(0); }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <span className="text-sm">⏹</span>
        </button>
      </div>
    </div>
  );
}
