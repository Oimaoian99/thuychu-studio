"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [clients, setClients] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalClientCode, setModalClientCode] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const isAuth = localStorage.getItem("admin_authenticated");
    if (isAuth === "true") {
      setIsAuthenticated(true);
      fetchClients();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      
      if (json.success) {
        localStorage.setItem("admin_authenticated", "true");
        setIsAuthenticated(true);
        fetchClients();
      } else {
        alert("Sai mật khẩu!");
      }
    } catch (error) {
      alert("Lỗi kết nối");
    }
    setLoginLoading(false);
  };

  const fetchClients = async () => {
    setFetchLoading(true);
    try {
      const res = await fetch("/api/admin/clients");
      const json = await res.json();
      if (json.success) setClients(json.data);
    } catch (error) {
      console.error(error);
    }
    setFetchLoading(false);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });
      const json = await res.json();

      if (json.success) {
        alert("Tạo mã khách hàng và thư mục Drive thành công!");
        setCode("");
        fetchClients();
      } else {
        alert("Lỗi: " + json.error);
      }
    } catch (error) {
      alert("Lỗi kết nối");
    }
    setLoading(false);
  };

  const handleViewPhotos = async (clientId: string, clientCode: string) => {
    setModalClientCode(clientCode);
    setShowModal(true);
    setLoadingPhotos(true);
    setSelectedPhotos([]);

    try {
      const res = await fetch(`/api/admin/clients/${clientId}/selected`);
      const json = await res.json();
      if (json.success) {
        setSelectedPhotos(json.data);
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingPhotos(false);
  };

  const handleDeleteClient = async (id: string, code: string) => {
    if (!confirm(`Bạn có CHẮC CHẮN muốn xóa mã đăng nhập của khách [ ${code} ] không?\n\nLưu ý: Dữ liệu trên web sẽ bị xóa sạch, nhưng thư mục gốc trên Google Drive vẫn sẽ được giữ lại an toàn.`)) return;
    
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
      const json = await res.json();
      
      if (json.success) {
        alert("Đã xóa khách hàng thành công!");
        fetchClients(); // Tải lại danh sách
      } else {
        alert("Lỗi khi xóa: " + json.error);
      }
    } catch (error) {
      alert("Lỗi kết nối");
    }
  };

  // NẾU CHƯA ĐĂNG NHẬP -> HIỂN THỊ FORM ĐĂNG NHẬP
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-colors"
            >
              {loginLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // NẾU ĐÃ ĐĂNG NHẬP -> HIỂN THỊ TRANG QUẢN TRỊ
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start sm:items-center mb-8 flex-col sm:flex-row gap-4">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white mb-2 transition-colors">
              ← Quay về Trang chủ
            </a>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                localStorage.removeItem("admin_authenticated");
                setIsAuthenticated(false);
              }}
              className="text-sm font-medium text-red-500 hover:underline"
            >
              Đăng xuất
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Tạo mã mới</h2>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mã khách hàng</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VD: KHACH-01"
                    required
                    className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent uppercase focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Đang tạo..." : "Tạo thư mục & Mã"}
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Danh sách Khách hàng</h2>
              
              {fetchLoading ? (
                <p className="text-zinc-500">Đang tải...</p>
              ) : clients.length === 0 ? (
                <p className="text-zinc-500">Chưa có khách hàng nào.</p>
              ) : (
                <div className="space-y-3">
                  {clients.map((c) => (
                    <div key={c.id} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-bold text-lg">{c.code}</p>
                          <p className="text-xs text-zinc-500 mt-1">Drive ID: {c.drive_folder_id}</p>
                        </div>
                        <div className="flex gap-2">
                          <a 
                            href={`https://drive.google.com/drive/folders/${c.drive_folder_id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-sm font-medium"
                          >
                            Mở Drive
                          </a>
                          <button 
                            onClick={() => handleViewPhotos(c.id, c.code)}
                            className="px-3 py-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 rounded text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            Xem ảnh chọn
                          </button>
                          <button 
                            onClick={() => handleDeleteClient(c.id, c.code)}
                            className="px-3 py-1 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                            title="Xóa khách hàng"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-bold">Khách: {modalClientCode}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-black dark:hover:text-white font-bold p-2">✕</button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {loadingPhotos ? (
                <p className="text-center py-8">Đang tải dữ liệu...</p>
              ) : selectedPhotos.length === 0 ? (
                <p className="text-center py-8 text-zinc-500">Khách chưa chọn bức ảnh nào.</p>
              ) : (
                <>
                  <p className="mb-4 font-medium text-green-600">Tổng cộng: {selectedPhotos.length} ảnh</p>
                  <ul className="space-y-2">
                    {selectedPhotos.map((photo, index) => (
                      <li key={index} className="flex justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded text-sm">
                        <span>{photo.image_name}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={() => {
                      const names = selectedPhotos.map(p => p.image_name).join(", ");
                      navigator.clipboard.writeText(names);
                      alert("Đã copy danh sách tên file!");
                    }}
                    className="mt-6 w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded font-medium"
                  >
                    Copy danh sách tên file
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
