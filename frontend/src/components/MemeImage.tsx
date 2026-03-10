"use client";

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { EmotionState } from "@/hooks/useFaceTracker";
import type { DesiMeme } from "@/types/meme";
import memesData from "@/data/memes.json";
import { fetchCaption } from "@/utils/api";

interface MemeImageProps {
  emotion: EmotionState;
  onCaptionChange?: (caption: string) => void;
}

/** Emoji map for each emotion — adds flair to the caption badge */
const EMOTION_EMOJI: Record<EmotionState, string> = {
  ANGRY: "😤",
  SHOCKED: "😱",
  JOY: "🎉",
  SAD: "😢",
  JUDGING: "🤨",
  NEUTRAL: "😐",
};

export default function MemeImage({ emotion, onCaptionChange }: MemeImageProps) {
  const [caption, setCaption] = useState<string>("");
  const [intent, setIntent] = useState<string>("");
  const [isVisible, setIsVisible] = useState(true);
  const prevEmotionRef = useRef<EmotionState>(emotion);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Select a random meme matching the current emotion
  const activeMeme = useMemo(() => {
    const matchingMemes = (memesData as DesiMeme[]).filter(
      (m) => m.triggerEmotion === emotion
    );
    if (matchingMemes.length === 0) return null;
    return matchingMemes[Math.floor(Math.random() * matchingMemes.length)];
  }, [emotion]);

  // Fetch caption from backend whenever emotion changes (debounced)
  const fetchCaptionForEmotion = useCallback(async (em: EmotionState) => {
    const result = await fetchCaption(em);
    if (result) {
      setCaption(result.caption);
      setIntent(result.intent);
      onCaptionChange?.(result.caption);
    } else {
      // Fallback: use the meme's built-in text
      const fallbackMeme = (memesData as DesiMeme[]).find(
        (m) => m.triggerEmotion === em
      );
      const fallbackText =  "";
      setCaption(fallbackText);
      setIntent("");
      onCaptionChange?.(fallbackText);
    }
  }, []);

  useEffect(() => {
    // Only trigger on actual emotion change
    if (emotion === prevEmotionRef.current && caption) return;
    prevEmotionRef.current = emotion;

    // Crossfade transition
    setIsVisible(false);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      fetchCaptionForEmotion(emotion);
      // Small delay to let the new meme load before fading in
      setTimeout(() => setIsVisible(true), 100);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [emotion, caption, fetchCaptionForEmotion]);

  if (!activeMeme) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-900 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 gap-4">
        <div className="text-5xl animate-pulse">🎭</div>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium text-center px-6">
          Make a face at the camera to see your{" "}
          <span className="text-orange-500 font-bold">Desi Meme</span> match!
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-black shadow-inner group transition-opacity duration-300 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background Meme Image */}
      <div className="absolute inset-0">
        <Image
          src={activeMeme.imageUrl}
          alt={activeMeme.id}
          fill
          className="object-cover"
          unoptimized
          priority
        />
      </div>

      {/* Gradient overlays for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

      {/* Top text: Caption */}
      {caption && (
        <div className="absolute top-0 left-0 right-0 p-5 flex justify-center animate-meme-slide-down">
          <p
            className="text-white text-xl sm:text-2xl lg:text-3xl font-black text-center leading-tight max-w-[90%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{
              WebkitTextStroke: "1px rgba(0,0,0,0.4)",
              textShadow:
                "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 0 #000, -2px 0 #000",
            }}
          >
            {EMOTION_EMOJI[emotion]} {caption}
          </p>
        </div>
      )}

      {/* Bottom: Source & Character Attribution */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-white/80 text-xs font-medium tracking-wide uppercase">
            {/* {activeMeme.source} */}
          </span>
          {intent && (
            <span className="text-orange-400 text-[10px] font-bold tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm w-fit">
              #{intent.replace(/_/g, " ")}
            </span>
          )}
        </div>
        <span className="text-white/60 text-[10px] font-mono">
          MemeFace AI
        </span>
      </div>
    </div>
  );
}
