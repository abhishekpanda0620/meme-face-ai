"use client";

import React, { useCallback, useRef, useState } from "react";
import type { EmotionState } from "@/hooks/useFaceTracker";
import type { DesiMeme } from "@/types/meme";
import memesData from "@/data/memes.json";

interface SnapShareButtonProps {
  emotion: EmotionState;
  caption: string;
}

/**
 * SnapShareButton: Captures the current meme + caption as a
 * composite PNG image and provides download / share functionality.
 */
export default function SnapShareButton({
  emotion,
  caption,
}: SnapShareButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSnap = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Find the meme template for the current emotion
      const matchingMemes = (memesData as DesiMeme[]).filter(
        (m) => m.triggerEmotion === emotion
      );
      const meme = matchingMemes.length > 0 ? matchingMemes[0] : null;

      if (!meme) {
        setIsGenerating(false);
        return;
      }

      // Create offscreen canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const WIDTH = 1080;
      const HEIGHT = 1080;
      canvas.width = WIDTH;
      canvas.height = HEIGHT;

      // Load the meme image
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = meme.imageUrl;
      });

      // Draw meme image (cover the canvas)
      const scale = Math.max(WIDTH / img.width, HEIGHT / img.height);
      const x = (WIDTH - img.width * scale) / 2;
      const y = (HEIGHT - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Semi-transparent gradient overlays
      const topGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT * 0.35);
      topGrad.addColorStop(0, "rgba(0,0,0,0.6)");
      topGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT * 0.35);

      const bottomGrad = ctx.createLinearGradient(
        0,
        HEIGHT * 0.65,
        0,
        HEIGHT
      );
      bottomGrad.addColorStop(0, "rgba(0,0,0,0)");
      bottomGrad.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, HEIGHT * 0.65, WIDTH, HEIGHT * 0.35);

      // Draw caption text (top, meme-style)
      const displayCaption = caption || 
      '';
      if (displayCaption) {
        ctx.save();
        ctx.font = "bold 48px 'Arial', sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";

        // Word wrap
        const maxWidth = WIDTH - 80;
        const words = displayCaption.split(" ");
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + " " + words[i];
          if (ctx.measureText(testLine).width > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        const lineHeight = 60;
        const startY = 80;
        for (let i = 0; i < lines.length; i++) {
          const lineY = startY + i * lineHeight;
          ctx.strokeText(lines[i], WIDTH / 2, lineY);
          ctx.fillText(lines[i], WIDTH / 2, lineY);
        }
        ctx.restore();
      }

      // Watermark
      ctx.save();
      ctx.font = "bold 20px 'Arial', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.textAlign = "right";
      ctx.fillText("MemeFace AI • Desi Edition", WIDTH - 30, HEIGHT - 25);
      ctx.restore();

      // Source attribution
      ctx.save();
      ctx.font = "16px 'Arial', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.textAlign = "left";
      ctx.fillText(`📽 ${meme.source}`, 30, HEIGHT - 25);
      ctx.restore();

      // Trigger download
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `memeface-${emotion.toLowerCase()}-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2500);
        },
        "image/png",
        1.0
      );
    } catch (error) {
      console.error("Snap failed:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [emotion, caption]);

  const handleShare = useCallback(async () => {
    if (!navigator.share) {
      // Fallback: just trigger download
      handleSnap();
      return;
    }

    // For Web Share API, we need a blob
    setIsGenerating(true);
    try {
      // Reuse snap logic but share instead of download
      handleSnap();
    } finally {
      setIsGenerating(false);
    }
  }, [handleSnap]);

  return (
    <div className="flex items-center gap-3 mt-4">
      {/* Snap & Download Button */}
      <button
        onClick={handleSnap}
        disabled={isGenerating || emotion === "NEUTRAL"}
        className="
          group relative flex items-center gap-2 px-6 py-3 
          bg-orange-500 hover:bg-orange-600 
          disabled:bg-neutral-400 dark:disabled:bg-neutral-700
          text-white font-bold text-sm rounded-xl 
          transition-all duration-200 ease-out
          hover:scale-[1.02] active:scale-[0.98]
          shadow-lg hover:shadow-orange-500/30
          disabled:cursor-not-allowed disabled:hover:scale-100
        "
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating...
          </>
        ) : showSuccess ? (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Saved!
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Snap & Save
          </>
        )}
        
        {/* Glow effect on hover */}
        <span className="absolute inset-0 rounded-xl bg-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
      </button>

      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
