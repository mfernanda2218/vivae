// components/RoleGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export type Role = "CUSTOMER" | "ORGANIZER" | "GATE";

const roleRoutes: Record<Role, string[]> = {
    CUSTOMER: ["/eventos", "/meus-ingressos", "/checkout", "/checkout/sucesso", "/checkout/erro"],
    ORGANIZER: ["/dashboard", "/eventos"],
    GATE: ["/portaria", "/eventos"],
};

export const roleHome: Record<Role, string> = {
    CUSTOMER: "/eventos",
    ORGANIZER: "/dashboard",
    GATE: "/portaria",
};

export function RoleGuard({
    children,
    allowedRoles
}: {
    children: React.ReactNode;
    allowedRoles: Role[];
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<{ role: Role } | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem("vivae_user");

        if (!userData) {
            router.push("/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(userData) as { role: Role };
            setUser(parsedUser);

            if (!allowedRoles.includes(parsedUser.role)) {
                // Redirecionar para a área correta do role
                router.push(roleHome[parsedUser.role] || "/eventos");
                return;
            }
        } catch {
            router.push("/login");
            return;
        }

        setIsLoading(false);
    }, [router, allowedRoles]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
        );
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}