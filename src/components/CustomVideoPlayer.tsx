"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCw } from "lucide-react";

interface CustomVideoPlayerProps {
  src: string;
}

export default function CustomVideoPlayer({ src }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  const isRotated = rotation === 90 || rotation === 270;

  useEffect(() => {
    if (isRotated && containerRef.current) {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      // Khi xoay 90 độ, chiều rộng và chiều cao bị đảo ngược.
      // Tính tỷ lệ thu nhỏ để phần bị tràn có thể chui vừa vào vùng chứa
      const scaleFactor = Math.min(w / h, h / w, 1);
      setScale(scaleFactor);
    } else {
      setScale(1);
    }
  }, [rotation, isRotated]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const seekTo = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = (seekTo / 100) * duration;
      setProgress(seekTo);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      }
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const rotateVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation(prev => (prev + 90) % 360);
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-4xl mx-auto" onClick={(e) => e.stopPropagation()}>
      
      {/* Nút xoay tách biệt nằm trên cùng */}
      <button
        onClick={rotateVideo}
        className="absolute -top-16 z-50 p-3 text-white hover:text-purple-400 bg-white/10 border border-white/20 rounded-full transition-all hover:bg-white/20 active:scale-90 backdrop-blur-md shadow-2xl flex items-center justify-center"
        title="Xoay video"
      >
        <RotateCw size={24} />
      </button>

      {/* Vùng chứa video */}
      <div 
        ref={containerRef}
        className="relative flex items-center justify-center bg-black/50 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 w-full"
        style={{ 
          height: '75vh', // Cố định chiều cao vùng chứa
        }}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="transition-transform duration-300 w-full h-full"
          style={{ 
            transform: `rotate(${rotation}deg) scale(${scale})`,
            objectFit: 'contain',
          }}
        />
        
        {/* Nút Play to bự ở giữa khi pause */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-black/50 rounded-full p-4 backdrop-blur-md border border-white/10 shadow-2xl">
              <Play size={48} className="text-white ml-2 opacity-90" fill="currentColor" />
            </div>
          </div>
        )}
      </div>

      {/* Thanh điều khiển ngang */}
      <div className="w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl mt-4 p-3 sm:p-4 flex flex-col gap-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400 w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
          <span className="text-xs font-mono text-zinc-400 w-10">{formatTime(duration)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <button onClick={togglePlay} className="p-2 text-white hover:text-purple-400 transition-colors">
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="p-2 text-white hover:text-purple-400 transition-colors">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button onClick={toggleFullscreen} className="p-2 text-white hover:text-purple-400 transition-colors">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
