"use client";

import { useEffect, useRef } from "react";

interface VideoBackgroundProps {
  videoSrc: string;
  posterSrc: string;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoSrc,
  posterSrc,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onerror = () => {
        console.error("動画の読み込みに失敗しました。");
        // Optionally, set a background image on the container as a fallback
        const container = document.getElementById("video-background-container");
        if (container) {
          container.style.backgroundImage = `url(${posterSrc})`; // Or a generic placeholder
          container.innerHTML = ""; // Remove video tag
        }
      };
    }
  }, [posterSrc]);

  return (
    <div
      id="video-background-container"
      className="fixed top-0 left-0 w-full h-full overflow-hidden z-[-1] transition-opacity duration-500 ease-in-out"
    >
      <video
        ref={videoRef}
        id="background-video"
        autoPlay
        loop
        muted
        playsInline
        poster={posterSrc}
        className="w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
        お使いのブラウザは動画タグをサポートしていません。
      </video>
    </div>
  );
};

export default VideoBackground;
