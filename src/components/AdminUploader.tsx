"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { UploadCloud, X, File as FileIcon, CheckCircle2, AlertCircle, Image as ImageIcon, Film, Folder } from "lucide-react";

interface AdminUploaderProps {
  folderId: string;
  type: string; // 'GOC' or 'SUA'
  onClose: () => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMsg?: string;
}

export default function AdminUploader({ folderId, type, onClose }: AdminUploaderProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  const fetchExistingFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch(`/api/admin/drive/list?parentId=${folderId}&type=${type}`);
      const json = await res.json();
      if (json.success) {
        setExistingFiles(json.files);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingFiles(false);
  };

  useEffect(() => {
    fetchExistingFiles();
  }, [folderId, type]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const newUploads = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newUploads]);
    
    // Tự động bắt đầu tải lên
    newUploads.forEach(startUpload);
  };

  const startUpload = async (uploadItem: UploadingFile) => {
    updateFileStatus(uploadItem.id, 'uploading', 0);
    
    try {
      // Bước 1: Xin URL upload (bỏ qua giới hạn Vercel)
      const sessionRes = await fetch('/api/admin/upload-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: uploadItem.file.name,
          mimeType: uploadItem.file.type,
          parentId: folderId,
          type: type
        })
      });
      
      const sessionData = await sessionRes.json();
      if (!sessionData.success) {
        throw new Error(sessionData.error || "Không thể khởi tạo phiên tải lên.");
      }

      // Bước 2: Bắn thẳng dữ liệu lên Google Drive qua XMLHttpRequest để đo được phần trăm
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', sessionData.uploadUrl, true);
      xhr.setRequestHeader('Content-Type', uploadItem.file.type || 'application/octet-stream');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          updateFileStatus(uploadItem.id, 'uploading', percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          updateFileStatus(uploadItem.id, 'success', 100);
          try {
            const responseData = JSON.parse(xhr.responseText);
            if (responseData.id) {
              setExistingFiles(prev => [{
                id: responseData.id,
                name: responseData.name || uploadItem.file.name,
                mimeType: uploadItem.file.type
              }, ...prev]);
            }
          } catch(e) {}
        } else {
          updateFileStatus(uploadItem.id, 'error', 0, `Lỗi Server: ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        updateFileStatus(uploadItem.id, 'error', 0, "Lỗi kết nối mạng.");
      };

      xhr.send(uploadItem.file);
    } catch (err: any) {
      updateFileStatus(uploadItem.id, 'error', 0, err.message);
    }
  };

  const updateFileStatus = (id: string, status: UploadingFile['status'], progress: number, errorMsg?: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status, progress, errorMsg } : f));
  };

  const totalFiles = files.length;
  const completedFiles = files.filter(f => f.status === 'success').length;
  const errorFiles = files.filter(f => f.status === 'error').length;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-black/40">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <UploadCloud className="text-purple-400" /> 
            Tải lên thư mục: <span className={type === 'GOC' ? 'text-blue-400' : 'text-emerald-400'}>{type}</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Files sẽ được đẩy thẳng lên Google Drive (ID: {folderId})</p>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-zinc-300 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Vùng Drop zone */}
        <div className="w-full md:w-1/2 p-6 flex flex-col h-full border-r border-white/10">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl cursor-pointer transition-all ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'}`}
          >
            <UploadCloud size={64} className={`mb-6 ${isDragging ? 'text-purple-400' : 'text-zinc-500'}`} />
            <h3 className="text-2xl font-bold text-white mb-2 text-center px-4">Kéo thả ảnh/video vào đây</h3>
            <p className="text-zinc-400 text-center px-4">Hoặc bấm vào để chọn file từ máy</p>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
          </div>
        </div>

        {/* Danh sách File Tải lên */}
        <div className="w-full md:w-1/2 flex flex-col h-full bg-black/20 border-b md:border-b-0 border-white/10">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="font-bold text-white">Tiến trình tải lên</h3>
            <div className="flex gap-4 text-sm font-medium">
              <span className="text-green-400">Xong: {completedFiles}</span>
              {errorFiles > 0 && <span className="text-red-400">Lỗi: {errorFiles}</span>}
              <span className="text-zinc-400">Tổng: {totalFiles}</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {files.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500">
                Chưa có file nào được chọn
              </div>
            ) : (
              files.map(f => (
                <div key={f.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-lg text-zinc-400 shrink-0">
                    <FileIcon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-bold text-white truncate pr-4">{f.file.name}</p>
                      <p className="text-xs font-mono text-zinc-400 shrink-0">{(f.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-300 ${f.status === 'error' ? 'bg-red-500' : f.status === 'success' ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                    {f.status === 'error' && (
                      <p className="text-xs text-red-400 mt-2 truncate flex items-center gap-1">
                        <AlertCircle size={12} /> {f.errorMsg}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-8">
                    {f.status === 'success' && <CheckCircle2 className="text-green-500" size={24} />}
                    {f.status === 'error' && <AlertCircle className="text-red-500" size={24} />}
                    {f.status === 'uploading' && <span className="text-xs font-bold text-purple-400">{f.progress}%</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Danh sách File đã có sẵn (Existing Files) */}
      <div className="flex-1 flex flex-col border-t border-white/10 bg-zinc-900/50 min-h-[300px]">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
          <h3 className="font-bold text-white flex items-center gap-2">
            <ImageIcon size={18} className="text-blue-400" />
            Các file đã có trong thư mục ({existingFiles.length})
          </h3>
          <button onClick={fetchExistingFiles} className="text-sm text-zinc-400 hover:text-white transition-colors underline">
            Làm mới
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loadingFiles ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : existingFiles.length === 0 ? (
            <div className="flex justify-center items-center h-full text-zinc-500">
              Chưa có ảnh nào trong thư mục này.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {existingFiles.map((file, idx) => (
                <div key={file.id + idx} className="aspect-square bg-black/40 rounded-xl overflow-hidden border border-white/10 relative group">
                  {file.mimeType === 'application/vnd.google-apps.folder' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-purple-900/20 text-purple-400">
                      <Folder size={32} className="mb-2" fill="currentColor" fillOpacity={0.2} />
                      <span className="text-xs font-bold truncate w-full px-2 text-center">{file.name}</span>
                    </div>
                  ) : file.mimeType?.includes('video') ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-900/20 text-blue-400">
                      <Film size={24} className="mb-2" />
                      <span className="text-[10px] truncate w-full px-2 text-center">{file.name}</span>
                    </div>
                  ) : (
                    <img 
                      src={`/api/drive/thumbnail?id=${file.id}`} 
                      alt={file.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      loading="lazy"
                    />
                  )}
                  {file.mimeType !== 'application/vnd.google-apps.folder' && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                      <p className="text-xs text-white truncate w-full">{file.name}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
