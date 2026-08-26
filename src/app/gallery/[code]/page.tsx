"use client";

import { useEffect, useState, use } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Check, Download, Image as ImageIcon, Sparkles, X, ChevronLeft, ChevronRight, Home, Send } from "lucide-react";

export default function GalleryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [rawImages, setRawImages] = useState<any[]>([]);
  const [editedImages, setEditedImages] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [clientId, setClientId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'raw' | 'edited'>('raw');
  
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [maxSelections, setMaxSelections] = useState(5); // Setup mặc định

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/gallery/${code}`);
        const json = await res.json();
        if (json.success) {
          setRawImages(json.rawFiles || []);
          setEditedImages(json.editedFiles || []);
          setClientId(json.clientId);
          setSelected(new Set(json.selectedIds));
          setMaxSelections(json.maxSelections || 5); // Cập nhật giới hạn từ Database
          
          if (json.editedFiles && json.editedFiles.length > 0) {
            setActiveTab('edited');
          }
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError("Lỗi kết nối");
      }
      setLoading(false);
    };
    fetchImages();
  }, [code]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (newSelected.size >= maxSelections) {
        alert(`Gói chụp hiện tại chỉ cho phép chọn tối đa ${maxSelections} bức ảnh! Vui lòng bỏ chọn ảnh khác trước khi chọn thêm nhé.`);
        return;
      }
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleSave = async () => {
    if (selected.size === 0) {
      if (!confirm("Bạn chưa chọn bức ảnh nào. Bạn có chắc chắn muốn gửi không?")) return;
    }
    setSaving(true);
    const selectedImages = rawImages.filter(img => selected.has(img.id));
    
    try {
      const res = await fetch(`/api/gallery/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, selectedImages }),
      });
      const json = await res.json();
      if (json.success) {
        alert(selected.size === 0 ? "Đã gửi thông báo cho Studio thành công!" : "Đã gửi yêu cầu chỉnh sửa cho Studio thành công!");
      } else {
        alert("Lỗi: " + json.error);
      }
    } catch (err) {
      alert("Lỗi khi lưu ảnh");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black flex items-center justify-center flex-col gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      <p className="text-zinc-400 font-medium tracking-widest uppercase text-sm">Đang tải thư viện ảnh</p>
    </div>
  );
  if (error) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400 font-medium">{error}</div>;

  const currentImages = activeTab === 'raw' ? rawImages : editedImages;

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black pb-32 overflow-x-hidden selection:bg-purple-500/30">
      
      {/* Decorative Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Glassmorphism */}
      <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-2xl border-b border-white/10 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-5">
          <div className="flex justify-between items-center w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <a href="/" className="p-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white transition-all shadow-inner" title="Quay về trang chủ">
                <Home size={20} />
              </a>
              <h1 className="text-lg sm:text-xl font-extrabold truncate max-w-[180px] sm:max-w-md text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 font-mono">
                {decodeURIComponent(code)}
              </h1>
            </div>
            <div className="sm:hidden"><ThemeToggle /></div>
          </div>
          
          {/* Custom Tabs */}
          <div className="flex p-1.5 bg-black/50 border border-white/10 rounded-full w-full sm:w-auto backdrop-blur-md shadow-inner">
            <button 
              onClick={() => setActiveTab('raw')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'raw' ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30 text-white scale-[1.02]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
            >
              <ImageIcon size={16} /> Ảnh Gốc <span className="opacity-70 font-normal">({selected.size}/{maxSelections})</span>
            </button>
            <button 
              onClick={() => setActiveTab('edited')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'edited' ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30 text-white scale-[1.02]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
            >
              <Sparkles size={16} /> Đã Sửa
            </button>
          </div>
          
          <div className="hidden sm:block"><ThemeToggle /></div>
        </div>
      </div>

      {/* Grid Ảnh */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mt-2 relative z-10">
        {currentImages.length === 0 ? (
          <div className="text-center text-zinc-500 mt-32 flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
              {activeTab === 'edited' ? <Sparkles size={40} className="text-purple-400 opacity-50" /> : <ImageIcon size={40} className="text-zinc-600" />}
            </div>
            <p className="text-lg font-medium text-zinc-400">
              {activeTab === 'edited' ? "Nhiếp ảnh gia đang xử lý ảnh của bạn. Trở lại sau nhé!" : "Chưa có ảnh nào trong thư mục này."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {currentImages.map((img, index) => {
              const isSelected = selected.has(img.id);
              return (
                <div 
                  key={img.id} 
                  className={`relative aspect-[3/4] group overflow-hidden rounded-2xl transition-all duration-300 ${isSelected && activeTab === 'raw' ? 'ring-4 ring-purple-500 ring-offset-4 ring-offset-zinc-950 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'border border-white/10 hover:border-white/30'}`}
                >
                  {/* Overlay Gradient Darken at bottom for better button visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
                  
                  <img
                    src={img.url}
                    alt={img.name}
                    onClick={() => setPreviewIndex(index)}
                    className="object-cover w-full h-full cursor-zoom-in transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Checkbox siêu đẹp */}
                  {activeTab === 'raw' && (
                    <div 
                      onClick={() => toggleSelect(img.id)}
                      className={`absolute top-4 right-4 w-10 h-10 cursor-pointer rounded-full flex items-center justify-center transition-all duration-300 z-20 backdrop-blur-md shadow-xl ${isSelected ? 'bg-gradient-to-tr from-purple-500 to-blue-500 text-white' : 'bg-black/40 border border-white/20 text-white hover:bg-black/60'}`}
                    >
                      <Check size={20} strokeWidth={isSelected ? 3 : 2} />
                    </div>
                  )}

                  {/* Nút Download tinh tế */}
                  {img.downloadUrl && (
                    <a
                      href={img.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={img.name}
                      title="Tải ảnh gốc về máy"
                      className="absolute bottom-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 shadow-xl z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 sm:translate-y-0 sm:opacity-100"
                    >
                      <Download size={18} strokeWidth={2.5} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox - Xem ảnh Full */}
      {previewIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
          onClick={() => setPreviewIndex(null)}
        >
          <button 
            className="absolute top-6 right-6 p-3 text-white hover:text-purple-400 z-50 bg-white/5 border border-white/10 rounded-full transition-colors backdrop-blur-md"
            onClick={() => setPreviewIndex(null)}
          >
            <X size={24} />
          </button>

          {previewIndex > 0 && (
            <button 
              className="absolute left-4 sm:left-10 p-4 text-white hover:text-purple-400 z-50 bg-white/5 border border-white/10 rounded-full transition-all hover:bg-white/10 active:scale-90 backdrop-blur-md"
              onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex - 1); }}
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {previewIndex < currentImages.length - 1 && (
            <button 
              className="absolute right-4 sm:right-10 p-4 text-white hover:text-purple-400 z-50 bg-white/5 border border-white/10 rounded-full transition-all hover:bg-white/10 active:scale-90 backdrop-blur-md"
              onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex + 1); }}
            >
              <ChevronRight size={32} />
            </button>
          )}

          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-16" onClick={(e) => e.stopPropagation()}>
            <img 
              src={currentImages[previewIndex].url.replace('=w1080', '=w2048')}
              alt={currentImages[previewIndex].name}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            />
            
            {activeTab === 'raw' && (
              <button 
                onClick={() => toggleSelect(currentImages[previewIndex].id)}
                className={`absolute bottom-10 px-10 py-4 rounded-full text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 border ${selected.has(currentImages[previewIndex].id) ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-transparent text-white shadow-purple-500/40' : 'bg-black/50 backdrop-blur-xl border-white/20 text-white hover:bg-black/70'}`}
              >
                <Check size={24} strokeWidth={selected.has(currentImages[previewIndex].id) ? 3 : 2} /> 
                {selected.has(currentImages[previewIndex].id) ? 'ĐÃ CHỌN ẢNH NÀY' : 'CHỌN ẢNH NÀY'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nút Gửi Studio Floating Island */}
      {activeTab === 'raw' && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none px-4">
          <div className="pointer-events-auto bg-black/60 backdrop-blur-2xl border border-white/10 p-2 pl-6 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex items-center gap-6 transition-all">
            <p className="font-medium text-sm sm:text-base text-zinc-300">
              Đã chọn <span className="text-white font-black text-xl px-1">{selected.size}/{maxSelections}</span>
            </p>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-white text-black px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-bold hover:bg-zinc-200 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl flex items-center gap-2"
            >
              {saving ? (
                <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
              ) : (
                <><Send size={18} /> Gửi Studio</>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
