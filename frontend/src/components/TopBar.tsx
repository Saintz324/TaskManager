"use client";
import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("en-US", { day: "numeric", month: "short", weekday: "short" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-sm text-[#929AAB] mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-[#474A56] rounded-xl px-4 py-2 flex items-center gap-2">
          <Search size={14} className="text-[#929AAB]" />
          <input placeholder="Search..." className="text-sm outline-none text-white bg-transparent placeholder:text-[#929AAB] w-32" />
        </div>
        <div className="bg-[#474A56] rounded-xl px-4 py-2 text-center">
          <p className="text-sm font-semibold text-white">{time}</p>
          <p className="text-xs text-[#929AAB]">{date}</p>
        </div>
        <div className="bg-[#474A56] rounded-xl p-2 relative cursor-pointer hover:bg-[#3A3C47] transition-colors">
          <Bell size={18} className="text-white" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D3D5FD]" />
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#D3D5FD] flex items-center justify-center text-[#0B0B0D] font-bold text-sm cursor-pointer hover:bg-[#b8baed] transition-colors">
          JD
        </div>
      </div>
    </div>
  );
}
