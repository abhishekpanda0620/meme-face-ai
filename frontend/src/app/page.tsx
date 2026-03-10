"use client";

import { useState } from "react";
import FaceScanner from "@/components/FaceScanner";
import MemeImage from "@/components/MemeImage";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { EmotionState } from "@/hooks/useFaceTracker";
import Image from "next/image";

export default function Home() {
  const [activeEmotion, setActiveEmotion] = useState<EmotionState>("NEUTRAL");
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 selection:bg-orange-500/30 font-sans transition-colors duration-300">
      
      {/* Minimal Header */}
      <header className="w-full py-6 px-4 sm:px-8 flex justify-between items-center bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="MemeFace Logo" width={32} height={32} className="rounded-lg shadow-sm" />
          <h1 className="text-2xl font-black tracking-tighter text-neutral-900 dark:text-white">
            MEMEFACE
          </h1>
          <span className="text-xs font-bold px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-sm uppercase tracking-widest">
            Desi Edition
          </span>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium text-neutral-500 dark:text-neutral-400">
           <a href="#" className="hidden sm:block hover:text-neutral-900 dark:hover:text-white transition-colors">Vault</a>
           <a href="#" className="hidden sm:block hover:text-neutral-900 dark:hover:text-white transition-colors">How it works</a>
           <ThemeToggle />
        </div>
      </header>

      {/* Split Screen Application View */}
      <section className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-black leading-[1.05] tracking-tighter text-neutral-900 dark:text-white">
            Kaunsa <span className="text-orange-500">Meme</span> Ho Tum?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
            Make a face at the camera (frown, smile, open mouth wide). Our neural engine will match your micro-expression to iconic Desi meme templates instantly.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left: The Scanner */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                1. Your Face
              </h3>
            </div>
            <div className="relative rounded-2xl overflow-hidden border-4 border-neutral-200 dark:border-neutral-800 shadow-2xl bg-neutral-100 dark:bg-black group">
               <div className="absolute -inset-4 bg-orange-500/5 dark:bg-orange-500/10 rounded-3xl blur-2xl transition-all duration-500 group-hover:bg-orange-500/10 dark:group-hover:bg-orange-500/20"></div>
               <FaceScanner onEmotionChange={setActiveEmotion} />
            </div>
          </div>

          {/* Right: The Output */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                2. Your Desi Vibe
              </h3>
              <span className="px-3 py-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xs font-bold font-mono">
                {activeEmotion}
              </span>
            </div>
            
            <div className="relative h-full min-h-[400px] w-full rounded-2xl overflow-hidden border-4 border-neutral-200 dark:border-neutral-800 shadow-2xl bg-neutral-100 dark:bg-neutral-900">
               <MemeImage emotion={activeEmotion} />
            </div>
          </div>

        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full py-8 border-t border-neutral-200 dark:border-neutral-800 mt-auto text-center text-sm font-medium text-neutral-400 dark:text-neutral-500 transition-colors duration-300">
        Privacy First • Runs 100% in your browser
      </footer>

    </main>
  );
}
