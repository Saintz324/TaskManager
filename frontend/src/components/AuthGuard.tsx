"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#D3D5FD] rounded-lg flex items-center justify-center animate-pulse">
            <span className="text-[#0B0B0D] font-black text-xs">TL</span>
          </div>
          <span className="text-white font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
