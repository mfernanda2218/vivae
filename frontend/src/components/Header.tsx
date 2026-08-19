import Link from 'next/link';

export function Header() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-zinc-900 tracking-tight">
          Vivae
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Dashboard
          </Link>
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
