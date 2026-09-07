"use client";

import { useRef } from "react";

interface CustomVideoPlayerProps {
  src: string;
}

export default function CustomVideoPlayer({ src }: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-4xl mx-auto" onClick={(e) => e.stopPropagation()}>
      
      {/* Vùng chứa video */}
      <div 
        ref={containerRef}
        className="relative flex items-center justify-center bg-black/50 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 w-full"
        style={{ 
          height: '75vh', // Cố định chiều cao vùng chứa
        }}
      >
        <iframe
          src={`https://drive.google.com/file/d/${src}/preview`}
          allow="autoplay; fullscreen"
          className="w-full h-full border-0"
        />
      </div>

      {/* Thanh điều khiển ngang */}
      <div className="w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl mt-4 p-3 flex justify-between items-center shadow-2xl">
         <p className="text-zinc-400 text-sm px-2 flex-1 text-center font-medium">
            Đang phát mượt mà qua máy chủ tối ưu của Google Drive 🚀
         </p>
      </div>

    </div>
  );
}
