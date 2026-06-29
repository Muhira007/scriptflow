"use client";

import { Link2, Bot, Volume2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Link2 className="w-5 h-5 md:w-6 md:h-6 text-white" />,
    title: "1-Klik Auto-Scraping",
    description: "Cukup tempel link Shopee/TikTok, sistem kami yang akan mengekstrak detail produknya secara otomatis.",
    className: "md:col-span-2 bg-gradient-to-br from-primary to-indigo-700 text-white shadow-lg shadow-indigo-500/20",
    iconBg: "bg-white/20",
  },
  {
    icon: <Bot className="w-5 h-5 md:w-6 md:h-6 text-secondary" />,
    title: "Copywriting Anti-Skip",
    description: "Formula Hook 3-detik yang menghentikan scroll penonton, dirancang khusus untuk FYP.",
    className: "md:col-span-1 bg-card border border-secondary/20 shadow-xl shadow-pink-500/10",
    iconBg: "bg-secondary/10",
  },
  {
    icon: <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" />,
    title: "Multi-Angle Promosi",
    description: "Dapatkan naskah versi Hard-Selling atau Storytelling yang mengalir halus.",
    className: "md:col-span-1 bg-gradient-to-br from-secondary to-orange-400 text-white shadow-lg shadow-orange-500/20",
    iconBg: "bg-white/20",
  },
  {
    icon: <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />,
    title: "Panduan Visual B-Roll",
    description: "AI memberikan arahan visual adegan mana yang harus direkam agar video makin relevan dan profesional.",
    className: "md:col-span-2 bg-card border border-primary/20 shadow-xl shadow-indigo-500/10",
    iconBg: "bg-primary/10",
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: "spring" } }
};

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-32 relative bg-background overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 tracking-tight text-foreground"
          >
            Senjata Rahasia <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Top Affiliator</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground font-medium px-2"
          >
            Bukan sekadar AI biasa. Ini adalah mesin konversi yang dirancang khusus untuk kreator konten pendek.
          </motion.p>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div 
              variants={itemVariants}
              key={index} 
              className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] transition-all hover:scale-[1.02] md:hover:scale-[1.03] hover:-translate-y-1 md:hover:-translate-y-2 relative overflow-hidden ${feature.className}`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-sm ${feature.iconBg}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 tracking-tight relative z-10">{feature.title}</h3>
              <p className={`leading-relaxed text-sm md:text-base font-medium relative z-10 ${feature.className.includes("text-white") ? "text-white/90" : "text-muted-foreground"}`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
