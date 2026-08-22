// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, Mail, ShieldCheck, User } from "lucide-react";
import { login } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const response = await login({ email, password });

            // Salvar token e user ID no localStorage/sessionStorage
            localStorage.setItem("vivae_token", response.accessToken);
            localStorage.setItem("vivae_user", JSON.stringify(response.user));

            showToast({
                title: "Login realizado",
                description: `Bem-vindo(a), ${response.user.name}!`,
                variant: "success",
            });

            // Redirecionar baseado no role
            const destination =
                response.user.role === "ORGANIZER" || response.user.role === "GATE"
                    ? "/dashboard"
                    : "/eventos";

            router.push(destination);
            router.refresh();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Credenciais inválidas. Verifique seu e-mail e senha.";
            setError(message);
            showToast({
                title: "Erro no login",
                description: message,
                variant: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="mx-auto flex w-full max-w-md flex-col gap-6">
            {/* Cabeçalho */}
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
                    <span className="text-xl font-black tracking-tight text-accent">V</span>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-text">Bem-vindo de volta</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Entre na sua conta para continuar
                    </p>
                </div>
            </div>

            {/* Formulário */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 rounded-lg border border-surface-2 bg-surface p-6"
            >
                {/* Campo Email */}
                <label className="flex flex-col gap-2 text-sm font-bold text-text">
                    <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-accent" />
                        E-mail
                    </span>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="seu@email.com"
                        required
                        autoComplete="email"
                        className="h-11 rounded-md border border-surface-2 bg-background px-3 text-sm text-text outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
                    />
                </label>

                {/* Campo Senha */}
                <label className="flex flex-col gap-2 text-sm font-bold text-text">
                    <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-accent" />
                        Senha
                    </span>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            required
                            minLength={8}
                            autoComplete="current-password"
                            className="h-11 w-full rounded-md border border-surface-2 bg-background px-3 pr-11 text-sm text-text outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((current) => !current)}
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-text"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </label>

                {/* Mensagem de erro */}
                {error && (
                    <div className="rounded-md border border-error/40 bg-error/10 p-3 text-sm text-error">
                        {error}
                    </div>
                )}

                {/* Botão Entrar */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-black text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 disabled:translate-y-0 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <LogIn className="h-4 w-4" />
                    )}
                    {isSubmitting ? "Entrando..." : "Entrar na conta"}
                </button>
            </form>

            {/* Rodapé */}
            <div className="flex flex-col gap-4 text-center">
                <p className="text-sm text-muted-foreground">
                    Não tem uma conta?{" "}
                    <Link href="/cadastro" className="font-bold text-accent transition-colors hover:text-accent/90">
                        Criar conta gratuita
                    </Link>
                </p>

                {/* Demo roles */}
                <div className="rounded-lg border border-surface-2 bg-surface p-4">
                    <span className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground">
                        <User className="h-3.5 w-3.5 text-accent" />
                        Contas de demonstração
                    </span>
                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between rounded-md bg-background px-3 py-2">
                            <span>Cliente</span>
                            <code className="text-accent">cliente@vivae.app</code>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-background px-3 py-2">
                            <span>Organizador</span>
                            <code className="text-accent">organizador@vivae.app</code>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-background px-3 py-2">
                            <span>Portaria</span>
                            <code className="text-accent">portaria@vivae.app</code>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground/80">
                        Senha para todas: <code className="text-accent">password123</code>
                    </p>
                </div>
            </div>
        </section>
    );
}