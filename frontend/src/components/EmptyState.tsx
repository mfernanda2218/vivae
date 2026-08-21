import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-surface-2 bg-surface/50 p-6 text-center sm:p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-background text-accent">
        <Icon className="h-6 w-6" />
      </span>
      <div className="max-w-md">
        <h2 className="text-xl font-black text-text">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="rounded-md bg-accent px-4 py-2 text-sm font-black text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
