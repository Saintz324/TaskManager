"use client";
import { useState, useEffect, useCallback } from "react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, addMonths, subMonths, getDay, isToday, isPast, parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Clock, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date?: string;
  completed: boolean;
  project_id: string;
}

interface Project {
  id: string;
  title: string;
  color?: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
};

const STATUS_DOT: Record<string, string> = {
  completed: "bg-emerald-500",
  in_progress: "bg-blue-500",
  todo: "bg-zinc-500",
};

const DAYS_HEADER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newProject, setNewProject] = useState("");
  const [error, setError] = useState("");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const load = useCallback(async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([api.getTasks(), api.getProjects()]);
      setTasks(tasksData);
      setProjects(projectsData);
      if (projectsData.length > 0) setNewProject(projectsData[0].id);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function tasksForDay(day: Date) {
    return tasks.filter((t) => t.due_date && isSameDay(parseISO(t.due_date), day));
  }

  const selectedTasks = selectedDay ? tasksForDay(selectedDay) : [];

  const upcomingTasks = tasks
    .filter((t) => t.due_date && !t.completed)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 8);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newProject || !selectedDay) return;
    setCreating(true);
    setError("");
    try {
      const created = await api.createTask({
        title: newTitle.trim(),
        project_id: newProject,
        priority: newPriority,
        status: "todo",
        due_date: format(selectedDay, "yyyy-MM-dd"),
      });
      setTasks((prev) => [...prev, created]);
      setNewTitle("");
      setShowModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-zinc-500 text-sm mt-0.5">View tasks by due date</p>
        </div>
        {selectedDay && (
          <button
            onClick={() => { setShowModal(true); setError(""); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-900/30"
          >
            <Plus size={14} /> Add Task on {format(selectedDay, "MMM d")}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 size={28} className="text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          {/* Calendar Grid */}
          <div className="col-span-2 bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5 flex flex-col">
            {/* Month Nav */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{format(currentDate, "MMMM yyyy")}</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all text-xs font-medium"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS_HEADER.map((d) => (
                <div key={d} className="text-center text-xs text-zinc-600 font-semibold uppercase tracking-wider py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1 flex-1">
              {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
              {days.map((day) => {
                const dayTasks = tasksForDay(day);
                const todayDay = isToday(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const overdue = dayTasks.some((t) => !t.completed && isPast(day) && !isToday(day));

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                    className={`relative rounded-xl p-1 flex flex-col items-center min-h-[52px] transition-all border ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-500/40"
                        : todayDay
                        ? "bg-blue-600/10 border-blue-500/20"
                        : "border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                        todayDay
                          ? "bg-blue-600 text-white"
                          : isSelected
                          ? "text-blue-300"
                          : "text-zinc-400"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {/* Task dots */}
                    <div className="flex gap-0.5 flex-wrap justify-center">
                      {dayTasks.slice(0, 3).map((t) => (
                        <div
                          key={t.id}
                          className={`w-1.5 h-1.5 rounded-full ${overdue && !t.completed ? "bg-rose-500" : STATUS_DOT[t.status]}`}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[9px] text-zinc-600">+{dayTasks.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.05]">
              {[
                { color: "bg-blue-500", label: "In Progress" },
                { color: "bg-emerald-500", label: "Completed" },
                { color: "bg-zinc-500", label: "To Do" },
                { color: "bg-rose-500", label: "Overdue" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-zinc-600 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
            {/* Selected Day Tasks */}
            {selectedDay && (
              <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm">{format(selectedDay, "EEEE, MMM d")}</h3>
                  <button
                    onClick={() => { setShowModal(true); setError(""); }}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Plus size={12} /> Add task
                  </button>
                </div>
                {selectedTasks.length === 0 ? (
                  <p className="text-zinc-600 text-xs py-4 text-center">No tasks on this day.<br />Click &quot;Add task&quot; to create one.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_COLOR[t.priority]}`} />
                        <span className={`text-sm flex-1 ${t.completed ? "line-through text-zinc-600" : "text-zinc-200"}`}>
                          {t.title}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          t.status === "completed" ? "text-emerald-400 bg-emerald-400/10" :
                          t.status === "in_progress" ? "text-blue-400 bg-blue-400/10" :
                          "text-zinc-500 bg-zinc-500/10"
                        }`}>
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Tasks */}
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-4 flex-1">
              <h3 className="text-white font-semibold text-sm mb-3">Upcoming Deadlines</h3>
              {upcomingTasks.length === 0 ? (
                <p className="text-zinc-600 text-xs py-4 text-center">No upcoming tasks with due dates.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.map((t) => {
                    const due = parseISO(t.due_date!);
                    const overdue = isPast(due) && !isToday(due);
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedDay(due)}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_COLOR[t.priority]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-200 text-xs font-medium truncate">{t.title}</p>
                          <div className={`flex items-center gap-1 mt-0.5 text-[10px] ${overdue ? "text-rose-400" : "text-zinc-500"}`}>
                            <Clock size={9} />
                            {overdue ? "Overdue · " : ""}{format(due, "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold">Add Task</h2>
                <p className="text-zinc-500 text-xs mt-0.5">{format(selectedDay, "EEEE, MMMM d, yyyy")}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />{error}
              </div>
            )}

            {projects.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">
                You need to create a project first before adding tasks.
              </p>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1.5">Task Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium block mb-1.5">Project</label>
                    <select
                      value={newProject}
                      onChange={(e) => setNewProject(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white focus:outline-none focus:border-blue-600 text-sm"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium block mb-1.5">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as "low" | "medium" | "high")}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white focus:outline-none focus:border-blue-600 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newTitle.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creating ? <Loader2 size={14} className="animate-spin" /> : null}
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
