// lib/roles.ts
export type Role = "CUSTOMER" | "ORGANIZER" | "GATE";

export const roleHome: Record<Role, string> = {
    CUSTOMER: "/eventos",
    ORGANIZER: "/dashboard",
    GATE: "/portaria",
};

export const roleRoutes: Record<Role, string[]> = {
    CUSTOMER: ["/eventos", "/meus-ingressos", "/checkout", "/checkout/sucesso", "/checkout/erro"],
    ORGANIZER: ["/dashboard", "/eventos", "/portaria"],
    GATE: ["/portaria", "/eventos"],
};

// Rotas que não exigem autenticação
export const publicRoutes = ["/", "/login", "/cadastro"];

// Rotas de compra que clientes podem acessar com redirect
export const purchaseRoutes = ["/eventos/", "/checkout"];