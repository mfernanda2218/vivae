import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "Vivae - Descubra eventos",
  description: "Descubra shows, festivais, teatro e esportes perto de você.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col bg-background text-text">
        <ToastProvider>
          <Header />
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
