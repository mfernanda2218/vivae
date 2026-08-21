"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="Algo saiu do trilho"
      description="Nao conseguimos renderizar esta tela agora."
      action={
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-accent px-4 py-2 text-sm font-black text-background transition-colors hover:bg-accent/90"
        >
          Tentar novamente
        </button>
      }
    />
  );
}
