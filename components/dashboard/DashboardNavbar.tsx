"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePathname, useRouter } from "next/navigation";
import { Bell, User, Settings, LogOut, CreditCard, Menu, X, LayoutDashboard, Zap, Mic } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

export default function DashboardNavbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/notifications")
        .then(res => res.json())
        .then(data => {
          if (data.notifications) setNotifications(data.notifications);
        })
        .catch(console.error);
    }
  }, [session?.user]);

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Generator", href: "/generator", icon: Zap },
    { name: "Top Up Credits", href: "/topup", icon: CreditCard },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  if ((session?.user as any)?.role === "admin") {
    links.splice(links.length - 1, 0, { name: "Admin Panel", href: "/admin", icon: Settings });
  }
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="h-20 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setShowMobileMenu(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:block animate-fade-in-up">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Creator!</span> 👋
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">Ready to generate your next viral video?</p>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Mic className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            VOGen<span className="text-primary">.ai</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 relative">
        
        <ThemeToggle />

        {/* Notifications Dropdown Container */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 relative text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-6 h-6" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
            )}
          </button>
          
          {/* Notifications Dropdown Menu */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-fade-in-up z-50">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <div key={notif.id || index} className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${index !== notifications.length - 1 ? 'border-b border-border' : ''}`}>
                      <p className="text-sm font-medium mb-1">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm">Belum ada notifikasi.</p>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-border text-center">
                <button 
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => setShowNotifications(false)}
                >
                  Tandai semua dibaca
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Dropdown Container */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfile(!showProfile)}
            className="h-10 w-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
          >
            <User className="w-5 h-5 text-primary" />
          </div>

          {/* Profile Dropdown Menu */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-fade-in-up z-50">
              <div className="p-4 border-b border-border">
                <p className="font-semibold">{isPending ? "Loading..." : session?.user?.name || "Creator Name"}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email || "creator@example.com"}</p>
              </div>
              <div className="p-2 space-y-1">
                <Link 
                  href="/profile" 
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-sm font-medium transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  My Profile
                </Link>
                <Link 
                  href="/topup" 
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-sm font-medium transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  Billing & Top Up
                </Link>
                <Link 
                  href="/settings" 
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-sm font-medium transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Settings
                </Link>
              </div>
              <div className="p-2 border-t border-border">
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-sm font-medium text-muted-foreground transition-colors"
                  onClick={async () => {
                    setShowProfile(false);
                    await signOut();
                    router.push("/login");
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-background md:hidden animate-fade-in flex flex-col">
          <div className="h-20 border-b border-border flex items-center justify-between px-4 shrink-0">
            <Link href="/" className="flex items-center gap-2 group" onClick={() => setShowMobileMenu(false)}>
              <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-foreground">
                VOGen<span className="text-primary">.ai</span>
              </span>
            </Link>
            <button 
              className="p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowMobileMenu(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-4 shrink-0">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-2">
              <p className="text-sm text-muted-foreground mb-1">Available Credits</p>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{isPending ? "..." : session?.user?.credits || 0}</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setShowMobileMenu(false)}
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
          
          <div className="p-4 mt-auto border-t border-border shrink-0">
            <button 
              onClick={async () => {
                setShowMobileMenu(false);
                await signOut();
                router.push("/login");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
