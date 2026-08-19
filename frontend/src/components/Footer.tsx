export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-surface-2 bg-surface py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} Vivae. Todos os direitos reservados.
      </div>
    </footer>
  );
}
