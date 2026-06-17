"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, User, LogOut, Menu, X, LayoutDashboard, Users, Receipt, Settings, Mic } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/admin/notifications")
        .then(res => res.json())
        .then(data => {
          if (data.notifications) setNotifications(data.notifications);
        })
        .catch(console.error);
    }
  }, [session?.user]);

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

  const links = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Transactions", href: "/admin/transactions", icon: Receipt },
    { name: "Users", href: "/admin/users", icon: Users },
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
    <>
      <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowMobileMenu(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden md:block">
            <h2 className="text-xl font-semibold">Admin Portal</h2>
            <p className="text-sm text-muted-foreground">Manage users and transactions</p>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-foreground">
              VOGen<span className="text-primary">.ai</span>
            </span>
            <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md">Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 relative">
          <ThemeToggle />
          
          {/* Notifications Dropdown Container */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 relative text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && notifications[0].id !== "welcome-admin" && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
              )}
            </button>
            
            {/* Notifications Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-fade-in-up z-50">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold">Action Required</h3>
                  {notifications.length > 0 && notifications[0].id !== "welcome-admin" && (
                    <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-md">{notifications.length} Pending</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif, index) => (
                      <Link 
                        href="/admin/transactions"
                        onClick={() => setShowNotifications(false)}
                        key={notif.id || index} 
                        className={`block p-4 hover:bg-muted/50 transition-colors ${index !== notifications.length - 1 ? 'border-b border-border' : ''}`}
                      >
                        <p className="text-sm font-medium mb-1">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <p className="text-sm">No pending actions.</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border text-center">
                  <Link 
                    href="/admin/transactions"
                    className="text-sm font-medium text-red-500 hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all transactions
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Profile Dropdown Container */}
          <div className="relative" ref={profileRef}>
            <div 
              onClick={() => setShowProfile(!showProfile)}
              className="h-10 w-10 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-red-500 transition-colors"
            >
              <User className="w-5 h-5 text-red-500" />
            </div>

            {/* Profile Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-fade-in-up z-50">
                <div className="p-4 border-b border-border">
                  <p className="font-semibold">{isPending ? "Loading..." : session?.user?.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground truncate">{session?.user?.email || "admin@generator.com"}</p>
                </div>
                <div className="p-2 space-y-1">
                  <Link 
                    href="/dashboard" 
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-sm font-medium transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    Back to Generator
                  </Link>
                  <Link 
                    href="/admin/settings" 
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-sm font-medium transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    System Settings
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
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-2">
              <p className="text-sm text-red-500 font-medium mb-1">Admin Mode</p>
              <p className="text-xs text-muted-foreground">You have full access.</p>
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
              onClick={handleSignOut}
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
