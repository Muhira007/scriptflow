"use client";

import Link from "next/link";
import { Mic, Zap, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-primary to-secondary text-white p-2 rounded-xl group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all">
            <Mic className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <span className="font-extrabold text-lg md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            ScriptFlow
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors hidden sm:block">
            Masuk
          </Link>
          <Link
            href="/generator"
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary hover:to-primary text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(99,102,241,0.39)]"
          >
            <Zap className="w-3 h-3 md:w-4 md:h-4 fill-white/50" />
            <span className="hidden sm:inline">Mulai Buat Naskah</span>
            <span className="sm:hidden">Mulai</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
