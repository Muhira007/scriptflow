"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32 relative bg-background overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-secondary/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 tracking-tight text-foreground"
          >
            Investasi Kecil, <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-orange-400">Komisi Maksimal</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground font-medium px-2"
          >
            Tanpa biaya bulanan tersembunyi. Bayar sesuai kebutuhan (Pay-As-You-Go).
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-2 sm:px-4 md:px-0">
          {/* Starter Package */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring" }}
            className="bg-card border border-border rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
          >
            <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Paket Pemula</h3>
            <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-6 font-medium">Cocok untuk mencoba kehebatan AI</p>
            <div className="mb-6 md:mb-8">
              <span className="text-3xl md:text-4xl font-extrabold tracking-tight">Rp 25.000</span>
            </div>
            
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-xs md:text-sm font-medium">
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <span className="text-foreground"><strong>50 Kredit</strong></span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <span className="text-muted-foreground">Masa Aktif 30 Hari</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <span className="text-muted-foreground">URL Auto-Scraping</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <span className="text-muted-foreground">Format Hard-Selling</span>
              </li>
            </ul>
            
            <button className="w-full py-3 md:py-4 rounded-full font-bold border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all active:scale-95 text-sm md:text-base">
              Pilih Pemula
            </button>
          </motion.div>

          {/* Pro Package */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-gradient-to-br from-primary to-secondary text-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 relative md:scale-110 shadow-xl md:shadow-2xl shadow-primary/30 z-10 border border-white/10"
          >
            <div className="absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-extrabold tracking-widest uppercase shadow-lg shadow-orange-500/30">
              Paling Laris
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 mt-2">Paket Kreator</h3>
            <p className="text-white/80 text-xs md:text-sm mb-4 md:mb-6 font-medium">Bagi affiliator yang serius gajian</p>
            <div className="mb-6 md:mb-8">
              <span className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">Rp 100.000</span>
            </div>
            
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-xs md:text-sm font-medium">
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white drop-shadow" />
                <span className="text-white drop-shadow-sm"><strong>250 Kredit (Bonus 50)</strong></span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
                <span className="text-white/90">Masa Aktif 30 Hari</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
                <span className="text-white/90">URL Auto-Scraping</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
                <span className="text-white/90">Format Storytelling & B-Roll</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
                <span className="text-white/90">Prioritas Server</span>
              </li>
            </ul>
            
            <button className="w-full py-3 md:py-4 rounded-full font-bold bg-white text-primary hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all active:scale-95 text-sm md:text-base">
              Pilih Kreator
            </button>
          </motion.div>

          {/* Agency Package */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring" }}
            className="bg-card border border-border rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 flex flex-col transition-all hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/5"
          >
            <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Paket Agensi</h3>
            <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-6 font-medium">Untuk ternak akun & tim</p>
            <div className="mb-6 md:mb-8">
              <span className="text-3xl md:text-4xl font-extrabold tracking-tight">Rp 250.000</span>
            </div>
            
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-xs md:text-sm font-medium">
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                <span className="text-foreground"><strong>1000 Kredit</strong></span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                <span className="text-muted-foreground">Masa Aktif 30 Hari</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                <span className="text-muted-foreground">Prioritas Utama API</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                <span className="text-muted-foreground">Support Eksklusif</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                <span className="text-muted-foreground">Harga Termurah</span>
              </li>
            </ul>
            
            <button className="w-full py-3 md:py-4 rounded-full font-bold border-2 border-secondary/20 text-secondary hover:bg-secondary/5 transition-all active:scale-95 text-sm md:text-base mt-auto">
              Pilih Agensi
            </button>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-20 text-center text-xs md:text-sm font-medium text-muted-foreground bg-muted/50 py-3 md:py-4 rounded-xl md:rounded-2xl max-w-2xl mx-auto px-4"
        >
          <p>Menerima pembayaran melalui QRIS, GoPay, OVO, ShopeePay, dan Transfer Bank.</p>
        </motion.div>
      </div>
    </section>
  );
}
