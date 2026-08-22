// components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { SearchBar } from "./SearchBar";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vivae_token");
    const userData = localStorage.getItem("vivae_user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(parsedUser);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    // Limpar localStorage
    localStorage.removeItem("vivae_token");
    localStorage.removeItem("vivae_user");

    // Limpar cookies
    document.cookie = "vivae_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "vivae_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    setIsAuthenticated(false);
    setUser(null);
    router.push("/");
    router.refresh();
  };

  // Links baseados no role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { href: "/eventos", label: "Eventos" },
      ];
    }

    const links = [{ href: "/eventos", label: "Eventos" }];

    if (user?.role === "CUSTOMER") {
      links.push({ href: "/meus-ingressos", label: "Meus ingressos" });
    }

    if (user?.role === "ORGANIZER") {
      links.push({ href: "/dashboard", label: "Dashboard" });
    }

    if (user?.role === "GATE") {
      links.push({ href: "/portaria", label: "Portaria" });
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-2 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0 text-xl font-black tracking-[0.18em] text-text">
            <span className="text-accent">V</span>IVAE
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 overflow-x-auto text-nowrap sm:gap-4 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-text ${pathname === link.href ? "text-accent" : "text-muted-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 border-l border-surface-2 pl-4">
                <span className="text-sm text-muted-foreground">
                  <strong className="text-text">{user.name}</strong>
                  <span className="ml-1 rounded bg-surface-2 px-1.5 py-0.5 text-xs uppercase">
                    {user.role}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 rounded-md border border-surface-2 px-2 py-1.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-surface-2 hover:text-text"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-accent px-3 py-2 text-sm font-bold text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 sm:px-4"
              >
                Entrar
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-surface-2 text-text md:hidden"
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="flex flex-col gap-2 border-t border-surface-2 pt-3 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === link.href ? "bg-surface-2 text-accent" : "text-muted-foreground hover:bg-surface-2"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && user ? (
              <div className="border-t border-surface-2 pt-2">
                <div className="px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Logado como </span>
                  <strong className="text-text">{user.name}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-muted-foreground hover:bg-surface-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center rounded-md bg-accent px-3 py-2 text-sm font-bold text-background"
              >
                Entrar
              </Link>
            )}
          </nav>
        )}

        {/* Search Bar */}
        <div className="flex w-full items-center gap-3 md:max-w-2xl">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </header>
  );
}