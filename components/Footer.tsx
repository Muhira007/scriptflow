import Link from "next/link";
import { Mic } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/20 border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Mic className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                VOGen<span className="text-primary">.ai</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              The ultimate AI tool for content creators. Turn any product page into a viral script and voiceover in seconds.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/generator" className="text-muted-foreground hover:text-foreground transition-colors">Generator</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} VOGen.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
