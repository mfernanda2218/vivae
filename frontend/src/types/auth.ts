// types/auth.ts
export type UserRole = "CUSTOMER" | "ORGANIZER" | "GATE" | "ADMIN";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    user: User;
}