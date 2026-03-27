"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/auth";
import { Eye, EyeOff, CheckSquare, ArrowRight, Users, Star } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
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
      await register(name, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <CheckSquare size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">TaskLab</span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Create account</h1>
          <p className="text-zinc-400 text-sm mb-8">Start managing your tasks today.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block tracking-wide">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all text-sm"
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
              className="w-full py-2.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create account <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#070712] items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-black to-blue-950/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }}
        />

        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="text-5xl font-black text-white leading-tight tracking-tight mb-4">
            Join{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-400 bg-clip-text text-transparent">
              10K+ teams
            </span>
            <br />today.
          </div>
          <p className="text-zinc-400 text-lg mb-8">
            Organize, track, and deliver work faster.
          </p>

          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-xl shadow-blue-900/40">
            Get Started Free <ArrowRight size={16} />
          </button>

          <div className="mt-16 grid grid-cols-2 gap-4">
            {[
              { icon: Users, value: "10K+", label: "Active Teams" },
              { icon: CheckSquare, value: "50K+", label: "Tasks Completed" },
              { icon: Star, value: "4.9", label: "Average Rating" },
              { icon: ArrowRight, value: "99%", label: "Uptime" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <Icon size={18} className="text-blue-400 mb-2 mx-auto" />
                <div className="text-white font-bold text-xl">{value}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
