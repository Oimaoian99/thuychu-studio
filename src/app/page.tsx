"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

export default function Home() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    router.push(`/gallery/${code.toUpperCase()}`);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Nút đổi theme có thể ẩn đi nếu chỉ muốn dark mode, nhưng cứ để cho ai thích đổi */}
      <div className="absolute top-4 right-4 flex items-center z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] p-8 sm:p-10 border border-white/10 z-10 relative overflow-hidden">
        {/* Ánh sáng hắt nhẹ trên card */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30 pointer-events-none" />
        
        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 mb-6 shadow-lg shadow-purple-500/30">
            <Camera size={36} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            Thủy Chu Studio
          </h1>
          <p className="text-zinc-400 font-medium">
            Nhập mã khách hàng của bạn để xem và chọn ảnh
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div>
            <input
              id="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: KHACH-01"
              className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-black/40 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all uppercase text-center font-bold tracking-widest text-lg shadow-inner"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-4 rounded-2xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            VÀO THƯ VIỆN ẢNH
          </button>
        </form>

        <div className="mt-10 text-center text-sm text-zinc-500 relative z-10">
          <a href="/admin" className="font-medium hover:text-white transition-colors flex items-center justify-center gap-2">
            Dành cho Quản trị viên
          </a>
        </div>
      </div>
    </main>
  );
}
