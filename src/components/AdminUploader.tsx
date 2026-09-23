"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { UploadCloud, X, File as FileIcon, CheckCircle2, AlertCircle, Image as ImageIcon, Film, Folder, ChevronRight, ChevronLeft, Download, Plus } from "lucide-react";
import CustomVideoPlayer from "./CustomVideoPlayer"; // Assuming we can use this

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

  // Stack navigation
  const [folderStack, setFolderStack] = useState<{id: string, name: string}[]>([]);
  const [rootResolved, setRootResolved] = useState(false);

  // Lightbox
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Create folder
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const currentFolder = folderStack.length > 0 ? folderStack[folderStack.length - 1] : null;

  const fetchExistingFiles = async (exactFolderId?: string) => {
    setLoadingFiles(true);
    try {
      const url = exactFolderId 
        ? `/api/admin/drive/list?exactFolderId=${exactFolderId}`
        : `/api/admin/drive/list?parentId=${folderId}&type=${type}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setExistingFiles(json.files);
        if (!exactFolderId && json.folderId && folderStack.length === 0) {
          setFolderStack([{ id: json.folderId, name: type }]);
          setRootResolved(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingFiles(false);
  };

  useEffect(() => {
    if (folderStack.length === 0 && !rootResolved) {
      fetchExistingFiles();
    } else if (currentFolder) {
      fetchExistingFiles(currentFolder.id);
    }
  }, [currentFolder?.id, rootResolved]);

  const handleNavigateIn = (folderId: string, folderName: string) => {
    setFolderStack(prev => [...prev, { id: folderId, name: folderName }]);
  };

  const handleNavigateOut = (index: number) => {
    setFolderStack(prev => prev.slice(0, index + 1));
  };

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
    
    newUploads.forEach(startUpload);
  };

  const startUpload = async (uploadItem: UploadingFile) => {
    updateFileStatus(uploadItem.id, 'uploading', 0);
    
    try {
      const body: any = {
        name: uploadItem.file.name,
        mimeType: uploadItem.file.type
      };

      if (currentFolder) {
        body.exactFolderId = currentFolder.id;
      } else {
        body.parentId = folderId;
        body.type = type;
      }

      const sessionRes = await fetch('/api/admin/upload-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const sessionData = await sessionRes.json();
      if (!sessionData.success) {
        throw new Error(sessionData.error || "Không thể khởi tạo phiên tải lên.");
      }

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

  const createFolder = async () => {
    if (!newFolderName.trim() || !currentFolder) return;
    setIsCreatingFolder(true);
    try {
      const res = await fetch('/api/admin/drive/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, parentId: currentFolder.id })
      });
      const data = await res.json();
      if (data.success) {
        setExistingFiles(prev => [data.folder, ...prev]);
        setNewFolderName("");
      } else {
        alert("Lỗi tạo thư mục: " + data.error);
      }
    } catch (e: any) {
      alert("Lỗi tạo thư mục: " + e.message);
    }
    setIsCreatingFolder(false);
  };

  const handleDownload = (fileId: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = `/api/drive/proxy?id=${fileId}&action=download`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Quản lý File
          </h2>
          <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
            {folderStack.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                <button 
                  onClick={() => handleNavigateOut(index)}
                  className={`hover:text-white transition-colors ${index === folderStack.length - 1 ? 'font-bold text-white' : ''}`}
                >
                  {folder.name}
                </button>
                {index < folderStack.length - 1 && <ChevronRight size={14} />}
              </div>
            ))}
            {folderStack.length === 0 && <span>Đang tải...</span>}
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-zinc-300 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="h-48 md:h-56 shrink-0 overflow-hidden flex flex-col md:flex-row border-b border-white/10">
        {/* Vùng Drop zone */}
        <div className="w-full md:w-1/2 p-4 flex flex-col h-full border-r border-white/10">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'}`}
          >
            <UploadCloud size={40} className={`mb-3 ${isDragging ? 'text-purple-400' : 'text-zinc-500'}`} />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 text-center px-4">Kéo thả ảnh/video vào đây</h3>
            <p className="text-zinc-400 text-center px-4 text-xs">Sẽ tải vào thư mục hiện tại</p>
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
        <div className="w-full md:w-1/2 flex flex-col h-full bg-black/20">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="font-bold text-white text-sm">Tiến trình tải lên</h3>
            <div className="flex gap-4 text-xs font-medium">
              <span className="text-green-400">Xong: {completedFiles}</span>
              {errorFiles > 0 && <span className="text-red-400">Lỗi: {errorFiles}</span>}
              <span className="text-zinc-400">Tổng: {totalFiles}</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {files.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                Chưa có file nào được chọn
              </div>
            ) : (
              files.map(f => (
                <div key={f.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg text-zinc-400 shrink-0">
                    <FileIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold text-white truncate pr-4">{f.file.name}</p>
                      <p className="text-[10px] font-mono text-zinc-400 shrink-0">{(f.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-300 ${f.status === 'error' ? 'bg-red-500' : f.status === 'success' ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                    {f.status === 'error' && (
                      <p className="text-[10px] text-red-400 mt-1 truncate flex items-center gap-1">
                        <AlertCircle size={10} /> {f.errorMsg}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Danh sách File đã có sẵn */}
      <div className="flex-1 flex flex-col border-t border-white/10 bg-zinc-900/50 min-h-0">
        <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 justify-between items-center bg-black/40">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
            <ImageIcon size={18} className="text-blue-400" />
            Trong thư mục này ({existingFiles.length})
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-black/40 border border-white/10 rounded-full overflow-hidden">
              <input 
                type="text" 
                placeholder="Thư mục mới..." 
                className="bg-transparent text-white px-3 py-1.5 text-sm outline-none w-32 sm:w-48"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createFolder()}
              />
              <button 
                onClick={createFolder}
                disabled={isCreatingFolder || !newFolderName.trim()}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-sm flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Plus size={16} /> Tạo
              </button>
            </div>
            <button onClick={() => currentFolder && fetchExistingFiles(currentFolder.id)} className="text-sm text-zinc-400 hover:text-white transition-colors underline ml-2">
              Làm mới
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loadingFiles ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : existingFiles.length === 0 ? (
            <div className="flex justify-center items-center h-full text-zinc-500">
              Chưa có file/thư mục nào.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {existingFiles.map((file, idx) => (
                <div 
                  key={file.id + idx} 
                  className="aspect-square bg-black/40 rounded-xl overflow-hidden border border-white/10 relative group cursor-pointer"
                  onClick={() => {
                    if (file.mimeType === 'application/vnd.google-apps.folder') {
                      handleNavigateIn(file.id, file.name);
                    } else {
                      setPreviewIndex(idx);
                    }
                  }}
                >
                  {file.mimeType === 'application/vnd.google-apps.folder' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-purple-900/20 text-purple-400 group-hover:bg-purple-900/40 transition-colors">
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

      {/* Lightbox Xem Ảnh (Dành riêng cho Admin) */}
      {previewIndex !== null && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <button 
            onClick={(e) => { e.stopPropagation(); setPreviewIndex(null); }}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full z-[310] transition-colors"
          >
            <X size={24} />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(existingFiles[previewIndex].id, existingFiles[previewIndex].name);
            }}
            className="absolute top-4 right-20 sm:top-8 sm:right-24 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full z-[310] transition-colors shadow-lg shadow-blue-500/20"
            title="Tải ảnh này về"
          >
            <Download size={24} />
          </button>

          {previewIndex > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex - 1); }}
              className="absolute left-4 p-4 text-white hover:bg-white/10 rounded-full z-[310] transition-colors"
            >
              <ChevronLeft size={32} />
            </button>
          )}
          {previewIndex < existingFiles.length - 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Bỏ qua nếu next file là folder
                let nextIdx = previewIndex + 1;
                while (nextIdx < existingFiles.length && existingFiles[nextIdx].mimeType === 'application/vnd.google-apps.folder') {
                  nextIdx++;
                }
                if (nextIdx < existingFiles.length) setPreviewIndex(nextIdx);
              }}
              className="absolute right-4 p-4 text-white hover:bg-white/10 rounded-full z-[310] transition-colors"
            >
              <ChevronRight size={32} />
            </button>
          )}

          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-16">
            {existingFiles[previewIndex].mimeType?.includes('video/') ? (
              <CustomVideoPlayer src={existingFiles[previewIndex].id} />
            ) : (
              <img 
                src={`/api/drive/proxy?id=${existingFiles[previewIndex].id}&action=view`}
                alt={existingFiles[previewIndex].name}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/20"
              />
            )}
            <p className="text-white mt-4 font-mono text-sm opacity-50">{existingFiles[previewIndex].name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
