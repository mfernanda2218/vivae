type LoadingStateProps = {
  title?: string;
  rows?: number;
};

export function LoadingState({ title = "Carregando", rows = 4 }: LoadingStateProps) {
  return (
    <section className="flex flex-col gap-5" aria-live="polite" aria-busy="true">
      <div className="flex flex-col gap-2">
        <span className="h-4 w-24 animate-pulse rounded-md bg-surface-2" />
        <h1 className="text-2xl font-black text-text">{title}</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="min-h-[220px] animate-pulse rounded-lg border border-surface-2 bg-surface p-4"
          >
            <div className="mb-4 aspect-[16/10] rounded-md bg-surface-2" />
            <div className="space-y-3">
              <div className="h-4 w-2/3 rounded-md bg-surface-2" />
              <div className="h-4 w-full rounded-md bg-surface-2" />
              <div className="h-4 w-1/2 rounded-md bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
