// components/AuthProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    isAuthenticated: boolean;
    user: { name: string; role: string } | null;
    login: (token: string, user: { name: string; role: string }) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("vivae_token");
        const userData = localStorage.getItem("vivae_user");

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setIsAuthenticated(true);
                setUser(parsedUser);
            } catch {
                setIsAuthenticated(false);
                setUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    }, []);

    const login = (token: string, user: { name: string; role: string }) => {
        localStorage.setItem("vivae_token", token);
        localStorage.setItem("vivae_user", JSON.stringify(user));
        setIsAuthenticated(true);
        setUser(user);
        router.refresh();
    };

    const logout = () => {
        localStorage.removeItem("vivae_token");
        localStorage.removeItem("vivae_user");
        setIsAuthenticated(false);
        setUser(null);
        router.push("/");
        router.refresh();
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}