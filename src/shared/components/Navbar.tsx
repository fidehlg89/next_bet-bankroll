"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, LayoutDashboard, ListTodo, LineChart, FileDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/registro", label: "Registro", icon: ListTodo },
  { href: "/analisis", label: "Análisis", icon: LineChart },
  { href: "/rendimiento", label: "Rendimiento", icon: TrendingUp },
  { href: "/importar", label: "Importar", icon: FileDown },
];

export function Navbar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-display font-semibold transition-opacity hover:opacity-80">
            <span className="grid h-7 w-7 place-items-center rounded bg-primary text-primary-foreground">
              <TrendingUp className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline-block">Bankroll<span className="text-primary">OS</span></span>
          </Link>
          <div className="hidden gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline-block">Salir</span>
        </button>
      </div>

      {/* Mobile nav (bottom) */}
      <div className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-border bg-background/80 px-2 pb-safe backdrop-blur-xl md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg p-2 text-[10px] font-medium transition-colors",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", pathname === item.href && "fill-primary/20")} />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}