import Link from "next/link";
import { Mic } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 pt-16 md:pt-20 pb-8 md:pb-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4 md:mb-6 inline-flex">
              <div className="bg-gradient-to-br from-primary to-secondary text-white p-2 rounded-xl group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all">
                <Mic className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className="font-extrabold text-lg md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                ScriptFlow
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm font-medium leading-relaxed text-sm">
              Senjata rahasia kreator konten untuk mengubah tautan produk apapun menjadi naskah video viral dalam hitungan detik menggunakan AI.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 md:mb-6 text-foreground">Produk</h4>
            <ul className="space-y-3 md:space-y-4">
              <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Fitur</Link></li>
              <li><Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Harga</Link></li>
              <li><Link href="/generator" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Generator</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 md:mb-6 text-foreground">Legal</h4>
            <ul className="space-y-3 md:space-y-4">
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Syarat & Ketentuan</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Kebijakan Privasi</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Hubungi Kami</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 md:pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ScriptFlow. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-secondary transition-colors">Instagram</Link>
            <Link href="#" className="hover:text-primary transition-colors">TikTok</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
