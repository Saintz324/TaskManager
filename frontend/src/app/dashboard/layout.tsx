"use client";
import { useState } from "react";
import { Menu, CheckSquare } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — slides in on mobile, always visible on lg+ */}
        <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main area */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Mobile top bar */}
          <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-[#050505] border-b border-white/[0.05] flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <CheckSquare size={12} className="text-white" />
              </div>
              <span className="text-white font-bold text-sm tracking-tight">TaskLab</span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-[#080808]">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
