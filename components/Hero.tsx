import Link from "next/link";
import { Sparkles, ArrowRight, PlayCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 animate-pulse-slow pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Script & Voiceover Generator</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground leading-tight">
          Turn Product URLs into <br className="hidden md:block" />
          Viral TikTok Videos.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop struggling with scripts. Just paste a product link and let our AI generate a highly-engaging script and voiceover in seconds. Ready for your next viral hit?
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/generator" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-accent text-primary-foreground px-8 py-4 rounded-full text-lg font-medium transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
          >
            Start Generating Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-8 py-4 rounded-full text-lg font-medium transition-all border border-border hover:border-muted-foreground/50">
            <PlayCircle className="w-5 h-5" />
            Watch Demo
          </button>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-4">Trusted by 10,000+ content creators</p>
          <div className="flex -space-x-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                {/* Fallback avatar using UI colors */}
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
