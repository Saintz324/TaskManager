"use client";
import { useState, useEffect, useCallback } from "react";
import {
  User, Mail, Lock, Bell, LogOut, Loader2,
  CheckCircle2, AlertCircle, Shield, Trash2
} from "lucide-react";
import { api } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";

interface UserData {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? "bg-blue-600" : "bg-zinc-800"
      }`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${enabled ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Preferences (UI only — no backend yet)
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const load = useCallback(async () => {
    try {
      // Try API first, fallback to localStorage
      let data: UserData;
      try {
        data = await api.getMe();
      } catch {
        const local = getUser();
        data = local ?? { id: "", name: "", email: "" };
      }
      setUserData(data);
      setName(data.name ?? "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      await api.updateMe({ name: name.trim() });
      setUserData((prev) => prev ? { ...prev, name: name.trim() } : prev);
      // Update localStorage too
      const local = getUser();
      if (local) {
        localStorage.setItem("tasklab_user", JSON.stringify({ ...local, name: name.trim() }));
      }
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  }

  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={28} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: Forms */}
        <div className="col-span-2 space-y-4">

          {/* Profile */}
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <User size={16} className="text-zinc-400" />
              <h2 className="text-white font-semibold">Profile</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1.5">
                  Email <span className="text-zinc-600 font-normal">(read-only)</span>
                </label>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30">
                  <Mail size={14} className="text-zinc-600 flex-shrink-0" />
                  <span className="text-zinc-500 text-sm">{userData?.email ?? ""}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving || name === userData?.name}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                {saveStatus === "success" && (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                    <CheckCircle2 size={14} />
                    Saved successfully
                  </div>
                )}
                {saveStatus === "error" && (
                  <div className="flex items-center gap-1.5 text-rose-400 text-sm">
                    <AlertCircle size={14} />
                    Failed to save
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Password */}
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={16} className="text-zinc-400" />
              <h2 className="text-white font-semibold">Password</h2>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <Shield size={16} className="text-zinc-600" />
              <div>
                <p className="text-zinc-400 text-sm font-medium">Password change</p>
                <p className="text-zinc-600 text-xs mt-0.5">Contact support to change your password securely.</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell size={16} className="text-zinc-400" />
              <h2 className="text-white font-semibold">Notifications</h2>
            </div>
            <div className="space-y-0">
              {[
                {
                  label: "Email Notifications",
                  desc: "Receive task updates via email",
                  value: emailNotifs,
                  toggle: () => setEmailNotifs((v) => !v),
                },
                {
                  label: "Task Reminders",
                  desc: "Get reminded before tasks are due",
                  value: taskReminders,
                  toggle: () => setTaskReminders((v) => !v),
                },
                {
                  label: "Weekly Digest",
                  desc: "Summary of your week every Monday",
                  value: weeklyDigest,
                  toggle: () => setWeeklyDigest((v) => !v),
                },
              ].map(({ label, desc, value, toggle }) => (
                <div key={label} className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{desc}</p>
                  </div>
                  <Toggle enabled={value} onChange={toggle} />
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#0d0d0d] border border-rose-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlertCircle size={16} className="text-rose-400" />
              <h2 className="text-rose-400 font-semibold">Danger Zone</h2>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
              <div>
                <p className="text-white text-sm font-medium">Sign out</p>
                <p className="text-zinc-500 text-xs mt-0.5">Sign out of your account on this device</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 text-sm font-medium transition-all"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
            <div className="flex items-center justify-between py-3 mt-1">
              <div>
                <p className="text-white text-sm font-medium">Delete account</p>
                <p className="text-zinc-500 text-xs mt-0.5">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={() => alert("Contact support to delete your account.")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 text-sm font-medium transition-all"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Right: Profile Card */}
        <div className="col-span-1 space-y-4">
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-blue-900/30 mb-4">
              {initials}
            </div>
            <p className="text-white font-bold text-lg leading-tight">{name || "—"}</p>
            <p className="text-zinc-500 text-sm mt-1 break-all">{userData?.email ?? ""}</p>

            {userData?.created_at && (
              <div className="mt-4 pt-4 w-full border-t border-white/[0.05]">
                <p className="text-zinc-600 text-xs">Member since</p>
                <p className="text-zinc-400 text-xs font-medium mt-0.5">
                  {new Date(userData.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
            )}
          </div>

          {/* Account info */}
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-4">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Account Info</p>
            <div className="space-y-3">
              {[
                { label: "Plan", value: "Free" },
                { label: "Storage", value: "Unlimited" },
                { label: "2FA", value: "Disabled" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-zinc-500 text-xs">{label}</span>
                  <span className="text-zinc-300 text-xs font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
