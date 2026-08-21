import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBar } from './SearchBar';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-2 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0 text-xl font-black tracking-[0.18em] text-text">
            <span className="text-accent">V</span>IVAE
          </Link>
          <nav className="flex items-center gap-2 overflow-x-auto text-nowrap sm:gap-4">
            <Link href="/eventos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-text">
              Eventos
            </Link>
            <Link href="/meus-ingressos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-text">
              Meus ingressos
            </Link>
            <Link href="/portaria" className="text-sm font-medium text-muted-foreground transition-colors hover:text-text">
              Portaria
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-text">
              Dashboard
            </Link>
            <Link href="/login" className="rounded-md bg-accent px-3 py-2 text-sm font-bold text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 sm:px-4">
              Entrar
            </Link>
          </nav>
        </div>
        <div className="flex w-full items-center gap-3 md:max-w-2xl">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
