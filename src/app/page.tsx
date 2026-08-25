"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    // Chuyển hướng khách hàng tới trang thư viện ảnh của mã đó
    router.push(`/gallery/${code.toUpperCase()}`);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-screen">
      <div className="absolute top-4 right-4 flex items-center">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Thuy Chu Studio</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Nhập mã khách hàng của bạn để xem và chọn ảnh
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Mã khách hàng
            </label>
            <input
              id="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: KHACH-01"
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all uppercase"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 px-4 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Vào thư viện ảnh
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500">
          <p>Dành cho quản trị viên?</p>
          <a href="/admin" className="font-medium underline hover:text-black dark:hover:text-white">
            Đăng nhập Admin
          </a>
        </div>
      </div>
    </main>
  );
}
