import Link from "next/link";
import { Mic, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Mic className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            VOGen<span className="text-primary">.ai</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link
            href="/generator"
            className="flex items-center gap-2 bg-primary hover:bg-accent text-primary-foreground px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            <Zap className="w-4 h-4" />
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
