"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mic, LayoutDashboard, Zap, CreditCard, Settings, LogOut, User } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Generator", href: "/generator", icon: Zap },
    { name: "Top Up Credits", href: "/topup", icon: CreditCard },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Cast session.user to any to access role, since better-auth types might not strictly infer it in client yet
  if ((session?.user as any)?.role === "admin") {
    // Add Admin Panel before Settings
    links.splice(links.length - 1, 0, { name: "Admin Panel", href: "/admin", icon: Settings });
    // Wait, let's use ShieldAlert for admin if we can import it. But I didn't import it in Sidebar yet.
    // I'll just push it to the end or replace Settings icon.
  }

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-card/50 backdrop-blur-xl flex-col h-full">
      <div className="h-20 flex items-center px-6 border-b border-border/50 shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-primary to-blue-600 p-2.5 rounded-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all group-hover:scale-105">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-foreground flex items-center">
            VOGen<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">.ai</span>
          </span>
        </Link>
      </div>

      <div className="px-4 mb-4 mt-6">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Available Credits</p>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold">
              {isPending ? "..." : session?.user?.credits || 0}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button 
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
