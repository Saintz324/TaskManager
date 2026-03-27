"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, FolderOpen, Trash2, X, Loader2, MoreVertical } from "lucide-react";
import { api } from "@/lib/api";

interface Project {
  id: string;
  title: string;
  description?: string;
  color?: string;
  task_count: number;
  completed_count: number;
  created_at: string;
}

const COLORS = ["#2563eb", "#0891b2", "#059669", "#dc2626", "#d97706", "#db2777"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError("");
    try {
      await api.createProject({ title: title.trim(), description: description.trim() });
      setTitle("");
      setDescription("");
      setSelectedColor(COLORS[0]);
      setShowModal(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete project");
    }
  }

  const pct = (p: Project) =>
    p.task_count > 0 ? Math.round((p.completed_count / p.task_count) * 100) : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-900/30"
        >
          <Plus size={14} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="text-blue-500 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <FolderOpen size={40} className="text-zinc-700" />
          <p className="text-zinc-500 text-sm">No projects yet. Create your first one!</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
          >
            <Plus size={14} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="group bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-all flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${p.color ?? selectedColor}20`, border: `1px solid ${p.color ?? selectedColor}40` }}
                >
                  <FolderOpen size={18} style={{ color: p.color ?? selectedColor }} />
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-400 transition-all p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm">{p.title}</h3>
                {p.description && (
                  <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{p.description}</p>
                )}
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-500 text-xs">{p.completed_count}/{p.task_count} tasks</span>
                  <span className="text-zinc-400 text-xs font-semibold">{pct(p)}%</span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct(p)}%`, background: p.color ?? selectedColor }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-white/[0.06] hover:border-blue-500/40 hover:bg-blue-600/5 transition-all min-h-[160px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
              <Plus size={18} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <span className="text-xs font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">New Project</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">New Project</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1.5">Description <span className="text-zinc-600">(optional)</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-2">Color</label>
                <div className="flex items-center gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${selectedColor === c ? "scale-125 ring-2 ring-white/30 ring-offset-2 ring-offset-[#0d0d0d]" : "hover:scale-110"}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : null}
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
