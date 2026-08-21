import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function ErrorState({
  title = "Nao foi possivel carregar",
  description = "Tente novamente em instantes.",
  action,
}: ErrorStateProps) {
  return (
    <section className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg border border-error/40 bg-error/10 p-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-background text-error">
        <TriangleAlert className="h-6 w-6" />
      </span>
      <div className="max-w-md">
        <h1 className="text-2xl font-black text-text">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </section>
  );
}
