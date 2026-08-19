"use client";

import { useRouter, useSearchParams } from "next/navigation";

const categories = ["Todos", "Shows", "Festivais", "Teatro", "Esportes", "Infantil"];

export function Categories({ activeCategory }: { activeCategory?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function selectCategory(category: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "Todos") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    const query = params.toString();
    router.push(query ? `?${query}` : "?");
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive =
          category === "Todos" ? !activeCategory : activeCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => selectCategory(category)}
            className={`h-10 rounded-md border px-4 text-sm font-semibold transition-colors ${
              isActive
                ? "border-accent bg-accent text-background"
                : "border-surface-2 bg-surface text-muted-foreground hover:border-accent hover:text-text"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
