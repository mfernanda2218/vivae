import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBar } from './SearchBar';

export function Header() {
  return (
    <header className="w-full border-b border-surface-2 bg-surface">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Link href="/" className="text-xl font-black tracking-[0.18em] text-text">
          <span className="text-accent">V</span>IVAE
        </Link>
        <div className="flex flex-1 items-center gap-3 md:max-w-2xl">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/eventos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-text">
            Eventos
          </Link>
          <Link href="/meus-ingressos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-text">
            Meus ingressos
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-text">
            Dashboard
          </Link>
          <Link href="/login" className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-background transition-colors hover:bg-accent/90">
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
