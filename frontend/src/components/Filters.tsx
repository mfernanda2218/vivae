"use client";

import { FormEvent, useState } from "react";
import { SlidersHorizontal, Search, ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Categories } from "./Categories";

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "date");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    [
      ["city", city],
      ["dateFrom", dateFrom],
      ["dateTo", dateTo],
      ["minPrice", minPrice],
      ["maxPrice", maxPrice],
    ].forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");

    router.push(`/eventos?${params.toString()}`);
  }

  function clearFilters() {
    setSearch("");
    setCity("");
    setDateFrom("");
    setDateTo("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("date");
    router.push("/eventos");
  }

  return (
    <aside className="rounded-lg border border-surface-2 bg-surface p-4 lg:sticky lg:top-24 lg:h-fit">
      <div className="mb-5 flex items-center gap-2 text-sm font-bold text-text">
        <SlidersHorizontal className="h-4 w-4 text-accent" />
        Filtros
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 text-accent" />
            Buscar
          </span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 rounded-md border border-surface-2 bg-background px-3 text-sm outline-none focus:border-accent"
            placeholder="Nome do evento..."
          />
        </label>
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Categoria</span>
          <Categories activeCategory={searchParams.get("category") || undefined} />
        </div>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Cidade
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="h-10 rounded-md border border-surface-2 bg-background px-3 text-sm outline-none focus:border-accent"
            placeholder="São Paulo"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          <span className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-accent" />
            Ordenar por
          </span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-10 rounded-md border border-surface-2 bg-background px-3 text-sm outline-none focus:border-accent"
          >
            <option value="date">Data (mais recente)</option>
            <option value="date-asc">Data (mais antiga)</option>
            <option value="price-asc">Preço (menor)</option>
            <option value="price-desc">Preço (maior)</option>
            <option value="title">Nome (A-Z)</option>
          </select>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <label className="flex flex-col gap-2 text-sm font-semibold text-text">
            De
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-10 rounded-md border border-surface-2 bg-background px-3 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-text">
            Até
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="h-10 rounded-md border border-surface-2 bg-background px-3 text-sm outline-none focus:border-accent"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2 text-sm font-semibold text-text">
            Mín.
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="h-10 rounded-md border border-surface-2 bg-background px-3 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-text">
            Máx.
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="h-10 rounded-md border border-surface-2 bg-background px-3 text-sm outline-none focus:border-accent"
            />
          </label>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <button
            type="submit"
            className="h-10 rounded-md bg-accent px-4 text-sm font-bold text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90"
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="h-10 rounded-md border border-surface-2 px-4 text-sm font-bold text-text transition-colors hover:bg-background"
          >
            Limpar
          </button>
        </div>
      </form>
    </aside>
  );
}
