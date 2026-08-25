"use client";

import { useEffect, useState, use } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Check } from "lucide-react";

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
          setSelected(new Set(json.selectedIds)); // Những ảnh đã chọn từ trước
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải ảnh...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Mã Khách: {decodeURIComponent(code)}</h1>
            <p className="text-sm text-zinc-500">Đã chọn {selected.size} / {images.length} ảnh</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Thư viện ảnh */}
      <div className="max-w-6xl mx-auto p-4 mt-4">
        {images.length === 0 ? (
          <div className="text-center text-zinc-500 mt-20">Chưa có ảnh nào trong thư mục này.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => {
              const isSelected = selected.has(img.id);
              return (
                <div 
                  key={img.id} 
                  onClick={() => toggleSelect(img.id)}
                  className={`relative aspect-[3/4] group cursor-pointer overflow-hidden rounded-xl border-4 transition-all duration-200 ${isSelected ? 'border-green-500' : 'border-transparent'}`}
                >
                  {/* Sử dụng thẻ img chuẩn thay vì next/image vì url của Drive dễ thay đổi */}
                  <img
                    src={img.url}
                    alt={img.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Nút chọn (Tích xanh) */}
                  <div className={`absolute top-3 right-3 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-green-500 border-green-500 text-white' : 'bg-black/20 border-white text-transparent group-hover:border-white/50'}`}>
                    <Check size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Thanh công cụ dưới cùng */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-center shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-6xl flex justify-between items-center">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            Bạn đã chọn <span className="text-green-500 font-bold">{selected.size}</span> bức ảnh
          </p>
          <button 
            onClick={handleSave}
            disabled={saving || selected.size === 0}
            className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {saving ? "Đang gửi..." : "Gửi Lựa Chọn"}
          </button>
        </div>
      </div>
    </main>
  );
}
