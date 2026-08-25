"use client";

import { useEffect, useState, use } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Check, Download } from "lucide-react";

export default function GalleryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [images, setImages] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [clientId, setClientId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/gallery/${code}`);
        const json = await res.json();
        if (json.success) {
          setImages(json.files);
          setClientId(json.clientId);
          setSelected(new Set(json.selectedIds));
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
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleSave = async () => {
    setSaving(true);
    const selectedImages = images.filter(img => selected.has(img.id));
    
    try {
      const res = await fetch(`/api/gallery/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, selectedImages }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Đã lưu lại các ảnh bạn chọn thành công!");
      } else {
        alert("Lỗi: " + json.error);
      }
    } catch (err) {
      alert("Lỗi khi lưu ảnh");
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Đang tải ảnh...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">{error}</div>;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      {/* Header - Thiết kế responsive: padding tự co giãn trên mobile/pc */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg sm:text-xl font-bold truncate max-w-[200px] sm:max-w-md">Mã Khách: {decodeURIComponent(code)}</h1>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">Đã chọn {selected.size} / {images.length} ảnh</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Thư viện ảnh - Grid tương thích 2 cột Mobile, 3 cột Tablet, 4 cột PC */}
      <div className="max-w-6xl mx-auto p-2 sm:p-4 mt-2 sm:mt-4">
        {images.length === 0 ? (
          <div className="text-center text-zinc-500 mt-20">Chưa có ảnh nào trong thư mục này.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {images.map((img) => {
              const isSelected = selected.has(img.id);
              return (
                <div 
                  key={img.id} 
                  className={`relative aspect-[3/4] group overflow-hidden rounded-xl sm:rounded-2xl border-[3px] sm:border-4 transition-all duration-200 shadow-sm ${isSelected ? 'border-green-500 shadow-md shadow-green-500/20' : 'border-transparent'}`}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    onClick={() => toggleSelect(img.id)}
                    className="object-cover w-full h-full cursor-pointer transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Nút chọn (Tích xanh) - To và dễ bấm trên Mobile */}
                  <div 
                    onClick={() => toggleSelect(img.id)}
                    className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 cursor-pointer rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-green-500 border-green-500 text-white' : 'bg-black/30 border-white/80 text-white backdrop-blur-sm hover:bg-black/50 hover:border-white'}`}
                  >
                    <Check size={18} strokeWidth={isSelected ? 3 : 2} />
                  </div>

                  {/* Nút Tải xuống - Nổi bật ở góc trái dưới */}
                  {img.downloadUrl && (
                    <a
                      href={img.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={img.name} // Khuyên trình duyệt tải về
                      title="Tải ảnh gốc về máy"
                      className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-9 h-9 sm:w-10 sm:h-10 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white transition-colors shadow-lg active:scale-90"
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

      {/* Thanh công cụ dưới cùng - Dễ bấm trên Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex justify-center shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-20">
        <div className="w-full max-w-6xl flex justify-between items-center px-1 sm:px-2">
          <p className="font-medium text-sm sm:text-base text-zinc-700 dark:text-zinc-300">
            Bạn đã chọn <span className="text-green-600 dark:text-green-500 font-bold text-lg sm:text-xl px-1">{selected.size}</span> ảnh
          </p>
          <button 
            onClick={handleSave}
            disabled={saving || selected.size === 0}
            className="bg-black dark:bg-white text-white dark:text-black px-6 sm:px-10 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md"
          >
            {saving ? "Đang gửi..." : "Gửi Lựa Chọn"}
          </button>
        </div>
      </div>
    </main>
  );
}
