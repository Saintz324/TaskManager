"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Loader2, X, AlertCircle, Clock, CheckCircle2,
  Circle, Trash2, ChevronDown, UserCircle2
} from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date?: string;
  completed: boolean;
  project_id: string;
  assigned_to?: string;
  assigned_name?: string;
  assigned_role?: string;
}

interface Project {
  id: string;
  title: string;
  color?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

const COLUMNS: { key: Task["status"]; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "todo",        label: "To Do",       icon: <Circle size={14} />,       color: "text-zinc-400 bg-zinc-400/10" },
  { key: "in_progress", label: "In Progress", icon: <Clock size={14} />,        color: "text-blue-400 bg-blue-400/10" },
  { key: "completed",   label: "Completed",   icon: <CheckCircle2 size={14} />, color: "text-emerald-400 bg-emerald-400/10" },
];

const PRIORITY_STYLES: Record<string, string> = {
  high:   "text-rose-400 bg-rose-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  low:    "text-emerald-400 bg-emerald-400/10",
};

function getMemberInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

interface NewTaskForm {
  title: string; description: string; priority: Task["priority"];
  due_date: string; project_id: string; status: Task["status"]; assigned_to: string;
}

export default function TasksPage() {
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam]         = useState<TeamMember[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<NewTaskForm>({
    title: "", description: "", priority: "medium",
    due_date: "", project_id: "", status: "todo", assigned_to: "",
  });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [tasksData, projectsData, teamData] = await Promise.all([
        api.getTasks(), api.getProjects(), api.getTeam(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      setTeam(teamData);
      if (projectsData.length > 0 && !form.project_id) {
        setForm((f) => ({ ...f, project_id: projectsData[0].id }));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(task: Task, newStatus: Task["status"]) {
    try {
      const updated = await api.updateTask(task.id, {
        ...task, status: newStatus, completed: newStatus === "completed",
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch { /* silently fail */ }
  }

  async function handleAssign(task: Task, memberId: string) {
    try {
      const updated = await api.updateTask(task.id, { ...task, assigned_to: memberId || null });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch { /* silently fail */ }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch { alert("Failed to delete task"); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.project_id) return;
    setCreating(true);
    setError("");
    try {
      const created = await api.createTask({
        title:       form.title.trim(),
        description: form.description.trim(),
        priority:    form.priority,
        due_date:    form.due_date || undefined,
        project_id:  form.project_id,
        status:      form.status,
        assigned_to: form.assigned_to || undefined,
      });
      setTasks((prev) => [created, ...prev]);
      setForm((f) => ({ ...f, title: "", description: "", due_date: "", assigned_to: "" }));
      setShowModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  }

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const teamMap    = Object.fromEntries(team.map((m) => [m.id, m]));

  function openModal(status: Task["status"] = "todo") {
    if (projects.length === 0) { alert("Create a project first!"); return; }
    setForm((f) => ({ ...f, status }));
    setError("");
    setShowModal(true);
  }

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} across all projects
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-900/30"
        >
          <Plus size={14} /> New Task
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 size={28} className="text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="flex gap-4 flex-1 min-h-0 overflow-x-auto pb-1">
          {COLUMNS.map(({ key, label, icon, color }) => {
            const colTasks = tasks.filter((t) => t.status === key);
            return (
              <div key={key} className="flex flex-col bg-[#0d0d0d] border border-white/[0.06] rounded-2xl overflow-hidden min-w-[280px] flex-1">
                <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg ${color}`}>
                    {icon}
                    <span className="text-sm font-semibold">{label}</span>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-zinc-900 border border-white/[0.06] text-zinc-500 text-xs flex items-center justify-center font-semibold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center">{icon}</div>
                      <p className="text-zinc-600 text-xs text-center">No tasks here</p>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        project={projectMap[task.project_id]}
                        team={team}
                        teamMap={teamMap}
                        columns={COLUMNS}
                        onStatusChange={handleStatusChange}
                        onAssign={handleAssign}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>

                <button
                  onClick={() => openModal(key)}
                  className="flex items-center gap-2 p-3 m-3 rounded-xl border border-dashed border-white/[0.06] hover:border-blue-500/30 hover:bg-blue-600/5 text-zinc-600 hover:text-blue-400 text-xs font-medium transition-all"
                >
                  <Plus size={12} /> Add task
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />{error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1.5">Task Title</label>
                <input
                  type="text" value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="What needs to be done?" required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1.5">Description <span className="text-zinc-600">(optional)</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Add details..." rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1.5">Project</label>
                  <select value={form.project_id} onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))} required
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white focus:outline-none focus:border-blue-600 text-sm">
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Task["status"] }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white focus:outline-none focus:border-blue-600 text-sm">
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1.5">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Task["priority"] }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white focus:outline-none focus:border-blue-600 text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1.5">Due Date <span className="text-zinc-600">(optional)</span></label>
                  <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white focus:outline-none focus:border-blue-600 text-sm" />
                </div>
              </div>

              {/* Assign to member */}
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1.5">
                  Assign to <span className="text-zinc-600">(optional)</span>
                </label>
                {team.length === 0 ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-600 text-xs">
                    <UserCircle2 size={14} />
                    No team members yet — add them in the Team page
                  </div>
                ) : (
                  <select
                    value={form.assigned_to}
                    onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white focus:outline-none focus:border-blue-600 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {team.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}{m.role ? ` — ${m.role}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={creating || !form.title.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {creating ? <Loader2 size={14} className="animate-spin" /> : null}
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Task Card ── */
function TaskCard({
  task, project, team, teamMap, columns, onStatusChange, onAssign, onDelete,
}: {
  task: Task;
  project?: Project;
  team: TeamMember[];
  teamMap: Record<string, TeamMember>;
  columns: typeof COLUMNS;
  onStatusChange: (t: Task, s: Task["status"]) => void;
  onAssign: (t: Task, memberId: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu]         = useState(false);
  const [showAssign, setShowAssign]     = useState(false);

  const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date();

  return (
    <div className="group bg-[#111111] border border-white/[0.06] rounded-xl p-3.5 hover:border-white/10 transition-all">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <h4 className={`text-sm font-medium leading-snug flex-1 ${task.completed ? "line-through text-zinc-500" : "text-white"}`}>
          {task.title}
        </h4>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => { setShowMenu(!showMenu); setShowAssign(false); }}
            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300 transition-all p-0.5"
          >
            <ChevronDown size={12} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-5 z-20 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[150px]">
              {columns.filter((c) => c.key !== task.status).map((c) => (
                <button key={c.key}
                  onClick={() => { onStatusChange(task, c.key); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                  {c.icon} Move to {c.label}
                </button>
              ))}
              <div className="border-t border-white/[0.06]" />
              <button
                onClick={() => { setShowMenu(false); setShowAssign(true); }}
                className="w-full px-3 py-2 text-left text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                <UserCircle2 size={12} /> Assign to…
              </button>
              <div className="border-t border-white/[0.06]" />
              <button
                onClick={() => { onDelete(task.id); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-400/5 transition-colors flex items-center gap-2">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}

          {/* Assign sub-panel */}
          {showAssign && (
            <div className="absolute right-0 top-5 z-20 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
              <p className="px-3 py-2 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider border-b border-white/[0.06]">
                Assign to
              </p>
              <button
                onClick={() => { onAssign(task, ""); setShowAssign(false); }}
                className={`w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors flex items-center gap-2 ${!task.assigned_to ? "text-white" : "text-zinc-400 hover:text-white"}`}>
                <UserCircle2 size={12} className="text-zinc-600" /> Unassigned
              </button>
              {team.map((m) => (
                <button key={m.id}
                  onClick={() => { onAssign(task, m.id); setShowAssign(false); }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors flex items-center gap-2 ${task.assigned_to === m.id ? "text-white" : "text-zinc-400 hover:text-white"}`}>
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">
                    {m.name[0].toUpperCase()}
                  </div>
                  <span className="truncate">{m.name}</span>
                  {task.assigned_to === m.id && <span className="ml-auto text-blue-400">✓</span>}
                </button>
              ))}
              <div className="border-t border-white/[0.06]">
                <button onClick={() => setShowAssign(false)}
                  className="w-full px-3 py-2 text-left text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-zinc-600 text-xs mb-2.5 line-clamp-2">{task.description}</p>
      )}

      {/* Assignee */}
      {task.assigned_name && (
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">
            {task.assigned_name[0].toUpperCase()}
          </div>
          <span className="text-zinc-400 text-xs truncate">{task.assigned_name}</span>
        </div>
      )}

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        {project && (
          <span className="text-[10px] text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-900 border border-white/[0.04]">
            {project.title}
          </span>
        )}
        {task.due_date && (
          <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ml-auto ${isOverdue ? "text-rose-400 bg-rose-400/10" : "text-zinc-500 bg-zinc-900"}`}>
            <Clock size={9} />
            {format(new Date(task.due_date), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}
