import { useRef, useState } from 'react';

/* =========================================
   Video Player — HTML5 video with
   custom overlay controls
   ========================================= */

interface VideoPlayerProps {
  src: string;
  title?: string;
}

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setShowOverlay(false);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowOverlay(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowOverlay(true);
  };

  return (
    <div className="video-player group relative cursor-pointer" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        onEnded={handleEnded}
        onPause={() => { setIsPlaying(false); setShowOverlay(true); }}
        onPlay={() => { setIsPlaying(true); setShowOverlay(false); }}
        preload="metadata"
        className="aspect-video w-full object-cover"
      />

      {/* Play/Pause overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          showOverlay || !isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        style={{ background: isPlaying ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.45)' }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110"
          style={{
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          {isPlaying ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--color-brand-600)">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--color-brand-600)">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          )}
        </div>
      </div>

      {/* Title bar */}
      {title && !isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-sm font-semibold text-white">{title}</p>
        </div>
      )}
    </div>
  );
}
