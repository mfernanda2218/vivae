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

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface RegisterResponse {
    accessToken: string;
    user: User;
}