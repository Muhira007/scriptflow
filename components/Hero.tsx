"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-28 pb-16 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
      {/* Vibrant Mesh Gradient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-secondary/20 to-background/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-secondary/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-primary/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none -z-10 animate-pulse-slow" style={{ animationDelay: "2s" }} />
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border border-primary/30 text-primary shadow-[0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-md text-xs md:text-sm font-bold mb-6 md:mb-8"
        >
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-secondary" />
          <span>SaaS AI Naskah & Voiceover #1</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 leading-[1.2] md:leading-[1.1] max-w-4xl mx-auto"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-orange-400">
            Ubah Link Produk
          </span>
          <br />
          <span className="text-foreground">
            Jadi Naskah FYP.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed font-medium px-2"
        >
          Berhenti membuang waktu memikirkan ide. Biarkan AI kami yang mengekstrak detail produk dan meracik hook mematikan dalam hitungan detik!
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full sm:w-auto px-4 sm:px-0"
        >
          <Link 
            href="/generator" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-full text-sm md:text-base font-bold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] active:scale-95 border border-white/20"
          >
            Mulai Buat Naskah
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
          
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card/80 backdrop-blur-md hover:bg-card text-foreground px-6 md:px-8 py-3.5 md:py-4 rounded-full text-sm md:text-base font-bold transition-all border border-border hover:border-primary/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] active:scale-95">
            <PlayCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            Lihat Demo
          </button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 md:mt-20 pt-8 border-t border-border/50 flex flex-col items-center w-full px-4"
        >
          <p className="text-xs md:text-sm text-muted-foreground mb-4 font-semibold">Dipercaya oleh ribuan *affiliator* Shopee & TikTok</p>
          <div className="flex -space-x-2 md:-space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 md:border-4 border-background bg-muted flex items-center justify-center overflow-hidden shadow-lg z-10 hover:z-20 hover:scale-110 transition-transform">
                <div className={`w-full h-full bg-gradient-to-br ${i % 2 === 0 ? 'from-primary to-secondary' : 'from-secondary to-orange-400'} opacity-80`} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
