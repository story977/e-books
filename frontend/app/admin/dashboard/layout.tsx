"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAdminToken, clearAdminToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/dashboard/books", icon: Package, label: "Books" },
  { href: "/admin/dashboard/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/dashboard/messages", icon: MessageSquare, label: "Messages" },
];

function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null;
  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAdminToken();
    toast.success("Logged out");
    router.push("/admin/login");
  };

  return (
    <AdminGuard>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-border">
              <Image
                src="/logo.png"
                alt="eBook Store Logo"
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-sm text-gradient">eBook Store</div>
              <div className="text-xs text-muted-foreground">Admin Panel</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          <Separator />
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
              id="admin-logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="h-16 border-b border-border flex items-center px-6 gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              id="admin-menu-toggle"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-lg">
                {navItems.find(
                  (i) => pathname === i.href || pathname.startsWith(i.href + "/")
                )?.label || "Dashboard"}
              </h1>
            </div>
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm" className="rounded-lg text-xs">
                View Store ↗
              </Button>
            </Link>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
