"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Trash2, FolderOpen, Images, LogOut, ArrowLeft, Edit2, Download } from "lucide-react";

import JSZip from "jszip";
// @ts-ignore
import { saveAs } from "file-saver";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [clients, setClients] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [maxSelections, setMaxSelections] = useState(5); // Setup số lượng ảnh
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalClientCode, setModalClientCode] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState("");

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
      const res = await fetch("/api/admin/clients", { cache: 'no-store' });
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
        body: JSON.stringify({ code: code.toUpperCase(), max_selections: maxSelections }),
      });
      const json = await res.json();

      if (json.success) {
        alert("Tạo mã khách hàng và setup thư mục thành công!");
        setCode("");
        setMaxSelections(5); // Reset về 5
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
        fetchClients(); 
      } else {
        alert("Lỗi khi xóa: " + json.error);
      }
    } catch (error) {
      alert("Lỗi kết nối");
    }
  };

  const handleUpdateLimit = async (id: string, currentLimit: number) => {
    const newLimitStr = prompt("Nhập số lượng ảnh tối đa MỚI cho khách hàng này:", currentLimit.toString());
    if (!newLimitStr) return;
    const newLimit = parseInt(newLimitStr, 10);
    
    if (isNaN(newLimit) || newLimit <= 0) {
      alert("Số lượng không hợp lệ! Vui lòng nhập một số lớn hơn 0.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ max_selections: newLimit })
      });
      const json = await res.json();
      
      if (json.success) {
        fetchClients();
      } else {
        alert("Lỗi khi cập nhật: " + json.error);
      }
    } catch (error) {
      alert("Lỗi kết nối");
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-sm bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white/10 relative z-10">
          <h1 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Đăng nhập Admin</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-purple-500/25"
            >
              {loginLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black p-4 sm:p-8 relative overflow-hidden text-zinc-200">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex justify-between items-start sm:items-center mb-10 flex-col sm:flex-row gap-4">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white mb-2 transition-colors">
              <ArrowLeft size={16} /> Quay về Trang chủ
            </a>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-full border border-white/10 backdrop-blur-md">
            <button 
              onClick={() => {
                localStorage.removeItem("admin_authenticated");
                setIsAuthenticated(false);
              }}
              className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-red-400 transition-colors px-4 py-1"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div className="md:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/10">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">Tạo mã mới</h2>
              <form onSubmit={handleCreateClient} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-400">Mã khách hàng</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VD: KHACH-01"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all uppercase shadow-inner font-mono mb-4"
                  />
                  <label className="block text-sm font-medium mb-2 text-zinc-400">Số lượng ảnh tối đa khách được chọn</label>
                  <input
                    type="number"
                    min="1"
                    value={maxSelections}
                    onChange={(e) => setMaxSelections(Number(e.target.value))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-inner font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
                >
                  {loading ? "Đang tạo..." : "Tạo thư mục & Mã"}
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/10">
              <h2 className="text-xl font-bold mb-6">Danh sách Khách hàng</h2>
              
              {fetchLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 bg-black/20 rounded-2xl border border-white/5">
                  Chưa có khách hàng nào.
                </div>
              ) : (
                <div className="space-y-4">
                  {clients.map((c) => (
                    <div key={c.id} className="p-5 border border-white/10 bg-black/20 rounded-2xl hover:bg-white/5 transition-all group">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-xl font-mono text-white flex items-center gap-2">
                            {c.code}
                          </p>
                          <p className="text-xs text-zinc-500 mt-2 font-mono break-all flex items-center gap-3">
                            <span>ID: {c.drive_folder_id}</span>
                            <span 
                              onClick={() => handleUpdateLimit(c.id, c.max_selections || 5)}
                              className="text-purple-400 font-bold flex items-center gap-1.5 cursor-pointer hover:text-purple-300 hover:underline transition-all bg-purple-500/10 px-2 py-0.5 rounded-md"
                              title="Bấm để đổi số lượng ảnh"
                            >
                              • Gói: {c.max_selections || 5} ảnh <Edit2 size={12} />
                            </span>
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <a 
                            href={`/api/admin/drive-redirect?folderId=${c.drive_folder_id}&type=GOC`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-semibold hover:bg-blue-500/20 transition-colors"
                          >
                            <FolderOpen size={16} /> Đẩy file gốc
                          </a>
                          <a 
                            href={`/api/admin/drive-redirect?folderId=${c.drive_folder_id}&type=SUA`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-semibold hover:bg-emerald-500/20 transition-colors"
                          >
                            <FolderOpen size={16} /> Đẩy file sửa
                          </a>
                          <button 
                            onClick={() => handleViewPhotos(c.id, c.code)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors"
                          >
                            <Images size={16} /> Xem ảnh chọn
                          </button>
                          <button 
                            onClick={() => handleDeleteClient(c.id, c.code)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Xóa khách hàng"
                          >
                            <Trash2 size={16} /> Xóa
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

      {/* Modal Xem Ảnh Chọn */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-zinc-950 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Images size={20} className="text-purple-400" /> Khách: {modalClientCode}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">✕</button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loadingPhotos ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : selectedPhotos.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 bg-black/30 rounded-xl border border-white/5">
                  Khách chưa chọn bức ảnh nào.
                </div>
              ) : (
                <>
                  <p className="mb-4 font-semibold text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-xl inline-block">
                    Tổng cộng: {selectedPhotos.length} ảnh
                  </p>
                  <ul className="space-y-2 mt-2">
                    {selectedPhotos.map((photo, index) => (
                      <li key={index} className="flex justify-between p-3 bg-black/40 border border-white/5 rounded-xl text-sm font-mono text-zinc-300 hover:bg-white/5 transition-colors">
                        {photo.image_name}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6 flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        const names = selectedPhotos.map(p => p.image_name).join(", ");
                        navigator.clipboard.writeText(names);
                        alert("Đã copy danh sách tên file!");
                      }}
                      className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors shadow-lg"
                    >
                      Copy danh sách tên file
                    </button>
                    <button 
                      onClick={async () => {
                        if (selectedPhotos.length === 0) return;
                        setZipping(true);
                        setZipProgress("Đang chuẩn bị...");
                        
                        try {
                          const zip = new JSZip();
                          
                          for (let i = 0; i < selectedPhotos.length; i++) {
                            const photo = selectedPhotos[i];
                            setZipProgress(`Đang tải ảnh ${i + 1}/${selectedPhotos.length}...`);
                            
                            // Dùng proxy API để tránh lỗi CORS
                            const res = await fetch(`/api/drive/proxy?id=${photo.image_drive_id}`);
                            if (!res.ok) throw new Error("Lỗi tải ảnh");
                            
                            const blob = await res.blob();
                            zip.file(photo.image_name, blob);
                          }
                          
                          setZipProgress("Đang nén file (có thể mất vài chục giây)...");
                          const content = await zip.generateAsync({ type: "blob" });
                          
                          saveAs(content, `ThuyChuStudio_${modalClientCode}.zip`);
                        } catch (err) {
                          alert("Có lỗi xảy ra khi nén file. Vui lòng thử lại sau.");
                          console.error(err);
                        } finally {
                          setZipping(false);
                          setZipProgress("");
                        }
                      }}
                      disabled={zipping}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {zipping ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {zipProgress}
                        </>
                      ) : (
                        <>
                          <Download size={18} /> Tải toàn bộ ảnh (.ZIP)
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
