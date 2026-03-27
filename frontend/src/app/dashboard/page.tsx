"use client";
import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  CheckSquare, FolderOpen, AlertTriangle, TrendingUp,
  TrendingDown, Plus, RefreshCw, BarChart2, Clock, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface Stats {
  projects: number;
  tasks: { total: number; todo: number; in_progress: number; completed: number };
  priority: { high: number; medium: number; low: number };
  overdue: number;
  completionRate: number;
  monthly: { month: string; created: number; completed: number }[];
}

const FILTERS = ["Today", "Last 7 days", "Last 30 days", "Last 12 months"] as const;

type StatCardProps = {
  label: string;
  value: string | number;
  sub: string;
  positive?: boolean;
  icon: React.ReactNode;
  accent: string;
};

function StatCard({ label, value, sub, positive, icon, accent }: StatCardProps) {
  return (
    <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-zinc-400 text-sm font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>{icon}</div>
      </div>
      <div>
        <div className="text-white text-3xl font-bold tracking-tight">{value}</div>
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${positive ? "text-emerald-400" : "text-rose-400"}`}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {sub}
        </div>
      </div>
    </div>
  );
}

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<string>("Last 30 days");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = getUser();

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const taskRows = stats
    ? [
        {
          label: "To Do",
          count: stats.tasks.todo,
          pct: stats.tasks.total ? Math.round((stats.tasks.todo / stats.tasks.total) * 100) : 0,
          color: "bg-zinc-500",
        },
        {
          label: "In Progress",
          count: stats.tasks.in_progress,
          pct: stats.tasks.total ? Math.round((stats.tasks.in_progress / stats.tasks.total) * 100) : 0,
          color: "bg-blue-500",
        },
        {
          label: "Completed",
          count: stats.tasks.completed,
          pct: stats.tasks.total ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0,
          color: "bg-emerald-500",
        },
      ]
    : [];

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Welcome back, <span className="text-zinc-300">{user?.name ?? "there"}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadStats(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20 text-sm transition-all"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/dashboard/projects"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-900/30"
          >
            <Plus size={14} /> <span className="hidden sm:inline">New Project</span>
          </Link>
        </div>
      </div>

      {/* Time Filters */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeFilter === f
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Tasks"
              value={stats?.tasks.total ?? 0}
              sub={`${stats?.tasks.in_progress ?? 0} in progress`}
              positive
              icon={<CheckSquare size={16} className="text-blue-400" />}
              accent="bg-blue-500/10"
            />
            <StatCard
              label="Completion Rate"
              value={`${stats?.completionRate ?? 0}%`}
              sub={`${stats?.tasks.completed ?? 0} completed`}
              positive={(stats?.completionRate ?? 0) >= 50}
              icon={<TrendingUp size={16} className="text-emerald-400" />}
              accent="bg-emerald-500/10"
            />
            <StatCard
              label="Active Projects"
              value={stats?.projects ?? 0}
              sub="All projects"
              positive
              icon={<FolderOpen size={16} className="text-blue-400" />}
              accent="bg-blue-500/10"
            />
            <StatCard
              label="Overdue Tasks"
              value={stats?.overdue ?? 0}
              sub="Past due date"
              positive={false}
              icon={<AlertTriangle size={16} className="text-rose-400" />}
              accent="bg-rose-500/10"
            />
          </div>

          {/* Middle Row: Tasks Details + Activity Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Tasks Details Table */}
            <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-white font-semibold">Tasks Overview</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Breakdown by status</p>
                </div>
                <Link
                  href="/dashboard/tasks"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-4 text-xs text-zinc-500 font-medium mb-3 px-1">
                <span>Status</span>
                <span className="text-center">Count</span>
                <span className="text-center">Share</span>
                <span>Progress</span>
              </div>

              <div className="space-y-3">
                {taskRows.map(({ label, count, pct, color }) => (
                  <div key={label} className="grid grid-cols-4 items-center py-3 px-1 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="text-white text-sm">{label}</span>
                    </div>
                    <span className="text-center text-zinc-300 text-sm font-semibold">{count}</span>
                    <span className="text-center text-zinc-400 text-sm">{pct}%</span>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Priority breakdown */}
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <p className="text-zinc-500 text-xs font-medium mb-3">Priority Breakdown</p>
                <div className="flex items-center gap-4">
                  {stats && Object.entries(stats.priority).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${PRIORITY_COLOR[k]}`} />
                      <span className="text-zinc-400 text-xs capitalize">{k}</span>
                      <span className="text-white text-xs font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-1">Activity</h2>
              <p className="text-zinc-500 text-xs mb-5">Summary of all tasks</p>

              <div className="space-y-1">
                {[
                  { label: "Total Tasks", value: stats?.tasks.total ?? 0, color: "text-white" },
                  { label: "To Do", value: stats?.tasks.todo ?? 0, color: "text-zinc-400" },
                  { label: "In Progress", value: stats?.tasks.in_progress ?? 0, color: "text-blue-400" },
                  { label: "Completed", value: stats?.tasks.completed ?? 0, color: "text-emerald-400" },
                  { label: "Overdue", value: stats?.overdue ?? 0, color: "text-rose-400" },
                  { label: "Projects", value: stats?.projects ?? 0, color: "text-blue-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-zinc-400 text-sm">{label}</span>
                    <span className={`font-semibold text-sm ${color}`}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-3 text-center">
                  <div className="text-blue-400 text-2xl font-bold">{stats?.completionRate ?? 0}%</div>
                  <div className="text-zinc-500 text-xs mt-0.5">Completion Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Overview + Chart */}
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-semibold">Overview</h2>
                <p className="text-zinc-500 text-xs mt-0.5">Monthly task activity</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-zinc-400">Created</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-zinc-400">Completed</span>
                </div>
              </div>
            </div>

            {/* Big numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "To Do", value: stats?.tasks.todo ?? 0, icon: Clock },
                { label: "In Progress", value: stats?.tasks.in_progress ?? 0, icon: BarChart2 },
                { label: "Completed", value: stats?.tasks.completed ?? 0, icon: CheckSquare },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <Icon size={18} className="text-zinc-500 mx-auto mb-2" />
                  <div className="text-white text-2xl font-bold">{value.toLocaleString()}</div>
                  <div className="text-zinc-500 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="h-48">
              {(stats?.monthly?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats!.monthly} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                    <defs>
                      <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff" }}
                      labelStyle={{ color: "#a1a1aa" }}
                    />
                    <Area type="monotone" dataKey="created" stroke="#2563eb" strokeWidth={2} fill="url(#created)" />
                    <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fill="url(#completed)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <BarChart2 size={32} className="text-zinc-700" />
                  <p className="text-zinc-600 text-sm">No activity data yet</p>
                  <Link href="/dashboard/tasks" className="text-blue-400 text-xs hover:text-blue-300 transition-colors">
                    Create your first task →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
