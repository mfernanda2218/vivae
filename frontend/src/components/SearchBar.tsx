"use client";

import { Search } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");

  const updateSearch = useCallback(
    (nextValue: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextValue.trim()) {
        params.set("search", nextValue.trim());
      } else {
        params.delete("search");
      }

      const targetPath = pathname === "/" ? "/" : "/eventos";
      const query = params.toString();
      router.replace(query ? `${targetPath}?${query}` : targetPath);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      updateSearch(value);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [updateSearch, value]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSearch(value);
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full">
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
