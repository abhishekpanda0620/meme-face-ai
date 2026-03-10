import FaceScanner from "@/components/FaceScanner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 selection:bg-orange-500/30 font-sans transition-colors duration-300">
      
      {/* Minimal Header */}
      <header className="w-full py-6 px-4 sm:px-8 flex justify-between items-center bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
        <div className="flex items-baseline gap-2">
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

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Copy */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <h2 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tighter text-neutral-900 dark:text-white">
            Kaunsa <span className="text-orange-500">Meme</span><br/>
            Ho Tum?
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
            Turn your webcam on. We read your micro-expressions and instantly match your vibe to iconic Bollywood and Desi pop culture moments.
          </p>
          
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-lg shadow-neutral-900/20 dark:shadow-white/10">
              Start Scanning
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-neutral-950 border-2 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold rounded-lg hover:border-neutral-900 dark:hover:border-neutral-500 transition-all active:scale-[0.98]">
              Browse Templates
            </button>
          </div>
        </div>

        {/* Right Scanner View */}
        <div className="flex-1 w-full relative group">
          {/* Subtle drop shadow instead of glowing gradients */}
          <div className="absolute -inset-4 bg-orange-500/5 dark:bg-orange-500/10 rounded-3xl blur-2xl transition-all duration-500 group-hover:bg-orange-500/10 dark:group-hover:bg-orange-500/20"></div>
          <div className="relative rounded-2xl overflow-hidden border-4 border-neutral-900 dark:border-neutral-800 shadow-2xl bg-neutral-900 dark:bg-black">
            <FaceScanner />
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
