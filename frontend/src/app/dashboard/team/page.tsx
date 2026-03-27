"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Loader2, X, Trash2, Users, Mail,
  Briefcase, AlertCircle, Edit2, Check
} from "lucide-react";
import { api } from "@/lib/api";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  created_at: string;
}

const ROLE_COLORS = [
  "from-blue-500 to-blue-700",
  "from-emerald-500 to-emerald-700",
  "from-rose-500 to-rose-700",
  "from-amber-500 to-amber-700",
  "from-purple-500 to-purple-700",
  "from-cyan-500 to-cyan-700",
  "from-pink-500 to-pink-700",
  "from-indigo-500 to-indigo-700",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ROLE_COLORS[Math.abs(hash) % ROLE_COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

interface FormState { name: string; role: string; email: string }

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", role: "", email: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ name: "", role: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.getTeam();
      setMembers(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    setError("");
    try {
      const created = await api.createTeamMember({
        name: form.name.trim(),
        role: form.role.trim(),
        email: form.email.trim(),
      });
      setMembers((prev) => [...prev, created]);
      setForm({ name: "", role: "", email: "" });
      setShowModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this team member?")) return;
    try {
      await api.deleteTeamMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("Failed to remove member");
    }
  }

  function startEdit(m: TeamMember) {
    setEditId(m.id);
    setEditForm({ name: m.name, role: m.role, email: m.email });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const updated = await api.updateTeamMember(id, editForm);
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
      setEditId(null);
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(""); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-900/30"
        >
          <Plus size={14} /> Add Member
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="text-blue-500 animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center">
            <Users size={28} className="text-zinc-700" />
          </div>
          <div className="text-center">
            <p className="text-zinc-400 font-medium">No team members yet</p>
            <p className="text-zinc-600 text-sm mt-1">Add your first team member to get started</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setError(""); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
          >
            <Plus size={14} /> Add Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const isEditing = editId === member.id;
            const gradient = getGradient(member.name);
            return (
              <div key={member.id} className="group bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-all">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Name"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 text-sm"
                    />
                    <input
                      value={editForm.role}
                      onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                      placeholder="Role (e.g. Frontend Dev)"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 text-sm"
                    />
                    <input
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="Email (optional)"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 text-sm"
                    />
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setEditId(null)} className="flex-1 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-all">
                        Cancel
                      </button>
                      <button onClick={() => saveEdit(member.id)} disabled={saving} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1">
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-gradient-to-br ${gradient} shadow-lg`}>
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">{member.name}</p>
                          {member.role && <p className="text-zinc-500 text-xs mt-0.5">{member.role}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(member)} className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-all">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDelete(member.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose-400 hover:bg-rose-400/5 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {member.email && (
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Mail size={12} className="flex-shrink-0" />
                          <span className="text-xs truncate">{member.email}</span>
                        </div>
                      )}
                      {member.role && (
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Briefcase size={12} className="flex-shrink-0" />
                          <span className="text-xs">{member.role}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-zinc-600 text-xs">Active member</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          <button
            onClick={() => { setShowModal(true); setError(""); }}
            className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-white/[0.06] hover:border-blue-500/40 hover:bg-blue-600/5 transition-all min-h-[160px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
              <Plus size={18} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <span className="text-xs font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">Add Team Member</span>
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Add Team Member</h2>
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
                <label className="text-xs text-zinc-400 font-medium block mb-1.5">Full Name <span className="text-rose-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Ana Silva" required autoFocus className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 text-sm" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1.5">Role <span className="text-zinc-600">(optional)</span></label>
                <input type="text" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="e.g. Frontend Developer" className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 text-sm" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1.5">Email <span className="text-zinc-600">(optional)</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="member@company.com" className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 text-sm" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-sm font-medium transition-all">Cancel</button>
                <button type="submit" disabled={creating || !form.name.trim()} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {creating ? <Loader2 size={14} className="animate-spin" /> : null}
                  {creating ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
