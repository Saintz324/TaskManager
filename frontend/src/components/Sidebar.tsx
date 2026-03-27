"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderOpen, Users, Calendar,
  Settings, BarChart2, Clock, CheckSquare, LogOut,
  ChevronRight
} from "lucide-react";
import { logout, getUser } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/dashboard/projects", icon: FolderOpen, label: "Projects" },
  { href: "/dashboard/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/dashboard/team", icon: Users, label: "Team" },
  { href: "/dashboard/calendar", icon: Calendar, label: "Calendar" },
  { href: "/dashboard/schedules", icon: Clock, label: "Schedules" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = getUser();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <aside className="w-[240px] min-w-[240px] bg-[#050505] border-r border-white/[0.05] h-full flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/[0.05]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40">
          <CheckSquare size={14} className="text-white" />
        </div>
        <span className="text-white font-bold text-base tracking-tight">TaskLab</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Main</p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                  active
                    ? "bg-blue-600/15 text-white"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-full" />
                )}
                <Icon
                  size={16}
                  className={active ? "text-blue-400" : "group-hover:text-zinc-300 transition-colors"}
                />
                <span className="text-sm font-medium flex-1">{label}</span>
                {active && <ChevronRight size={12} className="text-blue-400/50" />}
              </Link>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">General</p>
          <Link
            href="/dashboard/settings"
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              pathname === "/dashboard/settings"
                ? "bg-blue-600/15 text-white"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
          >
            <Settings size={16} className="group-hover:text-zinc-300 transition-colors" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/[0.05] p-3">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.04] transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg shadow-blue-900/30">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name ?? "User"}</p>
            <p className="text-zinc-500 text-[10px] truncate">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={logout}
            className="text-zinc-600 hover:text-rose-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
