// components/AuthProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    isAuthenticated: boolean;
    user: { name: string; role: string; id: string } | null;
    login: (accessToken: string, user: { name: string; role: string; id: string }) => void;
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
    const [user, setUser] = useState<{ name: string; role: string; id: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const authData = localStorage.getItem("vivae_auth");

        if (authData) {
            try {
                const parsedAuth = JSON.parse(authData);
                setIsAuthenticated(true);
                setUser(parsedAuth.user);
            } catch {
                setIsAuthenticated(false);
                setUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    }, []);

    const login = (accessToken: string, user: { name: string; role: string; id: string }) => {
        localStorage.setItem("vivae_auth", JSON.stringify({ accessToken, user }));
        setIsAuthenticated(true);
        setUser(user);
        router.refresh();
    };

    const logout = () => {
        localStorage.removeItem("vivae_auth");
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