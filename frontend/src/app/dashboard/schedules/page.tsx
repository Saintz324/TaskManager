"use client";
import { useState, useEffect, useCallback } from "react";
import {
  format, startOfWeek, endOfWeek, eachDayOfInterval,
  addWeeks, subWeeks, isToday, parseISO, isSameDay
} from "date-fns";
import {
  ChevronLeft, ChevronRight, Plus, X, Loader2, AlertCircle,
  CheckCircle2, Clock, Circle
} from "lucide-react";
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

const PRIORITY_STYLES: Record<string, string> = {
  high: "border-l-rose-500 bg-rose-500/5",
  medium: "border-l-amber-500 bg-amber-500/5",
  low: "border-l-blue-500 bg-blue-500/5",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={13} className="text-emerald-400" />,
  in_progress: <Clock size={13} className="text-blue-400" />,
  todo: <Circle size={13} className="text-zinc-500" />,
};

export default function SchedulesPage() {
  const [weekDate, setWeekDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newProject, setNewProject] = useState("");
  const [error, setError] = useState("");

  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

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

  // Tasks with no due_date or due_date outside the week
  const unscheduled = tasks.filter((t) => !t.due_date && !t.completed);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newProject) return;
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

  async function handleToggle(task: Task) {
    const newStatus = task.completed ? "todo" : "completed";
    try {
      const updated = await api.updateTask(task.id, {
        ...task,
        status: newStatus,
        completed: !task.completed,
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch {
      // silently fail
    }
  }

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const hasAnyTasksThisWeek = weekDays.some((d) => tasksForDay(d).length > 0);

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Schedules</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-1">
            <button
              onClick={() => setWeekDate(subWeeks(weekDate, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setWeekDate(new Date())}
              className="px-3 py-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all text-xs font-medium"
            >
              This Week
            </button>
            <button
              onClick={() => setWeekDate(addWeeks(weekDate, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            onClick={() => { setSelectedDay(new Date()); setShowModal(true); setError(""); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-900/30"
          >
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 size={28} className="text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Week Grid */}
          <div className="grid grid-cols-7 gap-3 flex-1 min-h-0">
            {weekDays.map((day) => {
              const dayTasks = tasksForDay(day);
              const todayDay = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`flex flex-col rounded-2xl border overflow-hidden ${
                    todayDay
                      ? "border-blue-500/30 bg-blue-600/5"
                      : "border-white/[0.06] bg-[#0d0d0d]"
                  }`}
                >
                  {/* Day Header */}
                  <div className={`px-3 py-2.5 border-b ${todayDay ? "border-blue-500/20" : "border-white/[0.05]"}`}>
                    <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
                      {format(day, "EEE")}
                    </p>
                    <p className={`font-bold text-lg leading-tight ${todayDay ? "text-blue-400" : "text-zinc-300"}`}>
                      {format(day, "d")}
                    </p>
                  </div>

                  {/* Tasks in this day */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                    {dayTasks.length === 0 ? (
                      <div className="h-full flex items-start justify-center pt-4">
                        <p className="text-zinc-800 text-[10px] text-center">No tasks</p>
                      </div>
                    ) : (
                      dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`rounded-lg border-l-2 px-2 py-1.5 cursor-pointer hover:opacity-80 transition-opacity ${PRIORITY_STYLES[task.priority]}`}
                          onClick={() => handleToggle(task)}
                        >
                          <div className="flex items-start gap-1.5">
                            <div className="mt-0.5 flex-shrink-0">{STATUS_ICON[task.status]}</div>
                            <p className={`text-[11px] font-medium leading-snug ${task.completed ? "line-through text-zinc-600" : "text-zinc-200"}`}>
                              {task.title}
                            </p>
                          </div>
                          {projectMap[task.project_id] && (
                            <p className="text-[9px] text-zinc-600 mt-0.5 ml-4 truncate">
                              {projectMap[task.project_id].title}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add to this day */}
                  <button
                    onClick={() => { setSelectedDay(day); setShowModal(true); setError(""); }}
                    className="flex items-center justify-center gap-1 p-2 text-zinc-700 hover:text-blue-400 hover:bg-blue-600/5 transition-all text-[10px] border-t border-white/[0.03]"
                  >
                    <Plus size={10} /> Add
                  </button>
                </div>
              );
            })}
          </div>

          {/* Unscheduled Tasks */}
          {unscheduled.length > 0 && (
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-4">
              <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Unscheduled ({unscheduled.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {unscheduled.slice(0, 12).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-colors"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      task.priority === "high" ? "bg-rose-500" :
                      task.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
                    }`} />
                    <span className="text-zinc-300 text-xs">{task.title}</span>
                  </div>
                ))}
                {unscheduled.length > 12 && (
                  <div className="flex items-center px-2.5 py-1.5 text-zinc-600 text-xs">
                    +{unscheduled.length - 12} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!hasAnyTasksThisWeek && unscheduled.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center">
                <Clock size={20} className="text-zinc-700" />
              </div>
              <p className="text-zinc-500 text-sm">No tasks scheduled this week.</p>
              <button
                onClick={() => { setSelectedDay(new Date()); setShowModal(true); setError(""); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-medium transition-all hover:bg-blue-600/30"
              >
                <Plus size={14} /> Schedule a task
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold">Schedule Task</h2>
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
              <p className="text-zinc-500 text-sm text-center py-4">Create a project first before scheduling tasks.</p>
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
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={format(selectedDay, "yyyy-MM-dd")}
                    onChange={(e) => setSelectedDay(new Date(e.target.value + "T12:00:00"))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white focus:outline-none focus:border-blue-600 text-sm"
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
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
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
                    {creating ? "Saving..." : "Schedule"}
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
