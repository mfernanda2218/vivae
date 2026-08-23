// app/cadastro/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, ShieldCheck, User, UserPlus } from "lucide-react";
import { register } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import { roleHome, Role } from "@/components/RoleGuard";

export default function RegisterPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [role, setRole] = useState<"CUSTOMER" | "ORGANIZER" | "GATE">("CUSTOMER");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("A senha deve ter no mínimo 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await register({
                name,
                email,
                password,
                role,
            });

            // Salvar no localStorage
            localStorage.setItem("vivae_token", response.accessToken);
            localStorage.setItem("vivae_user", JSON.stringify(response.user));

            showToast({
                title: "Conta criada com sucesso",
                description: `Bem-vindo(a), ${response.user.name}!`,
                variant: "success",
            });

            // Redirecionar baseado no role
            const userRole = response.user.role as Role;
            const destination = roleHome[userRole] || "/eventos";

            // Usar window.location para forçar navegação completa
            window.location.href = destination;

        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Não foi possível criar a conta.";
            setError(message);
            showToast({
                title: "Erro no cadastro",
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
                    <h1 className="text-3xl font-black text-text">Criar conta</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Comece a descobrir eventos incríveis
                    </p>
                </div>
            </div>

            {/* Formulário */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 rounded-lg border border-surface-2 bg-surface p-6"
            >
                {/* Campo Nome */}
                <label className="flex flex-col gap-2 text-sm font-bold text-text">
                    <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-accent" />
                        Nome completo
                    </span>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Seu nome completo"
                        required
                        minLength={2}
                        maxLength={120}
                        autoComplete="name"
                        className="h-11 rounded-md border border-surface-2 bg-background px-3 text-sm text-text outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
                    />
                </label>

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
                            autoComplete="new-password"
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

                {/* Campo Confirmar Senha */}
                <label className="flex flex-col gap-2 text-sm font-bold text-text">
                    <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-accent" />
                        Confirmar senha
                    </span>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Repita a senha"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="h-11 rounded-md border border-surface-2 bg-background px-3 text-sm text-text outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
                    />
                </label>

                {/* Seletor de Tipo de Conta */}
                <div className="flex flex-col gap-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-text">
                        <UserPlus className="h-4 w-4 text-accent" />
                        Tipo de conta
                    </span>
                    <div className="grid gap-2 sm:grid-cols-3">
                        <button
                            type="button"
                            onClick={() => setRole("CUSTOMER")}
                            className={`rounded-md border p-3 text-center transition-all ${role === "CUSTOMER"
                                ? "border-accent bg-accent/10"
                                : "border-surface-2 hover:bg-surface-2"
                                }`}
                        >
                            <span className="block text-sm font-bold text-text">Cliente</span>
                            <span className="text-xs text-muted-foreground">Compra ingressos</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("ORGANIZER")}
                            className={`rounded-md border p-3 text-center transition-all ${role === "ORGANIZER"
                                ? "border-accent bg-accent/10"
                                : "border-surface-2 hover:bg-surface-2"
                                }`}
                        >
                            <span className="block text-sm font-bold text-text">Organizador</span>
                            <span className="text-xs text-muted-foreground">Cria eventos</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("GATE")}
                            className={`rounded-md border p-3 text-center transition-all ${role === "GATE"
                                ? "border-accent bg-accent/10"
                                : "border-surface-2 hover:bg-surface-2"
                                }`}
                        >
                            <span className="block text-sm font-bold text-text">Portaria</span>
                            <span className="text-xs text-muted-foreground">Valida ingressos</span>
                        </button>
                    </div>
                </div>

                {/* Mensagem de erro */}
                {error && (
                    <div className="rounded-md border border-error/40 bg-error/10 p-3 text-sm text-error">
                        {error}
                    </div>
                )}

                {/* Botão Criar Conta */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-black text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 disabled:translate-y-0 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <UserPlus className="h-4 w-4" />
                    )}
                    {isSubmitting ? "Criando conta..." : "Criar conta gratuita"}
                </button>
            </form>

            {/* Rodapé */}
            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Já tem uma conta?{" "}
                    <Link href="/login" className="font-bold text-accent transition-colors hover:text-accent/90">
                        Fazer login
                    </Link>
                </p>
            </div>
        </section>
    );
}