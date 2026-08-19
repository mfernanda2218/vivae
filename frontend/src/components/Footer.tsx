export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-white py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} Vivae. Todos os direitos reservados.
      </div>
    </footer>
  );
}
