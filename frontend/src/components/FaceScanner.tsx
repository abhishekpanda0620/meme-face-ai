"use client";

import React, { useEffect, useRef } from "react";
import { useFaceTracker, EmotionState } from "@/hooks/useFaceTracker";

interface FaceScannerProps {
  onEmotionChange?: (emotion: EmotionState) => void;
}

export default function FaceScanner({ onEmotionChange }: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isReady, stableEmotion } = useFaceTracker(videoRef, canvasRef);

  useEffect(() => {
    if (onEmotionChange) {
      onEmotionChange(stableEmotion);
    }
  }, [stableEmotion, onEmotionChange]);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 bg-black/5 backdrop-blur-sm p-4">
      {/* Hidden Video element - MediaPipe requires a source HTMLVideoElement */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
      ></video>
      
      {/* Canvas container with an explicit aspect ratio and CSS horizontal flip for mirror effect */}
      <div className="relative w-full overflow-hidden rounded-lg bg-neutral-900 flex items-center justify-center min-h-[400px]">
        {/* Loading State */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-neutral-900/80 backdrop-blur-sm">
             <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="font-medium animate-pulse">Initializing Neural Engine...</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="w-full h-auto object-cover transform scale-x-[-1]"
        ></canvas>

        {/* Overlay Badges for premium UI look */}
        <div className="absolute top-4 left-4 flex gap-3">
          <div className={`flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full text-xs backdrop-blur-md border transition-all ${isReady ? 'bg-orange-500/80 border-orange-400' : 'bg-neutral-800/80 border-neutral-600'}`}>
            <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-white animate-pulse' : 'bg-neutral-400'}`}></span>
            {isReady ? 'Scanner Active' : 'Booting...'}
          </div>
        </div>
        
        
        {/* Emotion Display Badge (Testing) */}
        {isReady && (
          <div className="absolute bottom-4 right-4 flex gap-3">
            <div className="flex items-center gap-2 bg-neutral-900/90 text-white font-black px-6 py-3 rounded-xl text-sm border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              Mood: {stableEmotion}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
