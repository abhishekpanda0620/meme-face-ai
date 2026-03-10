import React, { useMemo } from 'react';
import Image from 'next/image';
import type { EmotionState } from '@/hooks/useFaceTracker';
import type { DesiMeme } from '@/types/meme';
import memesData from '@/data/memes.json';

interface MemeImageProps {
  emotion: EmotionState;
}

export default function MemeImage({ emotion }: MemeImageProps) {
  const activeMeme = useMemo(() => {
    const matchingMemes = (memesData as DesiMeme[]).filter(
      (m) => m.triggerEmotion === emotion
    );
    if (matchingMemes.length === 0) return null;
    return matchingMemes[Math.floor(Math.random() * matchingMemes.length)];
  }, [emotion]);

  if (!activeMeme) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700">
        <p className="text-neutral-500 font-medium">Looking for a face...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-black shadow-inner group">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image 
          src={`${activeMeme.imageUrl}?v=${Date.now()}`}
          alt={activeMeme.id} 
          fill
          className="object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
          unoptimized // Disable next/image optimization for immediate rendering in dev
        />
        {/* Subtle shadow overlay to make the source tag readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
          
        </div>
      </div>
    </div>
  );
}
