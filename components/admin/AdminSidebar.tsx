"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mic, LayoutDashboard, Users, Receipt, Settings, LogOut, Package, Database } from "lucide-react";
import { signOut } from "@/lib/auth-client";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Transactions", href: "/admin/transactions", icon: Receipt },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Top-Up Packages", href: "/admin/packages", icon: Package },
    { name: "Riwayat Generate", href: "/admin/generations", icon: Database },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-card/50 backdrop-blur-xl flex-col h-full">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Mic className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-foreground">
            VOGen<span className="text-primary">.ai</span>
          </span>
          <span className="ml-2 text-xs font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-1 rounded-md">Admin</span>
        </Link>
      </div>

      <div className="px-4 mb-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-sm text-red-500 font-medium mb-1">Admin Mode</p>
          <p className="text-xs text-muted-foreground">You have full access.</p>
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
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
