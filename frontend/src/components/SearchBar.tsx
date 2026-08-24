// components/SearchBar.tsx
"use client";

import { Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Navegar para /eventos com o termo
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());

    router.push(`/eventos?${params.toString()}`);
    router.refresh();
  }

  // Sincronizar quando o usuário navega
  useEffect(() => {
    setValue(searchParams.get("search") || "");
  }, [searchParams]);

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar eventos"
        className="h-10 w-full rounded-md border border-surface-2 bg-background pl-10 pr-3 text-sm text-text outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
      />
    </form>
  );
}