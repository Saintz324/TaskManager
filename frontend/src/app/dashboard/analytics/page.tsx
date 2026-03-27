"use client";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { Loader2, TrendingUp, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

interface Stats {
  projects: number;
  tasks: { total: number; todo: number; in_progress: number; completed: number };
  priority: { high: number; medium: number; low: number };
  overdue: number;
  completionRate: number;
  monthly: { month: string; created: number; completed: number }[];
}

const PIE_COLORS = ["#52525b", "#2563eb", "#10b981"];
const PRIORITY_COLORS = ["#f43f5e", "#f59e0b", "#10b981"];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pieData = stats
    ? [
        { name: "To Do", value: stats.tasks.todo },
        { name: "In Progress", value: stats.tasks.in_progress },
        { name: "Completed", value: stats.tasks.completed },
      ].filter((d) => d.value > 0)
    : [];

  const priorityData = stats
    ? [
        { name: "High", value: stats.priority.high },
        { name: "Medium", value: stats.priority.medium },
        { name: "Low", value: stats.priority.low },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Track your team&apos;s performance and productivity</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={28} className="text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Tasks", value: stats?.tasks.total ?? 0, icon: CheckCircle2, color: "text-blue-400 bg-blue-400/10" },
              { label: "Completed", value: stats?.tasks.completed ?? 0, icon: CheckCircle2, color: "text-emerald-400 bg-emerald-400/10" },
              { label: "In Progress", value: stats?.tasks.in_progress ?? 0, icon: Clock, color: "text-blue-400 bg-blue-400/10" },
              { label: "Overdue", value: stats?.overdue ?? 0, icon: AlertTriangle, color: "text-rose-400 bg-rose-400/10" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-0.5">{label}</p>
                  <p className="text-white text-2xl font-bold">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Monthly Activity */}
            <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-1">Monthly Activity</h2>
              <p className="text-zinc-500 text-xs mb-5">Tasks created vs completed per month</p>
              <div className="h-52">
                {(stats?.monthly?.length ?? 0) > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats!.monthly} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={4} barCategoryGap="40%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: "#52525b", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        domain={[0, (max: number) => Math.max(max + 1, 5)]}
                      />
                      <Tooltip
                        contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff" }}
                        labelStyle={{ color: "#a1a1aa" }}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      />
                      <Bar dataKey="created" fill="#2563eb" radius={[4, 4, 0, 0]} name="Created" maxBarSize={40} />
                      <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-zinc-600 text-sm">No monthly data yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-1">Status Distribution</h2>
              <p className="text-zinc-500 text-xs mb-4">Tasks by current status</p>
              <div className="h-52">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff" }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", color: "#71717a" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-zinc-600 text-sm">No tasks yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Priority + Completion Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-1">Priority Breakdown</h2>
              <p className="text-zinc-500 text-xs mb-5">Distribution of task priorities</p>
              <div className="h-44">
                {priorityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData} layout="vertical" margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: "#52525b", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        domain={[0, (max: number) => Math.max(max + 1, 5)]}
                      />
                      <YAxis type="category" dataKey="name" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
                      <Tooltip
                        contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff" }}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Tasks" maxBarSize={28}>
                        {priorityData.map((_, i) => (
                          <Cell key={i} fill={PRIORITY_COLORS[i % PRIORITY_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-zinc-600 text-sm">No priority data yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5 flex flex-col">
              <h2 className="text-white font-semibold mb-1">Completion Rate</h2>
              <p className="text-zinc-500 text-xs mb-5">Overall task completion</p>
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#27272a" strokeWidth="12" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke="#2563eb" strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - (stats?.completionRate ?? 0) / 100)}`}
                      style={{ transition: "stroke-dashoffset 1s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-white text-2xl font-bold">{stats?.completionRate ?? 0}%</span>
                    <span className="text-zinc-500 text-xs">Done</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-blue-400" />
                  <span className="text-zinc-400 text-sm">
                    {stats?.tasks.completed ?? 0} of {stats?.tasks.total ?? 0} tasks completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
