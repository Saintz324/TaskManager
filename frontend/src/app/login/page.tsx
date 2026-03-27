"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";
import { Eye, EyeOff, CheckSquare, Zap, Shield, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      {/* Left — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-20 relative z-10">
        {/* Logo */}
        <div className="absolute top-8 left-8 sm:left-16 lg:left-20 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <CheckSquare size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">TaskLab</span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Welcome!</h1>
          <p className="text-zinc-400 text-sm mb-8">Log in to TaskLab to continue.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
              {error}
            </div>
          )}


       

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email Address"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30 transition-all text-sm"
              />
            </div>

            <div>
            
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600/30 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Log in <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#070712] items-center justify-center">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-black to-indigo-950/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="text-5xl font-black text-white leading-tight tracking-tight mb-4">
            50K+ tasks<br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              completed.
            </span>
          </div>
          <p className="text-zinc-400 text-lg mb-8">Boost your team&apos;s productivity.</p>

          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-xl shadow-violet-900/40">
            Join Now <ArrowRight size={16} />
          </button>

          {/* Stats cards */}
          <div className="mt-16 grid grid-cols-3 gap-4">
            {[
              { icon: CheckSquare, value: "50K+", label: "Tasks Done" },
              { icon: Zap, value: "98%", label: "On Time" },
              { icon: Shield, value: "10K+", label: "Teams" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <Icon size={20} className="text-violet-400 mb-2 mx-auto" />
                <div className="text-white font-bold text-xl">{value}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Floating 3D element */}
          <div className="mt-12 relative mx-auto w-48 h-48">
            <div className="absolute inset-0 bg-violet-600/20 rounded-3xl blur-2xl animate-pulse" />
            <div className="relative w-full h-full rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-900/30 to-indigo-900/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-900/60 rotate-12">
                <CheckSquare size={28} className="text-white" />
              </div>
            </div>
            {/* Orbit ring */}
            <div className="absolute inset-[-20px] rounded-full border border-violet-500/10 animate-spin" style={{ animationDuration: "8s" }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
